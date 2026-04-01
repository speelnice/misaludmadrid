// ============================================================
// src/lib/notifications.ts
// Central dispatcher — reads booking data, sends all channels
// Called by: API routes, Supabase Edge Function, or cron job
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendClientConfirmation,
  sendSpecialistAlert,
  sendAdminAlert,
  sendReminder,
  type BookingEmailData,
} from './email';
import {
  sendSpecialistWhatsApp,
  sendAdminWhatsApp,
  sendClientReminderWhatsApp,
} from './whatsapp';

// ============================================================
// processNotification — handles a single notification row
// ============================================================
export async function processNotification(notificationId: string) {
  const supabase = createAdminClient();

  // Fetch notification + full booking data
  const { data: notif, error } = await supabase
    .from('notifications')
    .select(`
      *,
      booking:bookings(
        *,
        service:services(name, duration_minutes, price_eur, deposit_eur),
        specialist:specialists(name, title, user_email, phone),
        centro:centros(name, address)
      )
    `)
    .eq('id', notificationId)
    .single();

  if (error || !notif) {
    console.error('Notification not found:', notificationId);
    return;
  }

  const b       = notif.booking;
  const service = b.service as any;
  const spec    = b.specialist as any;
  const centro  = b.centro as any;

  const data: BookingEmailData = {
    booking_id:       b.id,
    client_name:      b.client_name,
    client_email:     b.client_email,
    client_phone:     b.client_phone,
    service_name:     service?.name,
    specialist_name:  spec?.name,
    specialist_email: spec?.user_email,
    centro_name:      centro?.name,
    location_type:    b.location_type,
    home_address:     b.home_address,
    starts_at:        b.starts_at,
    ends_at:          b.ends_at,
    price_eur:        service?.price_eur,
    deposit_eur:      service?.deposit_eur,
    payment_status:   b.payment_status,
    status:           b.status,
  };

  let result: any;

  try {
    switch (notif.type) {
      case 'email_client':
        result = await sendClientConfirmation(data);
        break;
      case 'email_specialist':
        result = await sendSpecialistAlert(data);
        break;
      case 'email_admin':
        result = await sendAdminAlert(data);
        break;
      case 'whatsapp_specialist':
        if (spec?.phone) result = await sendSpecialistWhatsApp(data, spec.phone);
        break;
      case 'whatsapp_admin':
        result = await sendAdminWhatsApp(data);
        break;
      default:
        console.warn('Unknown notification type:', notif.type);
        return;
    }

    // Mark as sent
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notificationId);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Notification ${notificationId} failed:`, msg);

    // Mark as failed with error message
    await supabase
      .from('notifications')
      .update({ status: 'failed', error: msg })
      .eq('id', notificationId);
  }
}

// ============================================================
// processPendingNotifications — process all pending in queue
// Call from a cron job or Supabase Edge Function
// ============================================================
export async function processPendingNotifications(limit = 20) {
  const supabase = createAdminClient();

  const { data: pending } = await supabase
    .from('notifications')
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!pending || pending.length === 0) return { processed: 0 };

  await Promise.allSettled(
    pending.map(n => processNotification(n.id))
  );

  return { processed: pending.length };
}

// ============================================================
// scheduleReminders — find bookings due for 24h reminder
// Call from a daily cron job
// ============================================================
export async function scheduleReminders() {
  const supabase = createAdminClient();

  const now       = new Date();
  const in24h     = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h     = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Find confirmed bookings starting in 24–25h that haven't had a reminder yet
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, client_email, client_phone')
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .gte('starts_at', in24h.toISOString())
    .lte('starts_at', in25h.toISOString());

  if (!bookings || bookings.length === 0) return { scheduled: 0 };

  for (const booking of bookings) {
    // Queue email reminder
    await supabase.from('notifications').insert({
      booking_id: booking.id,
      type: 'email_client',
      status: 'pending',
    });

    // Queue WhatsApp reminder if client has phone
    if (booking.client_phone) {
      await supabase.from('notifications').insert({
        booking_id: booking.id,
        type: 'whatsapp_specialist', // reuse type — handled differently in dispatcher
        status: 'pending',
      });
    }

    // Mark reminder as scheduled
    await supabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id);
  }

  return { scheduled: bookings.length };
}
