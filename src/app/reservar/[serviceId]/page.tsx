// src/app/reservar/[serviceId]/page.tsx
// Step 2 — pick specialist, date and time slot

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SlotPicker } from '@/components/reservar/SlotPicker';

export default async function ReservarSlotPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const supabase = await createClient();

  // Load the service
  const { data: service } = await supabase
    .from('services')
    .select('id, name, category, duration_minutes, price_eur, deposit_eur, specialist_id')
    .eq('id', params.serviceId)
    .eq('active', true)
    .single();

  if (!service) notFound();

  // Load specialists — if service has a fixed specialist, only show that one
  const specQuery = supabase
    .from('specialists')
    .select('id, name, title, bio, phone')
    .eq('active', true)
    .order('display_order');

  if (service.specialist_id) {
    specQuery.eq('id', service.specialist_id);
  }

  const { data: specialists } = await specQuery;

  // Load availability rules
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .in('specialist_id', (specialists || []).map(s => s.id));

  // Load existing bookings for next 60 days (to block taken slots)
  const today = new Date().toISOString().split('T')[0];
  const until = new Date(Date.now() + 60 * 864e5).toISOString().split('T')[0];

  const { data: booked } = await supabase
    .from('citas')
    .select('specialist_id, fecha, hora_inicio, hora_fin')
    .in('specialist_id', (specialists || []).map(s => s.id))
    .gte('fecha', today)
    .lte('fecha', until)
    .in('estado', ['pendiente', 'confirmada']);

  return (
    <main style={{
      minHeight: '100dvh',
      background: 'var(--color-bg, #f7f6f2)',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '1px solid var(--color-border, #d4d1ca)',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'var(--color-surface, #f9f8f5)',
      }}>
        <a href="/reservar" style={{
          fontSize: '0.85rem', color: 'var(--color-text-muted, #7a7974)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem',
        }}>
          ← Volver
        </a>
        <span style={{ color: 'var(--color-border, #d4d1ca)' }}>|</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text, #28251d)' }}>
          {service.name}
        </span>
        {service.duration_minutes && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #7a7974)', marginLeft: 'auto' }}>
            ⏱ {service.duration_minutes} min
            {service.price_eur ? ` · ${service.price_eur}€` : ''}
          </span>
        )}
      </header>

      <SlotPicker
        service={service}
        specialists={specialists || []}
        availability={availability || []}
        booked={booked || []}
      />
    </main>
  );
}
