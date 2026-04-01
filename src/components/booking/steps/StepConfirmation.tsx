// src/components/booking/steps/StepConfirmation.tsx
'use client';

export function StepConfirmation({ booking, onClose }: { booking: any; onClose?: () => void }) {
  const { state, reset } = booking;

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {/* Success icon */}
      <div style={styles.iconWrap}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          style={{ color: 'var(--brand, #01696f)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <h3 style={styles.heading}>¡Reserva confirmada!</h3>
      <p style={styles.sub}>
        Recibirás un email de confirmación en{' '}
        <strong>{state.client_email}</strong>
      </p>

      {/* Summary card */}
      <div style={styles.card}>
        <SummaryRow label="Servicio"     value={state.service?.name} />
        <SummaryRow label="Especialista" value={state.specialist?.name} />
        <SummaryRow label="Lugar"
          value={state.location_type === 'home' ? `A domicilio · ${state.home_address}` : state.centro?.name} />
        <SummaryRow label="Fecha y hora"
          value={state.time_slot ? fmt(state.time_slot.slot_start) : ''} />
        {state.service?.price_eur && (
          <SummaryRow label="Total" value={`${state.service.price_eur}€`} highlight />
        )}
      </div>

      <p style={styles.hint}>
        Si necesitas cancelar o modificar tu cita, contáctanos con al menos 24h de antelación.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={() => { reset(); }}>
          Nueva reserva
        </button>
        {onClose && (
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem',
      padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--brand, #01696f)' : 'var(--text-primary)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  iconWrap: { width: '72px', height: '72px', borderRadius: '50%',
    background: 'rgba(1,105,111,0.1)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 1.25rem' },
  heading: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
    fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.5rem' },
  sub: { fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' },
  card: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: '0.625rem', padding: '0.75rem 1rem', textAlign: 'left', marginBottom: '1rem' },
  hint: { fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5,
    maxWidth: '340px', margin: '0 auto' },
};
