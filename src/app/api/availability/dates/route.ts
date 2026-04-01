// ============================================================
// src/app/api/availability/dates/route.ts
// GET /api/availability/dates?specialistId=...&from=...&to=...
// Returns array of dates that have at least one free slot.
// Used by the calendar to highlight bookable days.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableDates } from '@/lib/availability';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const specialistId = searchParams.get('specialistId');
  const from         = searchParams.get('from');   // YYYY-MM-DD
  const to           = searchParams.get('to');     // YYYY-MM-DD
  const centroId     = searchParams.get('centroId');
  const duration     = searchParams.get('duration'); // minutes

  if (!specialistId || !from || !to) {
    return NextResponse.json(
      { error: 'specialistId, from, and to are required' },
      { status: 400 }
    );
  }

  // Limit range to 60 days max to prevent abuse
  const fromDate = new Date(from);
  const toDate   = new Date(to);
  const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays > 60) {
    return NextResponse.json(
      { error: 'Date range cannot exceed 60 days' },
      { status: 400 }
    );
  }

  const availableDates = await getAvailableDates({
    specialistId,
    fromDate: from,
    toDate: to,
    centroId: centroId ?? undefined,
    durationMinutes: duration ? Number(duration) : 60,
  });

  return NextResponse.json(
    { available_dates: availableDates },
    {
      headers: {
        // Cache calendar data for 5 minutes
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}
