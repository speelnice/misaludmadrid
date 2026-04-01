// src/components/onboarding/steps/StepDone.tsx
// Final screen — success state with next-steps checklist
'use client';
import Link from 'next/link';

export function StepDone() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>

      {/* Success icon */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(1,105,111,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="#4f98a3" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      </div>

      <h1 style={{
        fontSize: '1.75rem', fontWeight: 400,
        color: 'var(--color-text, #cdccca)',
        fontFamily: 'var(--font-display, serif)',
        marginBottom: '0.75rem',
      }}>
        ¡Todo configurado!
      </h1>

      <p style={{
        fontSize: '0.95rem', color: 'var(--color-text-muted, #797876)',
        lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 2.5rem',
      }}>
        Tu clínica está lista para recibir reservas. Puedes editar cualquier dato
        desde el panel de administración cuando quieras.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
        <Link href="/admin" style={{
          display: 'block', padding: '0.875rem 1.5rem',
          background: '#01696f', color: '#fff', borderRadius: '0.5rem',
          textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
        }}>
          Ir al panel de administración →
        </Link>

        <Link href="/" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '0.875rem 1.5rem',
          border: '1.5px solid var(--color-border, #393836)',
          color: 'var(--color-text, #cdccca)', borderRadius: '0.5rem',
          textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          background: 'transparent',
        }}>
          Ver la web pública
        </Link>

        <Link href="/admin/especialistas" style={{
          display: 'block', padding: '0.75rem',
          color: 'var(--color-text-muted, #797876)',
          textDecoration: 'none', fontSize: '0.85rem',
          background: 'transparent',
        }}>
          Configurar disponibilidad de especialistas
        </Link>
      </div>

      {/* Next steps checklist */}
      <div style={{
        marginTop: '3rem', padding: '1.25rem',
        background: 'var(--color-surface, #1c1b19)',
        border: '1px solid var(--color-border, #393836)',
        borderRadius: '0.75rem', textAlign: 'left',
        maxWidth: '400px', margin: '3rem auto 0',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700,
          color: 'var(--color-text-muted, #797876)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: '1rem',
        }}>
          Próximos pasos recomendados
        </p>

        {([
          ['Configura la disponibilidad',    'Define los horarios de cada especialista'],
          ['Activa los pagos con Stripe',    'Añade STRIPE_SECRET_KEY en Vercel'],
          ['Activa emails automáticos',      'Añade RESEND_API_KEY en Vercel'],
          ['Conecta WhatsApp',               'Añade las credenciales de Twilio'],
          ['Añade más especialistas',        'Panel → Especialistas → Nuevo'],
        ] as [string, string][]).map(([title, desc]) => (
          <div key={title} style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ color: '#4f98a3', flexShrink: 0, marginTop: '1px' }}>→</span>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text, #cdccca)', margin: 0 }}>
                {title}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #797876)', margin: 0 }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
