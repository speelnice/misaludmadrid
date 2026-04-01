'use client';

export default function WellhubBanner() {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-accent)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        paddingBlock: 'var(--space-12)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-8)',
          }}
        >
          {/* Left */}
          <div style={{ maxWidth: '560px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '0.35rem 0.85rem',
                backgroundColor: 'var(--brand)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-4)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Partner oficial Wellhub
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 400,
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              ¿Tienes Wellhub? Úsalo con nosotros.
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                fontSize: 'var(--text-base)',
              }}
            >
              Iván Leptach está dado de alta como partner en Wellhub (antes Gympass). Si tu empresa ofrece este beneficio, puedes reservar sesiones de osteopatía directamente desde la app, sin coste adicional.
            </p>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: '220px' }}>
            <a
              href="https://wellhub.com/es-es/search/partners/ivan-leptach-masaje-osteopatia-salamanca/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textAlign: 'center', justifyContent: 'center', fontSize: 'var(--text-base)' }}
            >
              Reservar en Wellhub
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              Solo para usuarios con suscripción Wellhub activa
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}