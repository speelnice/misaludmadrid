'use client';

interface Props {
  email: string;
  whatsapp: string;
  phone?: string;
}

export default function ContactoSection({ email, whatsapp, phone }: Props) {
  return (
    <section
      id="contacto"
      className="section"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Contacto</span>
          <h2 className="section-title">¿Hablamos?</h2>
          <p className="section-subtitle" style={{ marginInline: 'auto' }}>
            Estamos aquí para ayudarte. Escríbenos por WhatsApp, email o llámanos. Respondemos rápido.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'var(--space-6)',
            maxWidth: '900px',
            marginInline: 'auto',
          }}
        >
          {/* WhatsApp */}
          <ContactCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            }
            title="WhatsApp"
            description="La forma más rápida de contactarnos. Respuesta en minutos."
            href={whatsapp}
            cta="Escribir por WhatsApp"
            color="#25D366"
          />

          {/* Email */}
          <ContactCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            title="Email"
            description="Para consultas detalladas o información sobre servicios especiales."
            href={`mailto:${email}`}
            cta={email}
            color="var(--brand)"
          />

          {/* Wellhub */}
          <ContactCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            title="Wellhub"
            description="Si tienes Wellhub a través de tu empresa, reserva directamente en la plataforma."
            href="https://wellhub.com/es-es/search/partners/ivan-leptach-masaje-osteopatia-salamanca/"
            cta="Ir a Wellhub"
            color="var(--brand)"
          />
        </div>

        {/* Map hint */}
        <div
          style={{
            marginTop: 'var(--space-16)',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Madrid y área metropolitana
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Centros en Salamanca, Leganés, Vallecas y Alcalá · Servicio a domicilio en toda la comunidad
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  title,
  description,
  href,
  cta,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
  color: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-8)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ color }}>{icon}</div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 400,
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', flex: 1 }}>
        {description}
      </p>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color,
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          textDecoration: 'none',
          borderTop: '1px solid var(--border-color)',
          paddingTop: 'var(--space-4)',
          marginTop: 'auto',
          transition: 'gap var(--transition-fast)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.gap = 'var(--space-3)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.gap = 'var(--space-2)')}
      >
        {cta}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}