// src/components/onboarding/steps/StepServices.tsx
// Step 4 — add services: duration, price, category, specialist assignment
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FormField, PrimaryBtn, BackBtn, StepHeader, inputStyle } from '../shared';

type SvcF = {
  name: string; category: string; duration_minutes: string;
  price_eur: string; deposit_eur: string;
  allow_home_visits: boolean; description: string; specialist_id: string;
};
const EMPTY = (): SvcF => ({
  name: '', category: 'General', duration_minutes: '60',
  price_eur: '', deposit_eur: '', allow_home_visits: false,
  description: '', specialist_id: '',
});

const CATS = ['General','Fisioterapia','Psicología','Nutrición','Osteopatía','Otro'];
const DURS = ['30','45','60','90','120'];

export function StepServices({ goNext, goBack }: { goNext: () => void; goBack: () => void }) {
  const [list,        setList]        = useState<SvcF[]>([EMPTY()]);
  const [specialists, setSpecialists] = useState<{ id: string; name: string }[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    createClient().from('specialists').select('id,name').order('display_order')
      .then(({ data }) => setSpecialists(data || []));
  }, []);

  const valid = list.some(s => s.name.trim().length > 0);

  const upd = (i: number, k: keyof SvcF, v: string | boolean) =>
    setList(p => p.map((s, j) => j === i ? { ...s, [k]: v } : s));
  const add = () => setList(p => [...p, EMPTY()]);
  const rem = (i: number) => setList(p => p.filter((_, j) => j !== i));

  async function handleSave() {
    setSaving(true); setError('');
    const sb   = createClient();
    const rows = list
      .filter(s => s.name.trim().length > 0)
      .map((s, i) => ({
        name:             s.name,
        category:         s.category,
        duration_minutes: parseInt(s.duration_minutes) || 60,
        price_eur:        s.price_eur    ? parseFloat(s.price_eur)    : null,
        deposit_eur:      s.deposit_eur  ? parseFloat(s.deposit_eur)  : null,
        allow_home_visits: s.allow_home_visits,
        description:      s.description,
        specialist_id:    s.specialist_id || null,
        display_order:    i,
        active:           true,
      }));
    const { error } = await sb.from('services').insert(rows);
    if (error) { setError(error.message); setSaving(false); return; }
    // Mark onboarding complete
    await sb.from('settings')
      .upsert({ key: 'onboarding_completed', value: 'true' }, { onConflict: 'key' });
    goNext();
  }

  return (
    <div>
      <StepHeader step="04" title="Servicios y tratamientos"
        desc="Define los tratamientos que ofreces. Los clientes los verán al reservar." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {list.map((svc, i) => (
          <div key={i} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <span style={lbl}>Servicio {i + 1}</span>
              {list.length > 1 && (
                <button onClick={() => rem(i)} style={xBtn} aria-label="Eliminar">✕</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <FormField label="Nombre del servicio *">
                <input style={inputStyle} type="text" placeholder="Sesión de fisioterapia"
                  value={svc.name} onChange={e => upd(i, 'name', e.target.value)} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Categoría">
                  <select style={inputStyle} value={svc.category}
                    onChange={e => upd(i, 'category', e.target.value)}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Duración">
                  <select style={inputStyle} value={svc.duration_minutes}
                    onChange={e => upd(i, 'duration_minutes', e.target.value)}>
                    {DURS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </FormField>
                <FormField label="Especialista">
                  <select style={inputStyle} value={svc.specialist_id}
                    onChange={e => upd(i, 'specialist_id', e.target.value)}>
                    <option value="">Cualquiera</option>
                    {specialists.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Precio (€)">
                  <input style={inputStyle} type="number" min="0" placeholder="60"
                    value={svc.price_eur} onChange={e => upd(i, 'price_eur', e.target.value)} />
                </FormField>
                <FormField label="Señal / depósito (€)">
                  <input style={inputStyle} type="number" min="0" placeholder="20"
                    value={svc.deposit_eur} onChange={e => upd(i, 'deposit_eur', e.target.value)} />
                </FormField>
              </div>

              <FormField label="Descripción breve">
                <textarea style={{ ...inputStyle, minHeight: '56px', resize: 'vertical' }}
                  placeholder="Sesión individual de tratamiento..."
                  value={svc.description} onChange={e => upd(i, 'description', e.target.value)} />
              </FormField>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={svc.allow_home_visits}
                  onChange={e => upd(i, 'allow_home_visits', e.target.checked)} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text, #cdccca)' }}>
                  Permite visitas a domicilio
                </span>
              </label>
            </div>
          </div>
        ))}

        <button onClick={add} style={addBtn}>+ Añadir otro servicio</button>
      </div>

      {error && (
        <p style={{ color: '#d163a7', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <BackBtn onClick={goBack} />
        <PrimaryBtn onClick={handleSave} disabled={!valid || saving}>
          {saving ? 'Guardando...' : 'Finalizar configuración →'}
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
