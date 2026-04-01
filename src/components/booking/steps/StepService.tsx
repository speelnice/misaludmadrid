// src/components/booking/steps/StepService.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Service } from '@/types';

export function StepService({ booking }: { booking: any }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from('services')
      .select('*, specialist:specialists(name, title)')
      .eq('active', true)
      .order('display_order')
      .then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  // Group by category
  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (loading) return <LoadingCards />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        ¿Qué tipo de tratamiento necesitas?
      </p>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p style={styles.catLabel}>{cat}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map(svc => {
              const selected = booking.state.service?.id === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => booking.selectService(svc)}
                  style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={styles.cardTitle}>{svc.name}</p>
                    <p style={styles.cardMeta}>
                      {svc.duration_minutes} min
                      {svc.specialist && ` · ${(svc as any).specialist.name}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {svc.price_eur ? (
                      <span style={styles.price}>{svc.price_eur}€</span>
                    ) : (
                      <span style={styles.priceMuted}>Consultar</span>
                    )}
                  </div>
                  {selected && <SelectedCheck />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectedCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ color: 'var(--brand, #01696f)', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function LoadingCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: '64px', borderRadius: '0.5rem',
          background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  catLabel: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' },
  card: { display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.875rem 1rem', border: '1.5px solid var(--border-color)',
    borderRadius: '0.625rem', background: 'var(--bg-secondary)',
    cursor: 'pointer', transition: 'all 0.15s', width: '100%' },
  cardSelected: { borderColor: 'var(--brand, #01696f)',
    background: 'rgba(1,105,111,0.05)' },
  cardTitle: { fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' },
  cardMeta:  { fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.125rem' },
  price:     { fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--brand, #01696f)' },
  priceMuted:{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' },
};
