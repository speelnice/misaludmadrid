// src/app/reservar/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ServicePicker } from '@/components/reservar/ServicePicker';

export const metadata = {
  title: 'Reservar cita',
  description: 'Elige el servicio que necesitas y reserva tu cita online.',
};

export default async function ReservarPage() {
  const supabase = await createClient();

  const { data: rawServices } = await supabase
    .from('services')
    .select(`
      id, name, category, duration_minutes,
      price_eur, deposit_eur, description,
      allow_home_visits,
      specialists ( id, name, title )
    `)
    .eq('active', true)
    .order('category')
    .order('display_order');

  const services = (rawServices || []) as any[];

  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['site_name', 'contact_phone']);

  const cfg = Object.fromEntries((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));

  return (
    <main style={{
      minHeight: '100dvh',
      background: 'var(--color-bg, #f7f6f2)',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      <header style={{
        borderBottom: '1px solid var(--color-border, #d4d1ca)',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--color-surface, #f9f8f5)',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#01696f"/>
            <path d="M16 8c-1.5 0-2.8.6-3.8 1.5C11.2 10.5 10 12.1 10 16c0 3.9 1.2 5.5 2.2 6.5 1 1 2.3 1.5 3.8 1.5s2.8-.5 3.8-1.5C20.8 21.5 22 19.9 22 16c0-3.9-1.2-5.5-2.2-6.5C18.8 8.5 17.5 8 16 8z" fill="white" opacity="0.9"/>
            <circle cx="16" cy="16" r="3" fill="#01696f"/>
          </svg>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text, #28251d)' }}>
            {cfg.site_name || 'MiSalud'}
          </span>
        </a>
        {cfg.contact_phone && (
          <a href={`tel:${cfg.contact_phone}`} style={{
            fontSize: '0.85rem', color: 'var(--color-primary, #01696f)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            {cfg.contact_phone}
          </a>
        )}
      </header>

      <div style={{
        textAlign: 'center', padding: '3rem 1.5rem 2rem',
        borderBottom: '1px solid var(--color-border, #d4d1ca)',
        background: 'var(--color-surface, #f9f8f5)',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontWeight: 400, color: 'var(--color-text, #28251d)',
          fontFamily: 'var(--font-display, serif)',
          marginBottom: '0.5rem',
        }}>
          que servicio necesitas?
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted, #7a7974)', maxWidth: '480px', margin: '0 auto' }}>
          Elige el tratamiento y en el siguiente paso seleccionas especialista, dia y hora.
        </p>
      </div>

      <ServicePicker services={services} />
    </main>
  );
}
