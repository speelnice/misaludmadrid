// ============================================================
// src/app/api/stripe/webhook/route.ts
// POST /api/stripe/webhook
// Handles Stripe events — updates booking status on payment.
// IMPORTANT: Set this URL in Stripe Dashboard → Webhooks
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// Stripe requires raw body — disable Next.js body parsing
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig     = req.headers.get('stripe-signature');
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Use admin client to bypass RLS for server-side updates
  const supabase = createAdminClient();

  switch (event.type) {

    // --------------------------------------------------------
    // Payment completed successfully
    // --------------------------------------------------------
    case 'checkout.session.completed': {
      const session     = event.data.object as Stripe.Checkout.Session;
      const booking_id  = session.metadata?.booking_id;
      const paymentType = session.metadata?.payment_type;

      if (!booking_id) break;

      const paymentStatus = paymentType === 'deposit' ? 'deposit_paid' : 'paid';

      await supabase
        .from('bookings')
        .update({
          payment_status:   paymentStatus,
          status:           'confirmed',
          stripe_session_id:  session.id,
          stripe_payment_id:  session.payment_intent as string,
        })
        .eq('id', booking_id);

      // Queue confirmation notifications
      await supabase.from('notifications').insert([
        { booking_id, type: 'email_client',    status: 'pending' },
        { booking_id, type: 'email_specialist', status: 'pending' },
        { booking_id, type: 'email_admin',     status: 'pending' },
      ]);

      console.log(`✅ Booking ${booking_id} confirmed — payment ${paymentStatus}`);
      break;
    }

    // --------------------------------------------------------
    // Payment failed or session expired
    // --------------------------------------------------------
    case 'checkout.session.expired': {
      const session    = event.data.object as Stripe.Checkout.Session;
      const booking_id = session.metadata?.booking_id;
      if (!booking_id) break;

      // Only cancel if still unpaid (don't override confirmed bookings)
      await supabase
        .from('bookings')
        .update({ status: 'cancelled', cancelled_by: 'client', cancel_reason: 'Pago no completado' })
        .eq('id', booking_id)
        .eq('payment_status', 'unpaid');

      console.log(`⏰ Booking ${booking_id} cancelled — checkout session expired`);
      break;
    }

    // --------------------------------------------------------
    // Refund issued
    // --------------------------------------------------------
    case 'charge.refunded': {
      const charge     = event.data.object as Stripe.Charge;
      const paymentId  = charge.payment_intent as string;

      if (paymentId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded', status: 'cancelled' })
          .eq('stripe_payment_id', paymentId);

        console.log(`💸 Booking refunded — payment intent ${paymentId}`);
      }
      break;
    }

    default:
      // Silently ignore unhandled events
      break;
  }

  return NextResponse.json({ received: true });
}
