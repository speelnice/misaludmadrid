'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Specialist, Service } from '@/lib/types';

type SP = Specialist & { services?: Service[] };

const EMPTY: Omit<Specialist, 'id' | 'created_at' | 'updated_at' | 'services'> = {
  name: '', title: '', bio: null, photo_url: null, instagram_url: null,
  wellhub_url: null, google_reviews_url: null, display_order: 0, active: true,
};

const iS: React.CSSProperties = {
  width: '100%', padding: '.7rem 1rem', border: '1.5px solid var(--border-color)',
  borderRadius: '.5rem', fontSize: '.9rem', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)',
};
const lS: React.CSSProperties = {
  display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.06em',
};

export default function EspecialistasAdmin() {
  const [specialists, setSpecialists] = useState<SP[]>([]);
  const [editing, setEditing] = useState<Partial<SP> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const sb = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await sb.from('specialists').select('*, services(*)').order('display_order');
    setSpecialists((data ?? []) as SP[]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('');
    const { id, services, created_at, updated_at, ...payload } = editing as SP;
    const { error } = id
      ? await sb.from('specialists').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
      : await sb.from('specialists').insert(payload);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Guardado ✓'); setEditing(null); load();
  }

  async function toggle(sp: Specialist) {
    await sb.from('specialists').update({ active: !sp.active }).eq('id', sp.id);
    load();
  }

  const fields: [string, keyof Specialist][] = [
    ['Nombre *', 'name'], ['Título / Especialidad *', 'title'],
    ['URL Wellhub', 'wellhub_url'], ['URL Google Reviews', 'google_reviews_url'],
    ['URL Instagram', 'instagram_url'], ['URL Foto', 'photo_url'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)' }}>Especialistas</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Gestiona los perfiles de Iván y Matteo</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}>+ Nuevo especialista</button>
      </div>

      {msg && (
        <div style={{ background: msg.startsWith('Error') ? 'rgba(192,57,43,.08)' : 'rgba(45,106,79,.1)', border: `1px solid ${msg.startsWith('Error') ? 'rgba(192,57,43,.25)' : 'rgba(45,106,79,.3)'}`, borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: msg.startsWith('Error') ? '#c0392b' : 'var(--brand)' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {specialists.map(sp => (
          <div key={sp.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brand)', flexShrink: 0 }}>
              {sp.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{sp.name}</span>
                <span style={{ fontSize: '.72rem', background: sp.active ? 'rgba(45,106,79,.1)' : 'rgba(150,150,150,.15)', color: sp.active ? 'var(--brand)' : 'var(--text-muted)', padding: '.15rem .55rem', borderRadius: '999px', fontWeight: 600 }}>
                  {sp.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div style={{ fontSize: '.875rem', color: 'var(--text-secondary)', marginBottom: '.375rem' }}>{sp.title}</div>
              {sp.services && <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{sp.services.length} servicios</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                {sp.wellhub_url && <a href={sp.wellhub_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: 'var(--brand)' }}>Wellhub ↗</a>}
                {sp.google_reviews_url && <a href={sp.google_reviews_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: 'var(--brand)' }}>Google Reviews ↗</a>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setEditing(sp)} style={{ fontSize: '.8rem', padding: '.4rem .9rem' }}>Editar</button>
              <button className="btn btn-secondary" onClick={() => toggle(sp)} style={{ fontSize: '.8rem', padding: '.4rem .9rem' }}>{sp.active ? 'Desactivar' : 'Activar'}</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>
                {(editing as Specialist).id ? 'Editar especialista' : 'Nuevo especialista'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--text-muted)', fontSize: '1.25rem', padding: '.25rem .5rem' }}>✕</button>
            </div>
            <form onSubmit={save}>
              {fields.map(([label, key]) => (
                <div key={key as string} style={{ marginBottom: '.875rem' }}>
                  <label style={lS}>{label}</label>
                  <input
                    value={((editing[key] ?? '') as string)}
                    onChange={e => setEditing(p => p ? { ...p, [key]: e.target.value || null } : p)}
                    style={iS}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '.875rem' }}>
                <label style={lS}>Biografía</label>
                <textarea
                  value={(editing.bio ?? '')}
                  onChange={e => setEditing(p => p ? { ...p, bio: e.target.value || null } : p)}
                  rows={3} style={{ ...iS, resize: 'vertical' as const }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.25rem' }}>
                <input type="checkbox" checked={!!editing.active} onChange={e => setEditing(p => p ? { ...p, active: e.target.checked } : p)} style={{ width: '16px', height: '16px', accentColor: 'var(--brand)' }} />
                Especialista activo
              </label>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
