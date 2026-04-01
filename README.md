# MiSalud — Step 5: Email & WhatsApp Notifications

## Files

| File | Destination |
|---|---|
| src/lib/email.ts | src/lib/email.ts |
| src/lib/whatsapp.ts | src/lib/whatsapp.ts |
| src/lib/notifications.ts | src/lib/notifications.ts |
| src/app/api/notifications/route.ts | src/app/api/notifications/route.ts |
| vercel.json | vercel.json (merge into existing if any) |
| notifications-schema.sql | Run in Supabase SQL Editor |

## Install packages

npm install resend twilio

## Environment variables (add in Vercel)

# Email — Resend (resend.com — free tier: 3,000 emails/month)
RESEND_API_KEY=re_...
EMAIL_FROM=MiSalud <hola@misalud.es>
ADMIN_EMAIL=admin@misalud.es

# WhatsApp — Twilio (twilio.com)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=whatsapp:+34600000000

# Cron protection
CRON_SECRET=a-long-random-secret

## What triggers notifications?

1. Webhook route (stripe/webhook) inserts rows into notifications table
   after a successful payment.

2. The /api/notifications endpoint (POST) processes the queue —
   Vercel Cron calls it every 5 minutes automatically.

3. The /api/notifications endpoint (GET) schedules 24h reminders —
   Vercel Cron calls it daily at 9am.

## Emails sent

- Client confirmation    (after payment confirmed)
- Specialist alert       (after payment confirmed)
- Admin alert            (after payment confirmed)
- Client 24h reminder    (the day before)

## WhatsApp messages sent

- Specialist alert       (after payment confirmed)
- Admin alert            (after payment confirmed)
- Client 24h reminder    (if phone provided)

## Twilio sandbox for testing

1. Go to Twilio Console → Messaging → Try it out → WhatsApp
2. Send "join <sandbox-code>" from your phone to whatsapp:+14155238886
3. Messages will arrive on your personal WhatsApp number
