// ============================================================
// src/lib/email.ts
// Email notifications via Resend
// Install: npm install resend
// ============================================================

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM      = process.env.EMAIL_FROM      || 'MiSalud <hola@misalud.es>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL   || 'admin@misalud.es';
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://misaludv3.vercel.app';

export type BookingEmailData = {
  booking_id:      string;
  client_name:     string;
  client_email:    string;
  client_phone?:   string;
  service_name:    string;
  specialist_name: string;
  specialist_email?: string;
  centro_name?:    string;
  location_type:   'centro' | 'home';
  home_address?:   string;
  starts_at:       string;
  ends_at:         string;
  price_eur?:      number;
  deposit_eur?:    number;
  payment_status:  string;
  status:          string;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function fmtDuration(start: string, end: string) {
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  return `${mins} min`;
}

// ============================================================
// Client confirmation email
// ============================================================
export async function sendClientConfirmation(data: BookingEmailData) {
  const location = data.location_type === 'home'
    ? `A domicilio — ${data.home_address}`
    : data.centro_name || 'En centro';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:#01696f;padding:2rem;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:1.5rem;font-weight:400;letter-spacing:-0.02em;">MiSalud</h1>
      <p style="margin:0.5rem 0 0;color:rgba(255,255,255,0.8);font-size:0.9rem;">Tu cita ha sido confirmada ✓</p>
    </div>

    <!-- Body -->
    <div style="padding:2rem;">
      <p style="color:#28251d;font-size:1rem;margin:0 0 1.5rem;">
        Hola <strong>${data.client_name}</strong>, tu reserva está confirmada. Aquí tienes los detalles:
      </p>

      <!-- Booking details card -->
      <div style="background:#f7f6f2;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
        ${row('Servicio',     data.service_name)}
        ${row('Especialista', data.specialist_name)}
        ${row('Fecha y hora', fmtDate(data.starts_at))}
        ${row('Duración',     fmtDuration(data.starts_at, data.ends_at))}
        ${row('Lugar',        location)}
        ${data.price_eur ? row('Precio', data.payment_status === 'paid' ? `${data.price_eur}€ (pagado)` : `${data.price_eur}€`) : ''}
        ${data.deposit_eur && data.payment_status === 'deposit_paid' ? row('Señal pagada', `${data.deposit_eur}€`) : ''}
      </div>

      <p style="color:#7a7974;font-size:0.85rem;line-height:1.6;margin:0 0 1.5rem;">
        Si necesitas cancelar o modificar tu cita, contáctanos con al menos <strong>24 horas de antelación</strong> por WhatsApp o email.
      </p>

      <a href="${SITE_URL}" style="display:inline-block;background:#01696f;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;">
        Visitar MiSalud
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:1.25rem 2rem;border-top:1px solid #e5e4e0;text-align:center;">
      <p style="margin:0;color:#bab9b4;font-size:0.75rem;">
        MiSalud · Madrid · <a href="mailto:hola@misalud.es" style="color:#bab9b4;">hola@misalud.es</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      data.client_email,
    subject: `✓ Cita confirmada — ${data.service_name} el ${fmtDate(data.starts_at)}`,
    html,
  });
}

// ============================================================
// Specialist alert email
// ============================================================
export async function sendSpecialistAlert(data: BookingEmailData) {
  if (!data.specialist_email) return { error: 'No specialist email' };

  const location = data.location_type === 'home'
    ? `A domicilio — ${data.home_address}`
    : data.centro_name || 'En centro';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#28251d;padding:1.5rem 2rem;">
      <h1 style="margin:0;color:#fff;font-size:1.25rem;font-weight:400;">Nueva reserva — MiSalud</h1>
    </div>
    <div style="padding:2rem;">
      <p style="color:#28251d;font-size:1rem;margin:0 0 1.25rem;">
        Tienes una nueva cita reservada:
      </p>
      <div style="background:#f7f6f2;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
        ${row('Cliente',      data.client_name)}
        ${row('Email',        data.client_email)}
        ${data.client_phone ? row('Teléfono', data.client_phone) : ''}
        ${row('Servicio',     data.service_name)}
        ${row('Fecha y hora', fmtDate(data.starts_at))}
        ${row('Duración',     fmtDuration(data.starts_at, data.ends_at))}
        ${row('Lugar',        location)}
        ${row('Pago',         data.payment_status === 'paid' ? 'Pagado completo' : data.payment_status === 'deposit_paid' ? 'Señal pagada' : 'Pendiente de pago')}
      </div>
      <a href="${SITE_URL}/admin" style="display:inline-block;background:#28251d;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;">
        Ver en el panel
      </a>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      data.specialist_email,
    subject: `Nueva cita: ${data.client_name} — ${fmtDate(data.starts_at)}`,
    html,
  });
}

// ============================================================
// Admin alert email
// ============================================================
export async function sendAdminAlert(data: BookingEmailData) {
  const location = data.location_type === 'home'
    ? `A domicilio — ${data.home_address}`
    : data.centro_name || 'En centro';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#01696f;padding:1.25rem 2rem;">
      <h1 style="margin:0;color:#fff;font-size:1.1rem;font-weight:600;">📅 Nueva reserva recibida</h1>
    </div>
    <div style="padding:1.5rem 2rem;">
      <div style="background:#f7f6f2;border-radius:8px;padding:1.25rem;">
        ${row('ID',           data.booking_id.slice(0, 8) + '...')}
        ${row('Cliente',      `${data.client_name} (${data.client_email})`)}
        ${data.client_phone ? row('Teléfono', data.client_phone) : ''}
        ${row('Servicio',     data.service_name)}
        ${row('Especialista', data.specialist_name)}
        ${row('Fecha y hora', fmtDate(data.starts_at))}
        ${row('Lugar',        location)}
        ${row('Pago',         data.payment_status)}
        ${data.price_eur ? row('Importe', `${data.price_eur}€`) : ''}
      </div>
      <div style="margin-top:1.25rem;">
        <a href="${SITE_URL}/admin" style="display:inline-block;background:#01696f;color:#fff;padding:0.625rem 1.25rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.85rem;">
          Abrir panel admin →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      ADMIN_EMAIL,
    subject: `[MiSalud] Nueva reserva — ${data.client_name} · ${fmtDate(data.starts_at)}`,
    html,
  });
}

// ============================================================
// Booking reminder (24h before)
// ============================================================
export async function sendReminder(data: BookingEmailData) {
  const location = data.location_type === 'home'
    ? `A domicilio — ${data.home_address}`
    : data.centro_name || 'En centro';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#01696f;padding:2rem;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:1.4rem;font-weight:400;">MiSalud</h1>
      <p style="margin:0.5rem 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Recordatorio de tu cita de mañana ⏰</p>
    </div>
    <div style="padding:2rem;">
      <p style="color:#28251d;font-size:1rem;margin:0 0 1.25rem;">
        Hola <strong>${data.client_name}</strong>, te recordamos tu cita de mañana:
      </p>
      <div style="background:#f7f6f2;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
        ${row('Servicio',     data.service_name)}
        ${row('Especialista', data.specialist_name)}
        ${row('Fecha y hora', fmtDate(data.starts_at))}
        ${row('Lugar',        location)}
      </div>
      <p style="color:#7a7974;font-size:0.85rem;margin:0;">
        ¿Necesitas cancelar? Contáctanos lo antes posible por WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      data.client_email,
    subject: `⏰ Recordatorio: tu cita mañana a las ${new Date(data.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
    html,
  });
}

// ---- helper ----
function row(label: string, value: string) {
  if (!value) return '';
  return `
  <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #e5e4e0;">
    <span style="font-size:0.8rem;color:#7a7974;">${label}</span>
    <span style="font-size:0.8rem;font-weight:500;color:#28251d;text-align:right;max-width:60%;">${value}</span>
  </div>`;
}
