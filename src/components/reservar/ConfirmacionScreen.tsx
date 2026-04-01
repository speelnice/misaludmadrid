// src/components/reservar/ConfirmacionScreen.tsx
// Success screen shown after a booking is confirmed
'use client';
import Link from 'next/link';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} de ${MONTHS_ES[m - 1]} de ${y}`;
}

type Cita = {
  id: string; fecha: string; hora_inicio: string; hora_fin: string; estado: string;
  patient_name: string; patient_email: string; patient_phone: string; notas: string | null;
  services:    { name: string; duration_minutes: number; price_eur: number | null; deposit_eur: number | null } | null;
  specialists: { name: string; title: string; phone: string | null } | null;
};

export function ConfirmacionScreen({ cita, cfg }: { cita: Cita; cfg: Record<string, string> }) {
  const rows: [string, string][] = [
    ['Servicio',     cita.services?.name ?? '—'],
    ['Especialista', `${cita.specialists?.name ?? '—'}${cita.specialists?.title ? ` · ${cita.specialists.title}` : ''}`],
    ['Fecha',        formatDate(cita.fecha)],
    ['Hora',         `${cita.hora_inicio} – ${cita.hora_fin}`],
    ['Duración',     `${cita.services?.duration_minutes ?? '—'} min`],
    ...(cita.services?.price_eur   != null ? [['Precio', `${cita.services.price_eur}€`] as [string,string]] : []),
    ...(cita.services?.deposit_eur != null ? [['Señal',  `${cita.services.deposit_eur}€`] as [string,string]] : []),
  ];

  return (
    <main style={{
      minHeight: '100dvh', background: 'var(--color-bg, #f7f6f2)',
      fontFamily: 'var(--font-body, sans-serif)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '1px solid var(--color-border, #d4d1ca)',
        padding: '1rem 2rem', background: 'var(--color-surface, #f9f8f5)',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
      }}>
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#01696f"/>
          <path d="M16 8c-1.5 0-2.8.6-3.8 1.5C11.2 10.5 10 12.1 10 16c0 3.9 1.2 5.5 2.2 6.5 1 1 2.3 1.5 3.8 1.5s2.8-.5 3.8-1.5C20.8 21.5 22 19.9 22 16c0-3.9-1.2-5.5-2.2-6.5C18.8 8.5 17.5 8 16 8z" fill="white" opacity="0.9"/>
          <circle cx="16" cy="16" r="3" fill="#01696f"/>
        </svg>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text, #28251d)' }}>
          {cfg.site_name || 'MiSalud'}
        </span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '520px', width: '100%' }}>

          {/* Success badge */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(1,105,111,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="#01696f" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-5"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400,
              color: 'var(--color-text, #28251d)',
              fontFamily: 'var(--font-display, serif)',
              marginBottom: '0.5rem',
            }}>
              ¡Cita confirmada!
            </h1>
            <p style={{
              fontSize: '0.95rem', color: 'var(--color-text-muted, #7a7974)',
              lineHeight: 1.6, maxWidth: '380px', margin: '0 auto',
            }}>
              Hemos recibido tu reserva. Te enviaremos una confirmación a{' '}
              <strong style={{ color: 'var(--color-text, #28251d)' }}>{cita.patient_email}</strong>.
            </p>
          </div>

          {/* Booking summary card */}
          <div style={{
            background: 'var(--color-surface, #f9f8f5)',
            border: '1.5px solid var(--color-border, #d4d1ca)',
            borderRadius: '0.875rem', padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted, #7a7974)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Detalle de tu cita
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {rows.map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #7a7974)',
                    textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: 0 }}>
                    {k}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text, #28251d)',
                    fontWeight: 500, margin: 0 }}>
                    {v}
                  </p>
                </div>
              ))}
            </div>

            {/* Ref number */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border, #d4d1ca)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #7a7974)', margin: 0 }}>
                Nº de reserva:{' '}
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text, #28251d)', fontWeight: 600 }}>
                  {cita.id.slice(0, 8).toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div style={{
            background: 'rgba(1,105,111,0.05)',
            border: '1px solid rgba(1,105,111,0.15)',
            borderRadius: '0.75rem', padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text, #28251d)',
              fontWeight: 600, marginBottom: '0.25rem' }}>
              ¿Necesitas cambiar o cancelar?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #7a7974)', margin: 0, lineHeight: 1.5 }}>
              Contáctanos con al menos 24h de antelación
              {cfg.contact_phone && <> · <a href={`tel:${cfg.contact_phone}`}
                style={{ color: '#01696f', textDecoration: 'none', fontWeight: 500 }}>
                {cfg.contact_phone}
              </a></>}
              {cfg.contact_email && <> · <a href={`mailto:${cfg.contact_email}`}
                style={{ color: '#01696f', textDecoration: 'none', fontWeight: 500 }}>
                {cfg.contact_email}
              </a></>}
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link href="/" style={{
              display: 'block', textAlign: 'center', padding: '0.875rem',
              background: '#01696f', color: '#fff', borderRadius: '0.5rem',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}>
              Volver al inicio
            </Link>
            <Link href="/reservar" style={{
              display: 'block', textAlign: 'center', padding: '0.875rem',
              border: '1.5px solid var(--color-border, #d4d1ca)',
              color: 'var(--color-text, #28251d)', borderRadius: '0.5rem',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              background: 'transparent',
            }}>
              Reservar otra cita
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
