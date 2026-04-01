// ============================================================
// src/app/api/stripe/checkout/route.ts
// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for a booking.
// Supports full payment or deposit.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { booking_id, payment_type } = body; // payment_type: 'full' | 'deposit'

  if (!booking_id || !payment_type) {
    return NextResponse.json({ error: 'booking_id and payment_type are required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch booking with related service + specialist
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(name, duration_minutes, price_eur, deposit_eur),
      specialist:specialists(name)
    `)
    .eq('id', booking_id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.payment_status !== 'unpaid') {
    return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
  }

  const service    = booking.service as { name: string; duration_minutes: number; price_eur: number; deposit_eur: number };
  const specialist = booking.specialist as { name: string };

  // Determine amount
  let amountEur: number;
  let description: string;

  if (payment_type === 'deposit') {
    if (!service.deposit_eur) {
      return NextResponse.json({ error: 'This service has no deposit option' }, { status: 400 });
    }
    amountEur   = service.deposit_eur;
    description = `Señal — ${service.name} con ${specialist.name}`;
  } else {
    if (!service.price_eur) {
      return NextResponse.json({ error: 'This service has no price set' }, { status: 400 });
    }
    amountEur   = service.price_eur;
    description = `${service.name} con ${specialist.name}`;
  }

  const amountCents = Math.round(amountEur * 100);

  // Format booking date for display
  const bookingDate = new Date(booking.starts_at).toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://misaludv3.vercel.app';

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: booking.client_email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: description,
            description: `${bookingDate} · ${service.duration_minutes} min`,
            metadata: { booking_id },
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      booking_id,
      payment_type,
      client_email: booking.client_email,
      client_name:  booking.client_name,
    },
    success_url: `${baseUrl}/reserva/confirmacion?booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/reserva/cancelada?booking_id=${booking_id}`,
    expires_at:  Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 min
  });

  // Save session ID to booking
  await supabase
    .from('bookings')
    .update({ stripe_session_id: session.id })
    .eq('id', booking_id);

  return NextResponse.json({ checkout_url: session.url, session_id: session.id });
}
