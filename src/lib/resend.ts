// src/lib/resend.ts
// Resend client — requires RESEND_API_KEY in .env.local
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY not set — emails will not be sent.');
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? '');

// Sender address — update to match your verified Resend domain
export const FROM_ADDRESS = process.env.RESEND_FROM ?? 'MiSalud <citas@misalud.es>';
