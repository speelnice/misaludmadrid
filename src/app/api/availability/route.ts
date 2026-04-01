// ============================================================
// src/app/api/availability/route.ts
// GET /api/availability?specialistId=...&date=...&serviceId=...
// Returns available time slots for a given specialist + date
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const specialistId = searchParams.get('specialistId');
  const date         = searchParams.get('date');         // YYYY-MM-DD
  const serviceId    = searchParams.get('serviceId');    // optional
  const centroId     = searchParams.get('centroId');     // optional

  // --- Validate required params ---
  if (!specialistId || !date) {
    return NextResponse.json(
      { error: 'specialistId and date are required' },
      { status: 400 }
    );
  }

  // Date format validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'date must be in YYYY-MM-DD format' },
      { status: 400 }
    );
  }

  // Don't serve slots for past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(date) < today) {
    return NextResponse.json({ date, slots: [] });
  }

  // --- Optionally fetch service duration ---
  let durationMinutes = 60;

  if (serviceId) {
    const supabase = await createClient();
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single();

    if (service?.duration_minutes) {
      durationMinutes = service.duration_minutes;
    }
  }

  // --- Fetch booking settings for buffer ---
  let bufferMinutes = 0;
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'booking')
      .single();

    if (settings?.value?.buffer_minutes) {
      bufferMinutes = Number(settings.value.buffer_minutes);
    }
  } catch {
    // Non-critical — proceed with 0 buffer
  }

  // --- Get slots ---
  const result = await getAvailableSlots({
    specialistId,
    date,
    centroId: centroId ?? undefined,
    durationMinutes,
    bufferMinutes,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Return only available slots to the client (don't leak busy times)
  const publicSlots = result.slots
    .filter(s => s.available)
    .map(s => ({ slot_start: s.slot_start, slot_end: s.slot_end }));

  return NextResponse.json(
    { date, slots: publicSlots, duration_minutes: durationMinutes },
    {
      status: 200,
      headers: {
        // Cache for 60 seconds — slots change as bookings come in
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    }
  );
}
