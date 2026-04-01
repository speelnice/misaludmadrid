// ============================================================
// src/components/booking/BookingForm.tsx
// Multi-step booking wizard — orchestrates all steps
// ============================================================

'use client';
import { useBooking } from '@/hooks/useBooking';
import { StepService }    from './steps/StepService';
import { StepSpecialist } from './steps/StepSpecialist';
import { StepDatetime }   from './steps/StepDatetime';
import { StepDetails }    from './steps/StepDetails';
import { StepConfirmation } from './steps/StepConfirmation';
import type { BookingStep } from '@/types';

const STEP_LABELS: Record<BookingStep, string> = {
  service:      'Servicio',
  specialist:   'Especialista',
  datetime:     'Fecha y hora',
  details:      'Tus datos',
  payment:      'Pago',
  confirmation: 'Confirmación',
};

const VISIBLE_STEPS: BookingStep[] = ['service', 'specialist', 'datetime', 'details', 'confirmation'];

export function BookingForm({ onClose }: { onClose?: () => void }) {
  const booking = useBooking();
  const { state, loading, error, canProceed, goBack, goNext, submitBooking } = booking;

  const isConfirmed = state.step === 'confirmation';
  const showBack    = state.step !== 'service' && !isConfirmed;
  const showNext    = ['service', 'specialist', 'datetime'].includes(state.step);
  const showSubmit  = state.step === 'details';

  async function handleSubmit() {
    await submitBooking();
  }

  return (
    <div style={styles.shell}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Reservar cita</h2>
          {!isConfirmed && (
            <p style={styles.subtitle}>{STEP_LABELS[state.step]}</p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      {!isConfirmed && (
        <div style={styles.progressWrap}>
          {VISIBLE_STEPS.filter(s => s !== 'confirmation').map((s, i) => {
            const idx     = VISIBLE_STEPS.indexOf(state.step);
            const stepIdx = VISIBLE_STEPS.indexOf(s);
            const done    = stepIdx < idx;
            const active  = s === state.step;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{
                  ...styles.progressDot,
                  background: done ? 'var(--brand, #01696f)' : active ? 'var(--brand, #01696f)' : 'var(--border-color)',
                  opacity: done ? 1 : active ? 1 : 0.4,
                  transform: active ? 'scale(1.2)' : 'scale(1)',
                }} />
                {i < VISIBLE_STEPS.length - 2 && (
                  <div style={{
                    ...styles.progressLine,
                    background: done ? 'var(--brand, #01696f)' : 'var(--border-color)',
                    opacity: done ? 1 : 0.3,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step content */}
      <div style={styles.body}>
        {error && (
          <div style={styles.errorBanner}>{error}</div>
        )}

        {state.step === 'service'      && <StepService    booking={booking} />}
        {state.step === 'specialist'   && <StepSpecialist booking={booking} />}
        {state.step === 'datetime'     && <StepDatetime   booking={booking} />}
        {state.step === 'details'      && <StepDetails    booking={booking} />}
        {state.step === 'confirmation' && <StepConfirmation booking={booking} onClose={onClose} />}
      </div>

      {/* Footer nav */}
      {!isConfirmed && (
        <div style={styles.footer}>
          {showBack ? (
            <button onClick={goBack} className="btn btn-ghost" disabled={loading}>
              ← Atrás
            </button>
          ) : <div />}

          {showNext && (
            <button
              onClick={goNext}
              className="btn btn-primary"
              disabled={!canProceed[state.step] || loading}
            >
              Continuar →
            </button>
          )}

          {showSubmit && (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!canProceed['details'] || loading}
            >
              {loading ? 'Enviando...' : 'Confirmar reserva'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex', flexDirection: 'column',
    background: 'var(--bg-card)',
    borderRadius: '1rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90dvh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 400,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '0.25rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    lineHeight: 0,
  },
  progressWrap: {
    display: 'flex', alignItems: 'center',
    padding: '0.75rem 1.5rem',
    gap: '4px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  progressDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  progressLine: {
    flex: 1, height: '2px', borderRadius: '1px',
    transition: 'background 0.2s',
  },
  body: {
    flex: 1, overflowY: 'auto',
    padding: '1.5rem',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  errorBanner: {
    background: 'rgba(161,44,123,0.08)',
    border: '1px solid rgba(161,44,123,0.2)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: 'var(--text-sm)',
    color: '#a12c7b',
    marginBottom: '1rem',
  },
};
