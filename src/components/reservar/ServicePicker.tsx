// src/components/reservar/ServicePicker.tsx
// Client component — category tabs + service cards
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Specialist = { id: string; name: string; title: string };
type Service = {
  id: string; name: string; category: string;
  duration_minutes: number; price_eur: number | null;
  deposit_eur: number | null; description: string | null;
  allow_home_visits: boolean;
  specialists: Specialist | null;
};

export function ServicePicker({ services }: { services: Service[] }) {
  const router = useRouter();

  // Build unique category list preserving order
  const cats = ['Todos', ...Array.from(new Set(services.map(s => s.category)))];
  const [active, setActive] = useState('Todos');

  const filtered = active === 'Todos' ? services : services.filter(s => s.category === active);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem',
      }}>
        {cats.map(cat => (
          <button key={cat} onClick={() => setActive(cat)} style={{
            padding: '0.4rem 1rem',
            borderRadius: '9999px', border: '1.5px solid',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
            borderColor: active === cat ? '#01696f' : 'var(--color-border, #d4d1ca)',
            background:   active === cat ? '#01696f' : 'transparent',
            color:        active === cat ? '#fff'    : 'var(--color-text, #28251d)',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Service cards grid */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted, #7a7974)', padding: '3rem' }}>
          No hay servicios disponibles en esta categoría.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
          gap: '1.25rem',
        }}>
          {filtered.map(svc => (
            <button
              key={svc.id}
              onClick={() => router.push(`/reservar/${svc.id}`)}
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '1.5rem',
                background: 'var(--color-surface, #f9f8f5)',
                border: '1.5px solid var(--color-border, #d4d1ca)',
                borderRadius: '0.75rem',
                transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#01696f';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(1,105,111,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border, #d4d1ca)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {/* Category badge */}
              <span style={{
                display: 'inline-block', padding: '0.2rem 0.625rem',
                background: 'rgba(1,105,111,0.08)',
                color: '#01696f', borderRadius: '9999px',
                fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                alignSelf: 'flex-start',
              }}>
                {svc.category}
              </span>

              {/* Name */}
              <p style={{
                fontSize: '1rem', fontWeight: 600,
                color: 'var(--color-text, #28251d)', margin: 0, lineHeight: 1.3,
              }}>
                {svc.name}
              </p>

              {/* Description */}
              {svc.description && (
                <p style={{
                  fontSize: '0.82rem', color: 'var(--color-text-muted, #7a7974)',
                  margin: 0, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {svc.description}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <span style={meta}>⏱ {svc.duration_minutes} min</span>
                {svc.price_eur != null && (
                  <span style={meta}>💶 {svc.price_eur}€</span>
                )}
                {svc.allow_home_visits && (
                  <span style={meta}>🏠 A domicilio</span>
                )}
              </div>

              {/* Specialist */}
              {svc.specialists && (
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #7a7974)', margin: 0 }}>
                  Con {svc.specialists.name}
                  {svc.specialists.title ? ` · ${svc.specialists.title}` : ''}
                </p>
              )}

              {/* CTA */}
              <div style={{
                marginTop: '0.25rem', padding: '0.6rem',
                background: '#01696f', color: '#fff',
                borderRadius: '0.5rem', textAlign: 'center',
                fontSize: '0.85rem', fontWeight: 600,
              }}>
                Reservar →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const meta: React.CSSProperties = {
  fontSize: '0.78rem', color: 'var(--color-text-muted, #7a7974)',
};
