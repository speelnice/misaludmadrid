// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature') ?? '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const body   = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const citaId  = session.metadata?.citaId;

    if (citaId && session.payment_status === 'paid') {
      await supabase
        .from('citas')
        .update({
          estado:           'confirmada',
          pago_estado:      'pagado',
          pago_importe_eur: (session.amount_total ?? 0) / 100,
          pago_stripe_id:   session.payment_intent as string,
          updated_at:       new Date().toISOString(),
        })
        .eq('id', citaId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const citaId  = session.metadata?.citaId;
    if (citaId) {
      await supabase
        .from('citas')
        .update({ pago_estado: 'expirado', updated_at: new Date().toISOString() })
        .eq('id', citaId);
    }
  }

  return NextResponse.json({ received: true });
}
