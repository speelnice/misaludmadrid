// src/components/booking/steps/StepSpecialist.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Specialist, Centro } from '@/types';

export function StepSpecialist({ booking }: { booking: any }) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [centros, setCentros]         = useState<Centro[]>([]);
  const [loading, setLoading]         = useState(true);
  const { state, selectSpecialist, selectCentro } = booking;

  useEffect(() => {
    const sb = createClient();
    Promise.all([
      sb.from('specialists').select('*').eq('active', true).order('display_order'),
      sb.from('centros').select('*').eq('active', true).order('display_order'),
    ]).then(([{ data: specs }, { data: ctrs }]) => {
      setSpecialists(specs || []);
      setCentros(ctrs || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Specialist picker */}
      <div>
        <p style={styles.sectionLabel}>Especialista</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {specialists.map(spec => {
            const selected = state.specialist?.id === spec.id;
            return (
              <button key={spec.id} onClick={() => selectSpecialist(spec)}
                style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }}>
                <div style={styles.avatar}>{spec.name.charAt(0)}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={styles.cardTitle}>{spec.name}</p>
                  <p style={styles.cardMeta}>{spec.title}</p>
                </div>
                {selected && <Check />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location picker — only shown once specialist selected */}
      {state.specialist && (
        <div>
          <p style={styles.sectionLabel}>¿Dónde prefieres la sesión?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {centros.map(centro => {
              const selected = state.centro?.id === centro.id && state.location_type === 'centro';
              return (
                <button key={centro.id} onClick={() => selectCentro(centro, 'centro')}
                  style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }}>
                  <div style={styles.iconWrap}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={styles.cardTitle}>{centro.name}</p>
                    <p style={styles.cardMeta}>{centro.address}, {centro.district}</p>
                  </div>
                  {selected && <Check />}
                </button>
              );
            })}

            {/* Home visit option */}
            {state.service?.allow_home_visits && (() => {
              const selected = state.location_type === 'home';
              return (
                <button onClick={() => selectCentro(null, 'home')}
                  style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }}>
                  <div style={styles.iconWrap}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={styles.cardTitle}>A domicilio</p>
                    <p style={styles.cardMeta}>En tu dirección en Madrid</p>
                  </div>
                  {selected && <Check />}
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ color: 'var(--brand, #01696f)', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionLabel: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' },
  card: { display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.875rem 1rem', border: '1.5px solid var(--border-color)',
    borderRadius: '0.625rem', background: 'var(--bg-secondary)',
    cursor: 'pointer', transition: 'all 0.15s', width: '100%' },
  cardSelected: { borderColor: 'var(--brand, #01696f)', background: 'rgba(1,105,111,0.05)' },
  cardTitle: { fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' },
  cardMeta:  { fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.125rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--brand-light, rgba(1,105,111,0.1))',
    color: 'var(--brand, #01696f)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  iconWrap: { width: '36px', height: '36px', borderRadius: '0.5rem',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', flexShrink: 0 },
};
