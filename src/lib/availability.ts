// ============================================================
// src/lib/availability.ts
// Availability engine — generates free time slots for a
// specialist on a given date, respecting working hours,
// existing bookings, and blocked times.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import type { TimeSlot, AvailabilityRule, BlockedTime, Booking } from '@/types';

export type GetSlotsParams = {
  specialistId: string;
  date: string;           // YYYY-MM-DD
  centroId?: string;      // optional — filters rules to that centro
  durationMinutes?: number; // defaults to service duration or 60
  bufferMinutes?: number;   // gap after each booking, default 0
};

export type SlotsResult = {
  date: string;
  slots: TimeSlot[];
  error?: string;
};

// ============================================================
// Main export: getAvailableSlots
// ============================================================
export async function getAvailableSlots(params: GetSlotsParams): Promise<SlotsResult> {
  const {
    specialistId,
    date,
    centroId,
    durationMinutes = 60,
    bufferMinutes = 0,
  } = params;

  const supabase = await createClient();

  // Parse date
  const targetDate = new Date(`${date}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { date, slots: [], error: 'Invalid date format. Use YYYY-MM-DD.' };
  }

  const weekday = targetDate.getDay(); // 0=Sun … 6=Sat

  // 1. Fetch availability rules for this specialist + weekday
  let rulesQuery = supabase
    .from('availability_rules')
    .select('*')
    .eq('specialist_id', specialistId)
    .eq('weekday', weekday)
    .eq('active', true);

  // Filter by centro or "all centros" (centro_id IS NULL)
  if (centroId) {
    rulesQuery = rulesQuery.or(`centro_id.eq.${centroId},centro_id.is.null`);
  }

  const { data: rules, error: rulesError } = await rulesQuery;
  if (rulesError) return { date, slots: [], error: rulesError.message };
  if (!rules || rules.length === 0) return { date, slots: [] };

  // 2. Fetch existing bookings for that specialist on that date
  const dayStart = `${date}T00:00:00+00:00`;
  const dayEnd   = `${date}T23:59:59+00:00`;

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('specialist_id', specialistId)
    .not('status', 'in', '("cancelled")')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);

  if (bookingsError) return { date, slots: [], error: bookingsError.message };

  // 3. Fetch blocked times that overlap this day
  const { data: blocks, error: blocksError } = await supabase
    .from('blocked_times')
    .select('starts_at, ends_at')
    .eq('specialist_id', specialistId)
    .lte('starts_at', dayEnd)
    .gte('ends_at', dayStart);

  if (blocksError) return { date, slots: [], error: blocksError.message };

  // 4. Generate slots
  const slots: TimeSlot[] = [];
  const totalSlotMinutes = durationMinutes + bufferMinutes;

  for (const rule of rules as AvailabilityRule[]) {
    const [startH, startM] = rule.start_time.split(':').map(Number);
    const [endH, endM]     = rule.end_time.split(':').map(Number);

    const ruleStart = new Date(targetDate);
    ruleStart.setHours(startH, startM, 0, 0);

    const ruleEnd = new Date(targetDate);
    ruleEnd.setHours(endH, endM, 0, 0);

    let cursor = new Date(ruleStart);

    while (cursor.getTime() + durationMinutes * 60_000 <= ruleEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd   = new Date(cursor.getTime() + durationMinutes * 60_000);

      const available = (
        !overlapsAny(slotStart, slotEnd, bookings as Pick<Booking, 'starts_at' | 'ends_at'>[]) &&
        !overlapsAny(slotStart, slotEnd, blocks as Pick<BlockedTime, 'starts_at' | 'ends_at'>[])
      );

      // Skip slots in the past
      if (slotStart > new Date()) {
        slots.push({
          slot_start: slotStart.toISOString(),
          slot_end:   slotEnd.toISOString(),
          available,
        });
      }

      cursor = new Date(cursor.getTime() + totalSlotMinutes * 60_000);
    }
  }

  // Sort by time and deduplicate (multiple rules can produce same slot)
  const unique = deduplicateSlots(slots);
  unique.sort((a, b) => a.slot_start.localeCompare(b.slot_start));

  return { date, slots: unique };
}

// ============================================================
// getAvailableDates — returns which days in a range have slots
// Useful for calendar highlighting
// ============================================================
export async function getAvailableDates(params: {
  specialistId: string;
  fromDate: string;   // YYYY-MM-DD
  toDate: string;     // YYYY-MM-DD
  centroId?: string;
  durationMinutes?: number;
}): Promise<string[]> {
  const { specialistId, fromDate, toDate, centroId, durationMinutes } = params;

  const supabase = await createClient();
  const weekday = Array.from({ length: 7 }, (_, i) => i);

  // Get which weekdays this specialist works
  let rulesQuery = supabase
    .from('availability_rules')
    .select('weekday')
    .eq('specialist_id', specialistId)
    .eq('active', true);

  if (centroId) {
    rulesQuery = rulesQuery.or(`centro_id.eq.${centroId},centro_id.is.null`);
  }

  const { data: rules } = await rulesQuery;
  if (!rules || rules.length === 0) return [];

  const workingWeekdays = new Set(rules.map((r: { weekday: number }) => r.weekday));

  // Walk through date range
  const availableDates: string[] = [];
  const cursor = new Date(`${fromDate}T00:00:00`);
  const end    = new Date(`${toDate}T00:00:00`);

  while (cursor <= end) {
    if (workingWeekdays.has(cursor.getDay())) {
      const dateStr = cursor.toISOString().split('T')[0];
      // Quick check: does this date have any free slots?
      const result = await getAvailableSlots({
        specialistId,
        date: dateStr,
        centroId,
        durationMinutes,
      });
      if (result.slots.some(s => s.available)) {
        availableDates.push(dateStr);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return availableDates;
}

// ============================================================
// Helpers
// ============================================================

function overlapsAny(
  slotStart: Date,
  slotEnd: Date,
  ranges: { starts_at: string; ends_at: string }[]
): boolean {
  return (ranges || []).some(r => {
    const rStart = new Date(r.starts_at);
    const rEnd   = new Date(r.ends_at);
    return slotStart < rEnd && slotEnd > rStart;
  });
}

function deduplicateSlots(slots: TimeSlot[]): TimeSlot[] {
  const seen = new Set<string>();
  return slots.filter(s => {
    if (seen.has(s.slot_start)) return false;
    seen.add(s.slot_start);
    return true;
  });
}

// ============================================================
// formatSlotTime — "10:00" from ISO string, for display
// ============================================================
export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ============================================================
// groupSlotsByPeriod — groups slots into Mañana/Tarde/Noche
// ============================================================
export function groupSlotsByPeriod(slots: TimeSlot[]): {
  mañana: TimeSlot[];
  tarde: TimeSlot[];
  noche: TimeSlot[];
} {
  return slots.reduce(
    (acc, slot) => {
      const hour = new Date(slot.slot_start).getHours();
      if (hour < 14)      acc.mañana.push(slot);
      else if (hour < 20) acc.tarde.push(slot);
      else                acc.noche.push(slot);
      return acc;
    },
    { mañana: [] as TimeSlot[], tarde: [] as TimeSlot[], noche: [] as TimeSlot[] }
  );
}
