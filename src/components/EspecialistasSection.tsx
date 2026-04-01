'use client';

import type { Specialist } from '@/lib/types';

interface Props {
  specialists: Specialist[];
}

export default function EspecialistasSection({ specialists }: Props) {
  return (
    <section id="especialistas" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Nuestro equipo</span>
          <h2 className="section-title">Los especialistas</h2>
          <p className="section-subtitle" style={{ marginInline: 'auto' }}>
            Profesionales con formación avanzada y pasión por el bienestar. Cada tratamiento es único, como tú.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          {specialists.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const initials = specialist.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="card"
      style={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      {/* Top section */}
      <div style={{ padding: 'var(--space-10)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--brand-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '2px solid var(--brand)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--brand)',
              fontWeight: 500,
            }}
          >
            {specialist.photo_url ? (
              <img
                src={specialist.photo_url}
                alt={specialist.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 400,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginBottom: 'var(--space-2)',
              }}
            >
              {specialist.name}
            </h3>
            <span className="tag">{specialist.title}</span>
          </div>
        </div>

        {specialist.bio && (
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              fontSize: 'var(--text-base)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {specialist.bio}
          </p>
        )}

        {/* Services */}
        {specialist.services && specialist.services.length > 0 && (
          <div>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Servicios
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {specialist.services.map(service => (
                <li
                  key={service.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand)',
                      flexShrink: 0,
                    }}
                  />
                  {service.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom links */}
      <div
        style={{
          padding: 'var(--space-6) var(--space-10)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        {specialist.wellhub_url && (
          <a
            href={specialist.wellhub_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)', padding: '0.625rem 1.25rem' }}
          >
            Reservar en Wellhub
          </a>
        )}
        {specialist.google_reviews_url && (
          <a
            href={specialist.google_reviews_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-sm)', padding: '0.625rem 1.25rem' }}
          >
            Ver reseñas en Google
          </a>
        )}
        {specialist.instagram_url && (
          <a
            href={specialist.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}