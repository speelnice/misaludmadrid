'use client';
import type { DomicilioZone } from '@/lib/types';

interface Props {
  zones: DomicilioZone[];
}

const compassIcons: Record<string, string> = {
  Norte: 'N',
  Centro: 'C',
  Sur: 'S',
  'Este / Oeste': 'E/O',
};

const zoneColors: Record<string, { accent: string; bgLight: string }> = {
  Norte: { accent: 'var(--green-800)', bgLight: 'var(--green-100)' },
  Centro: { accent: 'var(--green-700)', bgLight: 'var(--green-200)' },
  Sur: { accent: 'var(--green-600)', bgLight: 'var(--green-100)' },
  'Este / Oeste': { accent: 'var(--green-900)', bgLight: 'var(--cream-100)' },
};

export default function DomicilioSection({ zones }: Props) {
  return (
    <section
      id="domicilio"
      className="section"
      style={{
        backgroundColor: 'var(--green-900)',
        color: 'var(--cream-50)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '35vw',
          height: '35vw',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: 'var(--space-16)',
            alignItems: 'start',
          }}
        >
          {/* Left: text */}
          <div>
            <span
              className="section-label"
              style={{ color: 'var(--green-400)' }}
            >
              Servicio a domicilio
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 4vw, 4rem)',
                fontWeight: 300,
                lineHeight: 1.05,
                color: 'var(--cream-50)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Tu sesión,
              <br />
              <em>donde tú estés</em>
            </h2>
            <p
              style={{
                color: 'rgba(250,248,245,0.7)',
                lineHeight: 'var(--leading-relaxed)',
                fontSize: 'var(--text-lg)',
                marginBottom: 'var(--space-8)',
                maxWidth: '48ch',
              }}
            >
              Llevamos la terapia hasta tu puerta. Sin desplazamientos, sin esperas. Solo bienestar en la comodidad de tu hogar.
            </p>

            {/* Features */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                'Puntualidad garantizada',
                'Material profesional incluido',
                'Misma calidad que en centro',
                'Reserva fácil por WhatsApp',
              ].map(feature => (
                <li
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    color: 'rgba(250,248,245,0.85)',
                    fontSize: 'var(--text-base)',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--green-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '10px',
                      color: '#fff',
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'var(--space-10)' }}>
              <a
                href="#contacto"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '0.875rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--green-600)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all var(--transition-base)',
                  border: '1.5px solid var(--green-600)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-400)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--green-400)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-600)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--green-600)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Consultar disponibilidad
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: zones grid */}
          <div>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--green-400)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Zonas de cobertura
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
              }}
            >
              {zones.map(zone => {
                const zoneColor = zoneColors[zone.region] || zoneColors['Norte'];
                return (
                  <div
                    key={zone.id}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'background-color var(--transition-base)',
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        'rgba(255,255,255,0.09)')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        'rgba(255,255,255,0.05)')
                    }
                  >
                    {/* Compass label */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--green-400)',
                        marginBottom: 'var(--space-4)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {compassIcons[zone.region] || zone.region[0]}
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 400,
                        color: 'var(--cream-50)',
                        marginBottom: 'var(--space-3)',
                      }}
                    >
                      {zone.region}
                    </h3>

                    <ul
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      {zone.districts.map(district => (
                        <li
                          key={district}
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'rgba(250,248,245,0.6)',
                            lineHeight: '1.6',
                          }}
                        >
                          {district}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <p
              style={{
                marginTop: 'var(--space-6)',
                fontSize: 'var(--text-xs)',
                color: 'rgba(250,248,245,0.45)',
                textAlign: 'center',
              }}
            >
              ¿Tu zona no aparece? Consúltanos, es posible que podamos llegar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
