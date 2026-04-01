'use client';

import type { Review } from '@/lib/types';

interface Props {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? '#f59e0b' : 'var(--border-color)' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ResenasSection({ reviews }: Props) {
  return (
    <section id="resenas" className="section" style={{ backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Lo que dicen</span>
          <h2 className="section-title">Reseñas de clientes</h2>
          <p className="section-subtitle" style={{ marginInline: 'auto' }}>
            La satisfacción de nuestros clientes es nuestra mayor motivación.
          </p>
        </div>

        {/* Scroll container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="card"
              style={{
                padding: 'var(--space-8)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {/* Quote mark */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4rem',
                  lineHeight: 0.8,
                  color: 'var(--brand)',
                  opacity: 0.3,
                  userSelect: 'none',
                }}
              >
                "
              </div>

              <StarRating rating={review.rating} />

              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-base)',
                  flex: 1,
                  fontStyle: 'italic',
                }}
              >
                {review.content}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--brand)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {review.author_name[0]}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {review.author_name}
                  </div>
                  {review.author_location && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {review.author_location}
                    </div>
                  )}
                </div>
                {review.verified && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--brand)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10.5 3L4.5 9 1.5 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verificado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Google CTA */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
          <a
            href="https://www.google.com/maps/place//data=!4m3!3m2!1s0xd418beaef00d16b:0x7949382245d8d14d!12e1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor" />
            </svg>
            Ver todas las reseñas en Google
          </a>
        </div>
      </div>
    </section>
  );
}