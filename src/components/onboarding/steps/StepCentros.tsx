// src/components/onboarding/steps/StepCentros.tsx
// Step 3 — add clinic locations / centros
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FormField, PrimaryBtn, BackBtn, StepHeader, inputStyle } from '../shared';

type CF = { name: string; address: string; district: string; phone: string; maps_url: string };
const EMPTY = (): CF => ({ name: '', address: '', district: '', phone: '', maps_url: '' });

export function StepCentros({ goNext, goBack }: { goNext: () => void; goBack: () => void }) {
  const [list,   setList]   = useState<CF[]>([EMPTY()]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const valid = list.some(c => c.name.trim().length > 0 && c.address.trim().length > 0);

  const upd = (i: number, k: keyof CF, v: string) =>
    setList(p => p.map((c, j) => j === i ? { ...c, [k]: v } : c));
  const add = () => setList(p => [...p, EMPTY()]);
  const rem = (i: number) => setList(p => p.filter((_, j) => j !== i));

  async function handleSave() {
    setSaving(true); setError('');
    const sb   = createClient();
    const rows = list
      .filter(c => c.name.trim().length > 0)
      .map((c, i) => ({ ...c, display_order: i, active: true }));
    const { error } = await sb.from('centros').insert(rows);
    if (error) { setError(error.message); setSaving(false); return; }
    goNext();
  }

  return (
    <div>
      <StepHeader step="03" title="Centros y ubicaciones"
        desc="¿Dónde se realizan las sesiones? Añade cada ubicación. Puedes añadir más desde el panel en cualquier momento." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {list.map((c, i) => (
          <div key={i} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <span style={lbl}>Centro {i + 1}</span>
              {list.length > 1 && (
                <button onClick={() => rem(i)} style={xBtn} aria-label="Eliminar">✕</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <FormField label="Nombre del centro *">
                <input style={inputStyle} type="text" placeholder="Centro MiSalud Retiro"
                  value={c.name} onChange={e => upd(i, 'name', e.target.value)} />
              </FormField>

              <FormField label="Dirección completa *">
                <input style={inputStyle} type="text" placeholder="Calle Mayor 1, Madrid 28001"
                  value={c.address} onChange={e => upd(i, 'address', e.target.value)} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Barrio / Distrito">
                  <input style={inputStyle} type="text" placeholder="Retiro"
                    value={c.district} onChange={e => upd(i, 'district', e.target.value)} />
                </FormField>
                <FormField label="Teléfono">
                  <input style={inputStyle} type="tel" placeholder="+34 910 000 000"
                    value={c.phone} onChange={e => upd(i, 'phone', e.target.value)} />
                </FormField>
              </div>

              <FormField label="URL Google Maps (opcional)">
                <input style={inputStyle} type="url" placeholder="https://maps.google.com/..."
                  value={c.maps_url} onChange={e => upd(i, 'maps_url', e.target.value)} />
              </FormField>
            </div>
          </div>
        ))}

        <button onClick={add} style={addBtn}>+ Añadir otro centro</button>
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
