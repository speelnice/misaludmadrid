// src/components/booking/steps/StepDetails.tsx
'use client';
import type { BookingFormState } from '@/types';

export function StepDetails({ booking }: { booking: any }) {
  const { state, updateClientDetails } = booking;

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Booking summary */}
      <div style={styles.summary}>
        <p style={styles.summaryTitle}>Resumen de tu cita</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
          <Row label="Servicio"     value={state.service?.name} />
          <Row label="Especialista" value={state.specialist?.name} />
          <Row label="Lugar"        value={state.location_type === 'home' ? 'A domicilio' : state.centro?.name} />
          <Row label="Fecha y hora" value={state.time_slot ? fmt(state.time_slot.slot_start) : ''} />
          {state.service?.price_eur && (
            <Row label="Precio" value={`${state.service.price_eur}€`} highlight />
          )}
        </div>
      </div>

      {/* Client form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <p style={styles.sectionLabel}>Tus datos</p>

        <Field label="Nombre completo *">
          <input style={styles.input} type="text" placeholder="Ana García"
            value={state.client_name}
            onChange={e => updateClientDetails({ client_name: e.target.value })} />
        </Field>

        <Field label="Email *">
          <input style={styles.input} type="email" placeholder="ana@email.com"
            value={state.client_email}
            onChange={e => updateClientDetails({ client_email: e.target.value })} />
        </Field>

        <Field label="Teléfono">
          <input style={styles.input} type="tel" placeholder="+34 600 000 000"
            value={state.client_phone}
            onChange={e => updateClientDetails({ client_phone: e.target.value })} />
        </Field>

        {state.location_type === 'home' && (
          <Field label="Dirección completa *">
            <input style={styles.input} type="text" placeholder="Calle Mayor 1, 2ºA, Madrid"
              value={state.home_address}
              onChange={e => updateClientDetails({ home_address: e.target.value })} />
          </Field>
        )}

        <Field label="Notas adicionales">
          <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            placeholder="Alergias, condiciones especiales, preferencias..."
            value={state.client_notes}
            onChange={e => updateClientDetails({ client_notes: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--brand, #01696f)' : 'var(--text-primary)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: '0.3rem',
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  summary: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: '0.625rem', padding: '1rem' },
  summaryTitle: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em' },
  sectionLabel: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '0.625rem 0.875rem',
    border: '1.5px solid var(--border-color)', borderRadius: '0.5rem',
    fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' },
};
