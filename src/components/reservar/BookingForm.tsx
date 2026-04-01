// src/components/reservar/BookingForm.tsx
// Client component — patient details form + booking submission to Supabase
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Service    = { id: string; name: string; duration_minutes: number; price_eur: number | null; deposit_eur: number | null; category: string };
type Specialist = { id: string; name: string; title: string };

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}

export function BookingForm({ service, specialist, fecha, horaInicio, horaFin }: {
  service:    Service;
  specialist: Specialist;
  fecha:      string;
  horaInicio: string;
  horaFin:    string;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre:    '',
    apellidos: '',
    email:     '',
    phone:     '',
    notas:     '',
    lopd:      false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const valid =
    form.nombre.trim().length > 0 &&
    form.apellidos.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.lopd;

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!valid) return;
    setSaving(true); setError('');
    const sb = createClient();

    const { data, error } = await sb
      .from('citas')
      .insert({
        service_id:    service.id,
        specialist_id: specialist.id,
        fecha,
        hora_inicio:   horaInicio,
        hora_fin:      horaFin,
        patient_name:  `${form.nombre} ${form.apellidos}`.trim(),
        patient_email: form.email,
        patient_phone: form.phone,
        notas:         form.notas || null,
        estado:        'pendiente',
        source:        'web',
      })
      .select('id')
      .single();

    if (error) { setError(error.message); setSaving(false); return; }
    router.push(`/reservar/confirmacion?citaId=${data.id}`);
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem',
      display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

      {/* Form */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text, #28251d)',
          fontFamily: 'var(--font-display, serif)', marginBottom: '0.5rem' }}>
          Tus datos de contacto
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #7a7974)', marginBottom: '2rem', lineHeight: 1.5 }}>
          Necesitamos tus datos para confirmar la cita y enviarte el recordatorio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Nombre *">
              <input style={inp} type="text" placeholder="Ana"
                value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </Field>
            <Field label="Apellidos *">
              <input style={inp} type="text" placeholder="García López"
                value={form.apellidos} onChange={e => set('apellidos', e.target.value)} />
            </Field>
          </div>

          <Field label="Email *">
            <input style={inp} type="email" placeholder="ana@email.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>

          <Field label="Teléfono / WhatsApp *">
            <input style={inp} type="tel" placeholder="+34 600 000 000"
              value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>

          <Field label="Notas para el especialista (opcional)">
            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
              placeholder="Cualquier información relevante sobre tu consulta..."
              value={form.notas} onChange={e => set('notas', e.target.value)} />
          </Field>

          {/* LOPD */}
          <label style={{ display: 'flex', gap: '0.625rem', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input type="checkbox" style={{ marginTop: '2px', flexShrink: 0 }}
              checked={form.lopd} onChange={e => set('lopd', e.target.checked)} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #7a7974)', lineHeight: 1.5 }}>
              He leído y acepto la{' '}
              <a href="/privacidad" target="_blank" rel="noopener noreferrer"
                style={{ color: '#01696f' }}>política de privacidad</a>{' '}
              y consiento el tratamiento de mis datos para la gestión de la cita. *
            </span>
          </label>
        </div>

        {error && (
          <p style={{ color: '#a12c7b', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={!valid || saving} style={{
          marginTop: '1.5rem', padding: '0.875rem 2rem',
          background: valid && !saving ? '#01696f' : '#e6e4df',
          color: valid && !saving ? '#fff' : '#bab9b4',
          border: 'none', borderRadius: '0.5rem',
          fontSize: '0.95rem', fontWeight: 600,
          cursor: valid && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s', width: '100%',
        }}>
          {saving ? 'Confirmando...' : 'Confirmar reserva →'}
        </button>
      </div>

      {/* Booking summary sidebar */}
      <div style={{
        background: 'var(--color-surface, #f9f8f5)',
        border: '1.5px solid var(--color-border, #d4d1ca)',
        borderRadius: '0.75rem', padding: '1.5rem',
        position: 'sticky', top: '1.5rem',
      }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted, #7a7974)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
          Resumen de tu cita
        </p>

        {[
          ['Servicio',      service.name],
          ['Especialista',  `${specialist.name}${specialist.title ? ` · ${specialist.title}` : ''}`],
          ['Fecha',         formatDate(fecha)],
          ['Hora',          `${horaInicio} – ${horaFin}`],
          ['Duración',      `${service.duration_minutes} min`],
          ...(service.price_eur != null ? [['Precio', `${service.price_eur}€`]] : []),
          ...(service.deposit_eur != null ? [['Señal', `${service.deposit_eur}€`]] : []),
        ].map(([k, v]) => (
          <div key={k} style={{ marginBottom: '0.875rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #7a7974)', margin: 0,
              textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{k}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text, #28251d)', margin: 0, fontWeight: 500 }}>{v}</p>
          </div>
        ))}

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border, #d4d1ca)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #7a7974)', lineHeight: 1.5, margin: 0 }}>
            Recibirás un email de confirmación con los detalles de tu cita.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700,
        color: 'var(--color-text-muted, #7a7974)', marginBottom: '0.3rem',
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: '1.5px solid var(--color-border, #d4d1ca)',
  borderRadius: '0.5rem', fontSize: '0.875rem',
  background: 'var(--color-surface-2, #fbfbf9)',
  color: 'var(--color-text, #28251d)',
  fontFamily: 'var(--font-body, sans-serif)',
  outline: 'none', transition: 'border-color 0.15s',
};
