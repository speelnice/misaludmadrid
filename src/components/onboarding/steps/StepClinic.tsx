// src/components/onboarding/steps/StepClinic.tsx
// Step 1 — clinic name, contact info, description
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FormField, PrimaryBtn, StepHeader, inputStyle } from '../shared';

export function StepClinic({ goNext }: { goNext: () => void }) {
  const [form, setForm] = useState({
    site_name: '', contact_email: '', contact_phone: '', description: '', booking_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const valid = form.site_name.trim().length > 0 && form.contact_email.trim().length > 0;
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true); setError('');
    const sb = createClient();
    const rows = Object.entries(form).map(([key, value]) => ({ key, value }));
    const { error } = await sb.from('settings').upsert(rows, { onConflict: 'key' });
    if (error) { setError(error.message); setSaving(false); return; }
    goNext();
  }

  return (
    <div>
      <StepHeader step="01" title="Información de la clínica"
        desc="Estos datos aparecerán en los emails de confirmación y en la web." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label="Nombre de la clínica *">
          <input style={inputStyle} type="text" placeholder="MiSalud Madrid"
            value={form.site_name} onChange={e => set('site_name', e.target.value)} />
        </FormField>

        <FormField label="Email de contacto *">
          <input style={inputStyle} type="email" placeholder="hola@misalud.es"
            value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
        </FormField>

        <FormField label="Teléfono de contacto">
          <input style={inputStyle} type="tel" placeholder="+34 600 000 000"
            value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
        </FormField>

        <FormField label="Descripción breve">
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Clínica de salud y bienestar en Madrid..."
            value={form.description} onChange={e => set('description', e.target.value)} />
        </FormField>

        <FormField label="URL de reservas externa (opcional)">
          <input style={inputStyle} type="url" placeholder="https://calendly.com/..."
            value={form.booking_url} onChange={e => set('booking_url', e.target.value)} />
        </FormField>
      </div>

      {error && (
        <p style={{ color: '#d163a7', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryBtn onClick={handleSave} disabled={!valid || saving}>
          {saving ? 'Guardando...' : 'Continuar →'}
        </PrimaryBtn>
      </div>
    </div>
  );
}
