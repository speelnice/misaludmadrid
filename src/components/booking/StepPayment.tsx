// ============================================================
// src/components/booking/steps/StepPayment.tsx
// Payment step — shown after booking is created.
// Lets user choose full payment or deposit, then redirects
// to Stripe Checkout.
// ============================================================

'use client';
import { useState } from 'react';

export function StepPayment({ booking }: { booking: any }) {
  const { state } = booking;
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const price   = state.service?.price_eur;
  const deposit = state.service?.deposit_eur;
  const hasDeposit = !!deposit;

  async function handlePay(type: 'full' | 'deposit') {
    if (!bookingId && !state.bookingId) {
      setError('No se encontró la reserva. Intenta de nuevo.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id:   bookingId || state.bookingId,
          payment_type: type,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al iniciar el pago');

      // Redirect to Stripe Checkout
      window.location.href = json.checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }

  if (!price && !deposit) {
    // No price set — skip payment, go straight to confirmation
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          El precio se acordará directamente con el especialista.
        </p>
        <button className="btn btn-primary" onClick={() => booking.goNext()}>
          Confirmar reserva →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        Elige cómo quieres pagar tu cita:
      </p>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {/* Full payment */}
      {price && (
        <button
          onClick={() => handlePay('full')}
          disabled={loading}
          style={styles.payCard}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={styles.payTitle}>Pago completo</p>
            <p style={styles.payDesc}>Abona el importe total ahora</p>
          </div>
          <span style={styles.price}>{price}€</span>
        </button>
      )}

      {/* Deposit option */}
      {hasDeposit && (
        <button
          onClick={() => handlePay('deposit')}
          disabled={loading}
          style={{ ...styles.payCard, ...styles.payCardSecondary }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={styles.payTitle}>Señal de reserva</p>
            <p style={styles.payDesc}>
              Paga {deposit}€ ahora y el resto el día de la cita
            </p>
          </div>
          <span style={{ ...styles.price, color: 'var(--text-secondary)' }}>{deposit}€</span>
        </button>
      )}

      {loading && (
        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Redirigiendo a la pasarela de pago...
        </p>
      )}

      {/* Security note */}
      <div style={styles.secureNote}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Pago seguro procesado por Stripe. No almacenamos datos de tarjeta.
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  payCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem 1.125rem',
    border: '1.5px solid var(--brand, #01696f)',
    borderRadius: '0.625rem',
    background: 'rgba(1,105,111,0.04)',
    cursor: 'pointer', transition: 'all 0.15s', width: '100%',
  },
  payCardSecondary: {
    borderColor: 'var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  payTitle: { fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' },
  payDesc:  { fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' },
  price:    { fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--brand, #01696f)', flexShrink: 0 },
  error: {
    background: 'rgba(161,44,123,0.08)', border: '1px solid rgba(161,44,123,0.2)',
    borderRadius: '0.5rem', padding: '0.75rem 1rem',
    fontSize: 'var(--text-sm)', color: '#a12c7b',
  },
  secureNote: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
    justifyContent: 'center', marginTop: '0.5rem',
  },
};
