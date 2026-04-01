// ============================================================
// src/app/api/notifications/route.ts
// POST /api/notifications  — process notification queue
// GET  /api/notifications  — trigger reminder scheduling
//
// Protect with CRON_SECRET so only Vercel Cron can call it.
// In vercel.json:
//   { "crons": [{ "path": "/api/notifications", "schedule": "*/5 * * * *" }] }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  processPendingNotifications,
  scheduleReminders,
} from '@/lib/notifications';

function isAuthorised(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode — no secret required
  return auth === `Bearer ${secret}`;
}

// Process notification queue — called every 5 min by Vercel Cron
export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const result = await processPendingNotifications();
  return NextResponse.json(result);
}

// Schedule 24h reminders — called daily by Vercel Cron
export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const result = await scheduleReminders();
  return NextResponse.json(result);
}
