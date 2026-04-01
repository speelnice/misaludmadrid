'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Centro } from '@/lib/types';

const EMPTY: Omit<Centro, 'id' | 'created_at' | 'updated_at'> = {
  name: '', address: '', district: null, city: 'Madrid',
  maps_url: null, phone: null, description: null, photo_url: null,
  display_order: 0, active: true,
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

export default function CentrosAdmin() {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [editing, setEditing] = useState<Partial<Centro> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const sb = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await sb.from('centros').select('*').order('display_order');
    setCentros((data ?? []) as Centro[]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('');
    const { id, created_at, updated_at, ...payload } = editing as Centro;
    const { error } = id
      ? await sb.from('centros').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
      : await sb.from('centros').insert(payload);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Guardado ✓'); setEditing(null); load();
  }

  async function del(id: string) {
    await sb.from('centros').delete().eq('id', id);
    setDeleting(null); load();
  }

  const fields: [string, keyof Centro][] = [
    ['Nombre *', 'name'], ['Dirección completa *', 'address'],
    ['Distrito', 'district'], ['Ciudad', 'city'],
    ['URL Google Maps', 'maps_url'], ['Teléfono', 'phone'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)' }}>Centros Asociados</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{centros.length} centros registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}>+ Nuevo centro</button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(45,106,79,.1)', border: '1px solid rgba(45,106,79,.3)', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: 'var(--brand)' }}>
          {msg}
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              {['Nombre', 'Dirección', 'Distrito', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '.7rem 1rem', textAlign: 'left', fontSize: '.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {centros.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < centros.length - 1 ? '1px solid var(--border-color)' : '' }}>
                <td style={{ padding: '.875rem 1rem', fontSize: '.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</td>
                <td style={{ padding: '.875rem 1rem', fontSize: '.85rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</td>
                <td style={{ padding: '.875rem 1rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>{c.district ?? '—'}</td>
                <td style={{ padding: '.875rem 1rem' }}>
                  <span style={{ fontSize: '.72rem', background: c.active ? 'rgba(45,106,79,.1)' : 'rgba(150,150,150,.15)', color: c.active ? 'var(--brand)' : 'var(--text-muted)', padding: '.15rem .55rem', borderRadius: '999px', fontWeight: 600 }}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setEditing(c)} style={{ fontSize: '.78rem', padding: '.35rem .75rem' }}>Editar</button>
                    <button onClick={() => setDeleting(c.id)} style={{ fontSize: '.78rem', padding: '.35rem .75rem', background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.2)', borderRadius: '.375rem', color: '#c0392b', cursor: 'pointer' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {centros.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', fontSize: '.875rem', color: 'var(--text-muted)' }}>Sin centros registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>
                {(editing as Centro).id ? 'Editar centro' : 'Nuevo centro'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
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
                <label style={lS}>Descripción</label>
                <textarea
                  value={(editing.description ?? '')}
                  onChange={e => setEditing(p => p ? { ...p, description: e.target.value || null } : p)}
                  rows={2} style={{ ...iS, resize: 'vertical' as const }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!editing.active} onChange={e => setEditing(p => p ? { ...p, active: e.target.checked } : p)} style={{ width: '16px', height: '16px', accentColor: 'var(--brand)' }} />
                  Centro activo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <label style={lS}>Orden</label>
                  <input type="number" value={editing.display_order ?? 0} onChange={e => setEditing(p => p ? { ...p, display_order: +e.target.value } : p)} style={{ ...iS, width: '80px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '.5rem' }}>¿Eliminar este centro?</h3>
            <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancelar</button>
              <button onClick={() => del(deleting)} style={{ padding: '.6rem 1.25rem', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
