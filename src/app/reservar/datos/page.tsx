// src/app/reservar/datos/page.tsx
// Step 3 — patient form. Reads params from URL, renders BookingForm client component.

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/reservar/BookingForm';

export default async function DatosPage({
  searchParams,
}: {
  searchParams: { serviceId?: string; specialistId?: string; fecha?: string; hora?: string };
}) {
  const { serviceId, specialistId, fecha, hora } = searchParams;
  if (!serviceId || !specialistId || !fecha || !hora) notFound();

  const supabase = await createClient();

  const { data: service } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price_eur, deposit_eur, category')
    .eq('id', serviceId)
    .single();

  const { data: specialist } = await supabase
    .from('specialists')
    .select('id, name, title')
    .eq('id', specialistId)
    .single();

  if (!service || !specialist) notFound();

  const horaFin = (() => {
    const [h, m] = hora.split(':').map(Number);
    const total  = h * 60 + m + service.duration_minutes;
    return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
  })();

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
        <a href={`/reservar/${serviceId}`} style={{
          fontSize: '0.85rem', color: 'var(--color-text-muted, #7a7974)',
          textDecoration: 'none',
        }}>
          ← Cambiar fecha
        </a>
        <span style={{ color: 'var(--color-border, #d4d1ca)' }}>|</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text, #28251d)' }}>
          Tus datos
        </span>
      </header>

      <BookingForm
        service={service}
        specialist={specialist}
        fecha={fecha}
        horaInicio={hora}
        horaFin={horaFin}
      />
    </main>
  );
}
