// src/app/api/checkout/route.ts
// POST — creates a Stripe Checkout session for a cita deposit or full payment

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { citaId, mode } = await req.json();
    if (!citaId) return NextResponse.json({ error: 'citaId required' }, { status: 400 });

    const supabase = await createClient();

    const { data: cita } = await supabase
      .from('citas')
      .select(`
        id, patient_name, patient_email, fecha, hora_inicio,
        services ( name, price_eur, deposit_eur )
      `)
      .eq('id', citaId)
      .single();

    if (!cita) return NextResponse.json({ error: 'Cita not found' }, { status: 404 });

    const svc = (Array.isArray(cita.services) ? cita.services[0] : cita.services) as { name: string; price_eur: number | null; deposit_eur: number | null } | null;

    const amountEur = mode === 'deposit'
      ? (svc?.deposit_eur ?? svc?.price_eur ?? 0)
      : (svc?.price_eur ?? 0);

    if (!amountEur || amountEur <= 0) {
      return NextResponse.json({ error: 'No amount configured for this service' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://misaludv3.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: cita.patient_email,
      metadata: {
        citaId,
        paymentMode: mode ?? 'deposit',
      },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(amountEur * 100),
          product_data: {
            name: svc?.name ?? 'Cita médica',
            description: `${cita.fecha} a las ${cita.hora_inicio} · ${cita.patient_name}`,
          },
        },
      }],
      payment_method_types: ['card', 'google_pay', 'apple_pay', 'bizum', 'sepa_debit'],
      success_url: `${siteUrl}/reservar/confirmacion?citaId=${citaId}&paid=true`,
      cancel_url:  `${siteUrl}/reservar/confirmacion?citaId=${citaId}&paid=cancelled`,
      locale: 'es',
    });

    return NextResponse.json({ url: session.url });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
