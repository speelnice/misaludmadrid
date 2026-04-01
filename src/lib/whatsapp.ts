// ============================================================
// src/lib/whatsapp.ts
// WhatsApp notifications via Twilio WhatsApp API
// Install: npm install twilio
// Twilio sandbox: whatsapp:+14155238886
// Production: requires approved WhatsApp Business number
// ============================================================

import twilio from 'twilio';
import type { BookingEmailData } from './email';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken  = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const adminPhone = process.env.ADMIN_WHATSAPP_PHONE; // e.g. whatsapp:+34600000000

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!accountSid || !authToken) return null;
  if (!client) client = twilio(accountSid, authToken);
  return client;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ============================================================
// Alert to specialist (new booking)
// ============================================================
export async function sendSpecialistWhatsApp(
  data: BookingEmailData,
  specialistPhone: string
) {
  const twilio = getClient();
  if (!twilio) return { error: 'Twilio not configured' };
  if (!specialistPhone) return { error: 'No specialist phone' };

  const to = specialistPhone.startsWith('whatsapp:')
    ? specialistPhone
    : `whatsapp:${specialistPhone}`;

  const location = data.location_type === 'home'
    ? `🏠 Domicilio: ${data.home_address}`
    : `📍 ${data.centro_name || 'En centro'}`;

  const body = [
    `🗓️ *Nueva reserva — MiSalud*`,
    ``,
    `👤 Cliente: ${data.client_name}`,
    `📞 ${data.client_phone || data.client_email}`,
    `💆 Servicio: ${data.service_name}`,
    `🕐 Fecha: ${fmtDate(data.starts_at)}`,
    `${location}`,
    `💶 Pago: ${data.payment_status === 'paid' ? 'Completado ✅' : data.payment_status === 'deposit_paid' ? 'Señal pagada ✅' : 'Pendiente ⏳'}`,
  ].join('\n');

  return twilio.messages.create({ from: fromNumber, to, body });
}

// ============================================================
// Alert to admin (every new booking)
// ============================================================
export async function sendAdminWhatsApp(data: BookingEmailData) {
  const tw = getClient();
  if (!tw || !adminPhone) return { error: 'Twilio or admin phone not configured' };

  const to = adminPhone.startsWith('whatsapp:') ? adminPhone : `whatsapp:${adminPhone}`;

  const body = [
    `📅 *Nueva reserva recibida*`,
    ``,
    `Cliente: ${data.client_name}`,
    `Servicio: ${data.service_name}`,
    `Especialista: ${data.specialist_name}`,
    `Fecha: ${fmtDate(data.starts_at)}`,
    `Pago: ${data.payment_status}`,
  ].join('\n');

  return tw.messages.create({ from: fromNumber, to, body });
}

// ============================================================
// Reminder to client (24h before)
// ============================================================
export async function sendClientReminderWhatsApp(
  data: BookingEmailData,
  clientPhone: string
) {
  const tw = getClient();
  if (!tw) return { error: 'Twilio not configured' };
  if (!clientPhone) return { error: 'No client phone' };

  const to = clientPhone.startsWith('whatsapp:') ? clientPhone : `whatsapp:${clientPhone}`;

  const location = data.location_type === 'home'
    ? `🏠 A domicilio — ${data.home_address}`
    : `📍 ${data.centro_name}`;

  const body = [
    `⏰ *Recordatorio de cita — MiSalud*`,
    ``,
    `Hola ${data.client_name}, te recordamos tu cita de mañana:`,
    ``,
    `💆 ${data.service_name} con ${data.specialist_name}`,
    `🕐 ${fmtDate(data.starts_at)}`,
    `${location}`,
    ``,
    `¿Necesitas cancelar? Escríbenos lo antes posible.`,
  ].join('\n');

  return tw.messages.create({ from: fromNumber, to, body });
}
