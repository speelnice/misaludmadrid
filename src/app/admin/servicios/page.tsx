'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Service, Specialist } from '@/lib/types';

type SvcWithSpecialist = Service & { specialists?: { name: string } };

const iS: React.CSSProperties = {
  width: '100%', padding: '.7rem 1rem', border: '1.5px solid var(--border-color)',
  borderRadius: '.5rem', fontSize: '.9rem', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)',
};
const lS: React.CSSProperties = {
  display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.06em',
};

export default function ServiciosAdmin() {
  const [services, setServices] = useState<SvcWithSpecialist[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const sb = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: s }, { data: sp }] = await Promise.all([
      sb.from('services').select('*, specialists(name)').order('specialist_id').order('display_order'),
      sb.from('specialists').select('id, name, title').order('display_order'),
    ]);
    setServices((s ?? []) as SvcWithSpecialist[]);
    setSpecialists((sp ?? []) as Specialist[]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('');
    const payload = { ...editing } as Record<string, unknown>;
    const id = payload.id as string | undefined;
    delete payload.id; delete payload.created_at; delete payload.specialists;
    const { error } = id
      ? await sb.from('services').update(payload).eq('id', id)
      : await sb.from('services').insert(payload);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Guardado ✓'); setEditing(null); load();
  }

  async function del(id: string) {
    await sb.from('services').delete().eq('id', id); load();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)' }}>Servicios</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Tratamientos agrupados por especialista</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ name: '', description: null, duration_minutes: null, price_eur: null, display_order: 0, active: true })}>
          + Nuevo servicio
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(45,106,79,.1)', border: '1px solid rgba(45,106,79,.3)', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: 'var(--brand)' }}>
          {msg}
        </div>
      )}

      {specialists.map(sp => {
        const spSvcs = services.filter(s => s.specialist_id === sp.id);
        return (
          <div key={sp.id} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.875rem', color: 'var(--brand)', fontWeight: 700 }}>
                {sp.name.charAt(0)}
              </span>
              {sp.name} · {sp.title}
              <span style={{ fontSize: '.72rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '.15rem .55rem', borderRadius: '999px' }}>
                {spSvcs.length} servicios
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {spSvcs.map(s => (
                <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '.75rem', padding: '.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
                    {s.duration_minutes && <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginLeft: '.75rem' }}>{s.duration_minutes} min</span>}
                    {s.price_eur && <span style={{ fontSize: '.78rem', color: 'var(--brand)', marginLeft: '.5rem' }}>€{s.price_eur}</span>}
                    {!s.active && <span style={{ fontSize: '.72rem', background: 'rgba(150,150,150,.15)', color: 'var(--text-muted)', padding: '.15rem .5rem', borderRadius: '999px', marginLeft: '.5rem' }}>Inactivo</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setEditing(s)} style={{ fontSize: '.78rem', padding: '.35rem .75rem' }}>Editar</button>
                    <button onClick={() => del(s.id)} style={{ fontSize: '.78rem', padding: '.35rem .6rem', background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.2)', borderRadius: '.375rem', color: '#c0392b', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              ))}
              {spSvcs.length === 0 && (
                <div style={{ fontSize: '.875rem', color: 'var(--text-muted)', padding: '.75rem', background: 'var(--bg-secondary)', borderRadius: '.75rem' }}>
                  Sin servicios. Añade el primero.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>
                {(editing as Service).id ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
            </div>
            <form onSubmit={save}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lS}>Especialista</label>
                <select value={editing.specialist_id ?? ''} onChange={e => setEditing(p => p ? { ...p, specialist_id: e.target.value } : p)} style={{ ...iS }}>
                  {specialists.map(sp => <option key={sp.id} value={sp.id}>{sp.name} — {sp.title}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lS}>Nombre del servicio *</label>
                <input value={editing.name ?? ''} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} style={iS} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lS}>Descripción</label>
                <input value={(editing.description ?? '')} onChange={e => setEditing(p => p ? { ...p, description: e.target.value || null } : p)} style={iS} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={lS}>Duración (min)</label>
                  <input type="number" value={(editing.duration_minutes ?? '')} onChange={e => setEditing(p => p ? { ...p, duration_minutes: e.target.value ? +e.target.value : null } : p)} style={iS} />
                </div>
                <div>
                  <label style={lS}>Precio (€)</label>
                  <input type="number" step=".01" value={(editing.price_eur ?? '')} onChange={e => setEditing(p => p ? { ...p, price_eur: e.target.value ? +e.target.value : null } : p)} style={iS} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.25rem' }}>
                <input type="checkbox" checked={!!editing.active} onChange={e => setEditing(p => p ? { ...p, active: e.target.checked } : p)} style={{ width: '16px', height: '16px', accentColor: 'var(--brand)' }} />
                Servicio activo
              </label>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
