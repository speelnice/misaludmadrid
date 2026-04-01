// ============================================================
// src/app/api/bookings/route.ts
// POST /api/bookings — create a booking + trigger notifications
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    service_id, specialist_id, centro_id, location_type,
    home_address, starts_at, ends_at,
    client_name, client_email, client_phone, client_notes,
    price_eur, deposit_eur,
  } = body;

  // --- Basic validation ---
  if (!service_id || !specialist_id || !starts_at || !ends_at || !client_name || !client_email) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }

  if (location_type === 'home' && !home_address) {
    return NextResponse.json({ error: 'Dirección requerida para servicio a domicilio' }, { status: 400 });
  }

  const supabase = await createClient();

  // --- Check slot is still available (race condition guard) ---
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('specialist_id', specialist_id)
    .not('status', 'in', '("cancelled")')
    .lt('starts_at', ends_at)
    .gt('ends_at', starts_at);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: 'Este horario ya no está disponible. Por favor elige otro.' },
      { status: 409 }
    );
  }

  // --- Create booking ---
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_id,
      specialist_id,
      centro_id: centro_id ?? null,
      location_type: location_type ?? 'centro',
      home_address: home_address ?? null,
      starts_at,
      ends_at,
      client_name,
      client_email,
      client_phone: client_phone ?? null,
      client_notes: client_notes ?? null,
      price_eur: price_eur ?? null,
      deposit_eur: deposit_eur ?? null,
      status: 'pending',
      payment_status: 'unpaid',
      source: 'web',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Booking insert error:', error);
    return NextResponse.json({ error: 'Error al crear la reserva' }, { status: 500 });
  }

  // --- Queue notifications (non-blocking) ---
  const bookingId = booking.id;

  // Insert notification jobs — processed by background worker or Supabase Edge Function
  await supabase.from('notifications').insert([
    { booking_id: bookingId, type: 'email_client',    status: 'pending' },
    { booking_id: bookingId, type: 'email_specialist', status: 'pending' },
    { booking_id: bookingId, type: 'email_admin',     status: 'pending' },
  ]);

  // --- If payment required, create Stripe session ---
  // (Stripe integration added in Step 4)
  // const checkoutUrl = await createStripeSession({ bookingId, ... });

  return NextResponse.json({
    booking_id: bookingId,
    status: 'pending',
    checkout_url: null, // will be Stripe URL in step 4
  }, { status: 201 });
}

// GET /api/bookings — list bookings (admin/specialist only)
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'specialist'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  let query = supabase
    .from('bookings')
    .select(`
      *,
      service:services(name, duration_minutes),
      specialist:specialists(name, title),
      centro:centros(name, address)
    `)
    .order('starts_at', { ascending: true });

  // Specialists only see their own bookings
  if (profile.role === 'specialist') {
    const { data: spec } = await supabase
      .from('specialists')
      .select('id')
      .eq('profile_id', user.id)
      .single();
    if (spec) query = query.eq('specialist_id', spec.id);
  }

  if (status) query = query.eq('status', status);
  if (from)   query = query.gte('starts_at', from);
  if (to)     query = query.lte('starts_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookings: data });
}
