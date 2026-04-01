// src/components/booking/steps/StepDatetime.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import type { TimeSlot } from '@/types';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

export function StepDatetime({ booking }: { booking: any }) {
  const { state, selectDate, selectSlot } = booking;
  const [slots, setSlots]     = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Build week days starting from today
  const today  = new Date(); today.setHours(0,0,0,0);
  const weekStart = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDate = state.date;

  // Fetch slots whenever date or specialist changes
  const fetchSlots = useCallback(async (date: string) => {
    if (!state.specialist) return;
    setLoading(true);
    setSlots([]);
    try {
      const params = new URLSearchParams({
        specialistId: state.specialist.id,
        date,
        ...(state.service?.id   && { serviceId: state.service.id }),
        ...(state.centro?.id    && { centroId:  state.centro.id  }),
      });
      const res  = await fetch(`/api/availability?${params}`);
      const json = await res.json();
      setSlots(json.slots || []);
    } catch { setSlots([]); }
    setLoading(false);
  }, [state.specialist, state.service, state.centro]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // Group slots
  const mañana = slots.filter(s => new Date(s.slot_start).getHours() < 14);
  const tarde  = slots.filter(s => { const h = new Date(s.slot_start).getHours(); return h >= 14 && h < 20; });
  const noche  = slots.filter(s => new Date(s.slot_start).getHours() >= 20);

  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Week navigation */}
      <div>
        <div style={styles.weekNav}>
          <button onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
            disabled={weekOffset === 0} style={styles.navBtn}>‹</button>
          <span style={styles.monthLabel}>
            {MONTHS[weekStart.getMonth()]} {weekStart.getFullYear()}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)} style={styles.navBtn}>›</button>
        </div>

        <div style={styles.dayGrid}>
          {days.map(day => {
            const ymd      = toYMD(day);
            const isPast   = day < today;
            const isToday  = ymd === toYMD(today);
            const selected = ymd === selectedDate;
            return (
              <button key={ymd} disabled={isPast}
                onClick={() => { selectDate(ymd); }}
                style={{
                  ...styles.dayBtn,
                  ...(isPast   ? styles.dayPast   : {}),
                  ...(isToday  ? styles.dayToday  : {}),
                  ...(selected ? styles.daySelected : {}),
                }}>
                <span style={styles.dayName}>{WEEKDAYS[day.getDay()]}</span>
                <span style={styles.dayNum}>{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          {loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ width: '72px', height: '38px', borderRadius: '0.5rem',
                  background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {!loading && slots.length === 0 && (
            <div style={styles.noSlots}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              No hay horarios disponibles este día. Prueba otro.
            </div>
          )}

          {!loading && slots.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Mañana', mañana], ['Tarde', tarde], ['Noche', noche]].map(([label, group]) =>
                (group as TimeSlot[]).length > 0 && (
                  <div key={label as string}>
                    <p style={styles.periodLabel}>{label as string}</p>
                    <div style={styles.slotsGrid}>
                      {(group as TimeSlot[]).map(slot => {
                        const active = state.time_slot?.slot_start === slot.slot_start;
                        return (
                          <button key={slot.slot_start} onClick={() => selectSlot(slot)}
                            style={{ ...styles.slotBtn, ...(active ? styles.slotActive : {}) }}>
                            {fmt(slot.slot_start)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
          Selecciona un día para ver los horarios disponibles
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  weekNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  monthLabel: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' },
  navBtn: { padding: '0.25rem 0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' },
  dayGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.375rem' },
  dayBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem',
    padding: '0.5rem 0.25rem', border: '1.5px solid var(--border-color)', borderRadius: '0.5rem',
    background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.15s' },
  dayPast:     { opacity: 0.3, cursor: 'not-allowed' },
  dayToday:    { borderColor: 'rgba(1,105,111,0.4)' },
  daySelected: { borderColor: 'var(--brand, #01696f)', background: 'rgba(1,105,111,0.08)' },
  dayName: { fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.04em' },
  dayNum:  { fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' },
  periodLabel: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' },
  slotsGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  slotBtn: { padding: '0.5rem 0.875rem', border: '1.5px solid var(--border-color)',
    borderRadius: '0.5rem', background: 'var(--bg-secondary)', fontSize: 'var(--text-sm)',
    fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
    fontVariantNumeric: 'tabular-nums' },
  slotActive: { borderColor: 'var(--brand, #01696f)', background: 'var(--brand, #01696f)',
    color: '#fff' },
  noSlots: { textAlign: 'center', padding: '1.5rem', fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)', lineHeight: 1.5 },
};
