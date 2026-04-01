// src/components/reservar/SlotPicker.tsx
// Client component — specialist tabs, mini calendar, time slot grid
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type Specialist = { id: string; name: string; title: string; bio: string | null; phone: string | null };
type Availability = {
  specialist_id: string; day_of_week: number; // 0=Sun … 6=Sat
  start_time: string; end_time: string;
};
type Booked = { specialist_id: string; fecha: string; hora_inicio: string; hora_fin: string };
type Service = { id: string; name: string; duration_minutes: number; price_eur: number | null; deposit_eur: number | null };

const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  let cur = start;
  while (cur < end) {
    const next = addMinutes(cur, duration);
    if (next <= end) slots.push(cur);
    cur = next;
  }
  return slots;
}

export function SlotPicker({ service, specialists, availability, booked }: {
  service: Service;
  specialists: Specialist[];
  availability: Availability[];
  booked: Booked[];
}) {
  const router = useRouter();
  const today  = new Date(); today.setHours(0,0,0,0);

  const [specIdx,   setSpecIdx]   = useState(0);
  const [calYear,   setCalYear]   = useState(today.getFullYear());
  const [calMonth,  setCalMonth]  = useState(today.getMonth());
  const [selDate,   setSelDate]   = useState<string | null>(null);
  const [selSlot,   setSelSlot]   = useState<string | null>(null);

  const specialist = specialists[specIdx];

  // Days in current calendar month
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow    = new Date(calYear, calMonth, 1).getDay();

  // Available days of week for this specialist
  const availDow = useMemo(() =>
    new Set(availability.filter(a => a.specialist_id === specialist?.id).map(a => a.day_of_week)),
    [availability, specialist]
  );

  // Slots for selected date
  const slots = useMemo(() => {
    if (!selDate || !specialist) return [];
    const dow = new Date(selDate + 'T12:00:00').getDay();
    const rule = availability.find(a => a.specialist_id === specialist.id && a.day_of_week === dow);
    if (!rule) return [];

    const all = generateSlots(rule.start_time, rule.end_time, service.duration_minutes);

    // Filter out booked slots
    const bookedToday = booked.filter(b => b.specialist_id === specialist.id && b.fecha === selDate);
    return all.filter(slot => {
      const slotEnd = addMinutes(slot, service.duration_minutes);
      return !bookedToday.some(b => slot < b.hora_fin && slotEnd > b.hora_inicio);
    });
  }, [selDate, specialist, availability, booked, service.duration_minutes]);

  function handleContinue() {
    if (!selDate || !selSlot || !specialist) return;
    const params = new URLSearchParams({
      serviceId:     service.id,
      specialistId:  specialist.id,
      fecha:         selDate,
      hora:          selSlot,
    });
    router.push(`/reservar/datos?${params.toString()}`);
  }

  const canContinue = selDate && selSlot && specialist;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: specialists.length > 1 ? '220px 1fr' : '1fr', gap: '2rem' }}>

        {/* Specialist selector (only if >1) */}
        {specialists.length > 1 && (
          <div>
            <p style={sectionLabel}>Especialista</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {specialists.map((sp, i) => (
                <button key={sp.id} onClick={() => { setSpecIdx(i); setSelDate(null); setSelSlot(null); }}
                  style={{
                    padding: '0.875rem', borderRadius: '0.625rem', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                    border: `1.5px solid ${i === specIdx ? '#01696f' : 'var(--color-border, #d4d1ca)'}`,
                    background: i === specIdx ? 'rgba(1,105,111,0.06)' : 'var(--color-surface, #f9f8f5)',
                  }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--color-text, #28251d)' }}>
                    {sp.name}
                  </p>
                  {sp.title && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #7a7974)', margin: 0 }}>
                      {sp.title}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Calendar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={sectionLabel}>Selecciona un día</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                  else setCalMonth(m => m - 1);
                  setSelDate(null); setSelSlot(null);
                }} style={navBtn}>‹</button>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '140px', textAlign: 'center', color: 'var(--color-text, #28251d)' }}>
                  {MONTHS_ES[calMonth]} {calYear}
                </span>
                <button onClick={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                  else setCalMonth(m => m + 1);
                  setSelDate(null); setSelSlot(null);
                }} style={navBtn}>›</button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {DAYS_ES.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700,
                  color: 'var(--color-text-muted, #7a7974)', padding: '0.25rem',
                  textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day     = i + 1;
                const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const dow     = new Date(dateStr + 'T12:00:00').getDay();
                const isPast  = new Date(dateStr + 'T23:59:59') < today;
                const avail   = !isPast && availDow.has(dow);
                const isSel   = selDate === dateStr;

                return (
                  <button key={day} disabled={!avail} onClick={() => { setSelDate(dateStr); setSelSlot(null); }}
                    style={{
                      aspectRatio: '1', borderRadius: '0.5rem', border: 'none',
                      fontSize: '0.85rem', fontWeight: isSel ? 700 : 400,
                      cursor: avail ? 'pointer' : 'default', transition: 'all 0.12s',
                      background: isSel ? '#01696f' : avail ? 'var(--color-surface, #f9f8f5)' : 'transparent',
                      color: isSel ? '#fff' : avail ? 'var(--color-text, #28251d)' : 'var(--color-text-faint, #bab9b4)',
                      outline: avail && !isSel ? '1px solid var(--color-border, #d4d1ca)' : 'none',
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selDate && (
            <div>
              <p style={sectionLabel}>Hora disponible</p>
              {slots.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #7a7974)' }}>
                  No hay horas disponibles para este día. Prueba con otro día.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setSelSlot(slot)} style={{
                      padding: '0.5rem 1rem', borderRadius: '0.5rem',
                      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.12s',
                      border: `1.5px solid ${selSlot === slot ? '#01696f' : 'var(--color-border, #d4d1ca)'}`,
                      background: selSlot === slot ? '#01696f' : 'var(--color-surface, #f9f8f5)',
                      color: selSlot === slot ? '#fff' : 'var(--color-text, #28251d)',
                    }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Continue */}
          <div style={{ paddingTop: '0.5rem' }}>
            <button onClick={handleContinue} disabled={!canContinue} style={{
              padding: '0.875rem 2rem', borderRadius: '0.5rem', border: 'none',
              fontSize: '0.95rem', fontWeight: 600, cursor: canContinue ? 'pointer' : 'not-allowed',
              background: canContinue ? '#01696f' : '#e6e4df',
              color: canContinue ? '#fff' : '#bab9b4',
              transition: 'all 0.15s',
            }}>
              Continuar →
            </button>
            {canContinue && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #7a7974)', marginTop: '0.5rem' }}>
                {selDate} a las {selSlot} con {specialist?.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted, #7a7974)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
};
const navBtn: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '0.375rem', border: '1.5px solid var(--color-border, #d4d1ca)',
  background: 'transparent', cursor: 'pointer', fontSize: '1rem',
  color: 'var(--color-text, #28251d)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
