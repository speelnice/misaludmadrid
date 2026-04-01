// src/app/reservar/pago/page.tsx
// Intermediate page — shows payment summary, then redirects to Stripe Checkout

'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PagoPage() {
  const params  = useSearchParams();
  const citaId  = params.get('citaId');
  const mode    = params.get('mode') ?? 'deposit';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!citaId) return;

    fetch('/api/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ citaId, mode }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error ?? 'No se pudo iniciar el pago');
        }
      })
      .catch(() => setError('Error de conexión. Inténtalo de nuevo.'));
  }, [citaId, mode]);

  return (
    <main style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg, #f7f6f2)', fontFamily: 'var(--font-body, sans-serif)',
      flexDirection: 'column', gap: '1rem', padding: '2rem',
    }}>
      {error ? (
        <>
          <p style={{ fontSize: '1rem', color: '#a12c7b', fontWeight: 600 }}>{error}</p>
          <a href={`/reservar/confirmacion?citaId=${citaId}`} style={{
            fontSize: '0.875rem', color: '#01696f', textDecoration: 'none',
          }}>
            ← Volver a la confirmación
          </a>
        </>
      ) : (
        <>
          {/* Spinner */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
            style={{ animation: 'spin 0.9s linear infinite' }}>
            <circle cx="20" cy="20" r="16" stroke="#d4d1ca" strokeWidth="3" />
            <path d="M20 4a16 16 0 0 1 16 16" stroke="#01696f" strokeWidth="3"
              strokeLinecap="round"/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </svg>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted, #7a7974)' }}>
            Redirigiendo al pago seguro…
          </p>
        </>
      )}
    </main>
  );
}
