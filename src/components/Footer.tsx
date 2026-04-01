'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--dark-900)',
        color: 'rgba(250,248,245,0.7)',
        paddingBlock: 'var(--space-16)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-12)',
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <a
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '2px',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  fontWeight: 300,
                  color: 'var(--cream-50)',
                }}
              >
                Mi
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: 'var(--green-400)',
                }}
              >
                Salud
              </span>
            </a>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '28ch',
                color: 'rgba(250,248,245,0.55)',
              }}
            >
              Osteopatía y masajes terapéuticos en Madrid. En centro o a domicilio.
            </p>
          </div>

          {/* Especialistas */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--green-400)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Especialistas
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Iván Leptach — Osteópata', href: '#especialistas' },
                { label: 'Matteo — Masajista', href: '#especialistas' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'rgba(250,248,245,0.6)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--cream-50)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(250,248,245,0.6)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--green-400)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Servicios
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Osteopatía', href: '#especialistas' },
                { label: 'Masaje terapéutico', href: '#especialistas' },
                { label: 'Masaje facial Kobido', href: '#especialistas' },
                { label: 'Servicio a domicilio', href: '#domicilio' },
                { label: 'Centros en Madrid', href: '#centros' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'rgba(250,248,245,0.6)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--cream-50)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(250,248,245,0.6)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--green-400)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Contacto
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'hola@misalud.es', href: 'mailto:hola@misalud.es' },
                { label: 'WhatsApp', href: 'https://wa.me/34600000000' },
                { label: 'Wellhub', href: 'https://wellhub.com/es-es/search/partners/ivan-leptach-masaje-osteopatia-salamanca/' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'rgba(250,248,245,0.6)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--cream-50)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(250,248,245,0.6)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(250,248,245,0.35)' }}>
            © {year} MiSalud. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(250,248,245,0.25)' }}>
            Madrid, España
          </p>
        </div>
      </div>
    </footer>
  );
}