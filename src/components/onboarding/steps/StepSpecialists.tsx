// src/components/onboarding/steps/StepSpecialists.tsx
// Step 2 — add specialists. Starts with 3 cards, unlimited via + button.
// Only rows with a name filled in are saved — blank cards are ignored.
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FormField, PrimaryBtn, BackBtn, StepHeader, inputStyle } from '../shared';

type SF = { name: string; title: string; user_email: string; phone: string; bio: string };
const EMPTY = (): SF => ({ name: '', title: '', user_email: '', phone: '', bio: '' });

export function StepSpecialists({ goNext, goBack }: { goNext: () => void; goBack: () => void }) {
  const [list,   setList]   = useState<SF[]>([EMPTY(), EMPTY(), EMPTY()]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const valid = list.some(s => s.name.trim().length > 0);

  const upd = (i: number, k: keyof SF, v: string) =>
    setList(p => p.map((s, j) => j === i ? { ...s, [k]: v } : s));
  const add = () => setList(p => [...p, EMPTY()]);
  const rem = (i: number) => setList(p => p.filter((_, j) => j !== i));

  async function handleSave() {
    setSaving(true); setError('');
    const sb   = createClient();
    const rows = list
      .filter(s => s.name.trim().length > 0)
      .map((s, i) => ({ ...s, display_order: i, active: true }));
    const { error } = await sb.from('specialists').insert(rows);
    if (error) { setError(error.message); setSaving(false); return; }
    goNext();
  }

  return (
    <div>
      <StepHeader step="02" title="Tu equipo"
        desc="Añade los especialistas que ofrecen citas. Puedes añadir más desde el panel de administración en cualquier momento." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {list.map((sp, i) => (
          <div key={i} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <span style={lbl}>Especialista {i + 1}</span>
              {list.length > 1 && (
                <button onClick={() => rem(i)} style={xBtn} aria-label="Eliminar">✕</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Nombre completo *">
                  <input style={inputStyle} type="text" placeholder="Dra. Ana García"
                    value={sp.name} onChange={e => upd(i, 'name', e.target.value)} />
                </FormField>
                <FormField label="Especialidad">
                  <input style={inputStyle} type="text" placeholder="Fisioterapia"
                    value={sp.title} onChange={e => upd(i, 'title', e.target.value)} />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Email">
                  <input style={inputStyle} type="email" placeholder="ana@misalud.es"
                    value={sp.user_email} onChange={e => upd(i, 'user_email', e.target.value)} />
                </FormField>
                <FormField label="Teléfono / WhatsApp">
                  <input style={inputStyle} type="tel" placeholder="+34 600 000 000"
                    value={sp.phone} onChange={e => upd(i, 'phone', e.target.value)} />
                </FormField>
              </div>

              <FormField label="Bio breve">
                <textarea style={{ ...inputStyle, minHeight: '56px', resize: 'vertical' }}
                  placeholder="Especialista en rehabilitación..."
                  value={sp.bio} onChange={e => upd(i, 'bio', e.target.value)} />
              </FormField>
            </div>
          </div>
        ))}

        <button onClick={add} style={addBtn}>+ Añadir otro especialista</button>
      </div>

      {error && (
        <p style={{ color: '#d163a7', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <BackBtn onClick={goBack} />
        <PrimaryBtn onClick={handleSave} disabled={!valid || saving}>
          {saving ? 'Guardando...' : 'Continuar →'}
        </PrimaryBtn>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'var(--color-surface, #1c1b19)',
  border: '1px solid var(--color-border, #393836)',
  borderRadius: '0.75rem', padding: '1.25rem',
};
const lbl: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted, #797876)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};
const xBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--color-text-muted, #797876)', fontSize: '0.85rem', padding: '0.25rem',
};
const addBtn: React.CSSProperties = {
  width: '100%', padding: '0.75rem',
  border: '1.5px dashed var(--color-border, #393836)',
  borderRadius: '0.625rem', background: 'transparent',
  color: 'var(--color-primary, #4f98a3)',
  fontSize: '0.875rem', fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.15s',
};
