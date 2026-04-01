'use client';

import type { Centro } from '@/lib/types';

interface Props {
  centros: Centro[];
}

export default function CentrosSection({ centros }: Props) {
  return (
    <section id="centros" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Dónde encontrarnos</span>
          <h2 className="section-title">Nuestros centros</h2>
          <p className="section-subtitle">
            Trabajamos en 5 centros por toda la Comunidad de Madrid. Elige el más cercano a ti.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 'var(--space-5)',
          }}
        >
          {centros.map((centro, i) => (
            <CentroCard key={centro.id} centro={centro} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CentroCard({ centro, index }: { centro: Centro; index: number }) {
  const colors = [
    { bg: 'var(--green-900)', text: '#faf8f5' },
    { bg: 'var(--green-800)', text: '#faf8f5' },
    { bg: 'var(--green-700)', text: '#faf8f5' },
    { bg: 'var(--cream-100)', text: 'var(--text-primary)' },
    { bg: 'var(--green-100)', text: 'var(--green-900)' },
  ];
  const color = colors[index % colors.length];

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        backgroundColor: color.bg,
        color: color.text,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '240px',
        transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
        cursor: centro.maps_url ? 'pointer' : 'default',
        border: '1px solid var(--border-color)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: 'var(--space-8)', flex: 1 }}>
        {/* Number */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-5xl)',
            fontWeight: 300,
            opacity: 0.2,
            lineHeight: 1,
            marginBottom: 'var(--space-4)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: 'var(--space-3)',
            color: 'inherit',
          }}
        >
          {centro.name}
        </h3>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            opacity: 0.75,
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {centro.address}
          {centro.district && `, ${centro.district}`}
        </p>

        {centro.phone && (
          <a
            href={`tel:${centro.phone}`}
            style={{
              display: 'inline-block',
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              opacity: 0.75,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {centro.phone}
          </a>
        )}
      </div>

      {centro.maps_url && (
        <div
          style={{
            padding: 'var(--space-5) var(--space-8)',
            borderTop: `1px solid ${index < 3 ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'}`,
          }}
        >
          <a
            href={centro.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'inherit',
              opacity: 0.85,
              textDecoration: 'none',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.3" />
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor" />
            </svg>
            Ver en Google Maps
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}