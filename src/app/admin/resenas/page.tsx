'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Review, Specialist } from '@/lib/types';

const EMPTY: Omit<Review, 'id' | 'created_at'> = {
  specialist_id: null, author_name: '', author_location: null,
  rating: 5, content: '', source: 'google', verified: false,
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

export default function ResenasAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const sb = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: r }, { data: sp }] = await Promise.all([
      sb.from('reviews').select('*').order('display_order'),
      sb.from('specialists').select('id, name').order('display_order'),
    ]);
    setReviews((r ?? []) as Review[]);
    setSpecialists((sp ?? []) as Specialist[]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('');
    const payload = { ...editing } as Record<string, unknown>;
    const id = payload.id as string | undefined;
    delete payload.id; delete payload.created_at;
    const { error } = id
      ? await sb.from('reviews').update(payload).eq('id', id)
      : await sb.from('reviews').insert(payload);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Guardado ✓'); setEditing(null); load();
  }

  async function toggle(r: Review) {
    await sb.from('reviews').update({ active: !r.active }).eq('id', r.id); load();
  }

  async function del(id: string) {
    await sb.from('reviews').delete().eq('id', id); load();
  }

  const getName = (id: string | null) =>
    specialists.find(s => s.id === id)?.name ?? 'General';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)' }}>Reseñas</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>
            {reviews.length} reseñas · {reviews.filter(r => r.active).length} activas
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}>+ Nueva reseña</button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(45,106,79,.1)', border: '1px solid rgba(45,106,79,.3)', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: 'var(--brand)' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {reviews.map(r => (
          <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.25rem', opacity: r.active ? 1 : .55 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.375rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--text-primary)' }}>{r.author_name}</span>
                  {r.author_location && <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>· {r.author_location}</span>}
                  <span style={{ fontSize: '.72rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '.15rem .5rem', borderRadius: '999px' }}>
                    {getName(r.specialist_id)}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '.875rem' }}>{'★'.repeat(r.rating)}</span>
                  {r.verified && <span style={{ fontSize: '.72rem', background: 'rgba(45,106,79,.1)', color: 'var(--brand)', padding: '.15rem .5rem', borderRadius: '999px' }}>✓ Verificada</span>}
                  {!r.active && <span style={{ fontSize: '.72rem', background: 'rgba(192,57,43,.08)', color: '#c0392b', padding: '.15rem .5rem', borderRadius: '999px' }}>Oculta</span>}
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.content}</p>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setEditing(r)} style={{ fontSize: '.78rem', padding: '.35rem .75rem' }}>Editar</button>
                <button onClick={() => toggle(r)} style={{ fontSize: '.78rem', padding: '.35rem .75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '.375rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {r.active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onClick={() => del(r.id)} style={{ fontSize: '.78rem', padding: '.35rem .6rem', background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.2)', borderRadius: '.375rem', color: '#c0392b', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div style={{ fontSize: '.875rem', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
            Sin reseñas todavía. Añade la primera.
          </div>
        )}
      </div>

      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>
                {(editing as Review).id ? 'Editar reseña' : 'Nueva reseña'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
            </div>
            <form onSubmit={save}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lS}>Especialista</label>
                <select value={editing.specialist_id ?? ''} onChange={e => setEditing(p => p ? { ...p, specialist_id: e.target.value || null } : p)} style={{ ...iS }}>
                  <option value="">General</option>
                  {specialists.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </select>
              </div>
              {([['Nombre del autor *', 'author_name'], ['Ubicación', 'author_location'], ['Fuente (google / wellhub)', 'source']] as [string, keyof Review][]).map(([l, k]) => (
                <div key={k as string} style={{ marginBottom: '.875rem' }}>
                  <label style={lS}>{l}</label>
                  <input value={((editing[k] ?? '') as string)} onChange={e => setEditing(p => p ? { ...p, [k]: e.target.value || null } : p)} style={iS} />
                </div>
              ))}
              <div style={{ marginBottom: '.875rem' }}>
                <label style={lS}>Puntuación</label>
                <select value={editing.rating ?? 5} onChange={e => setEditing(p => p ? { ...p, rating: +e.target.value } : p)} style={{ ...iS, width: 'auto' }}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '.875rem' }}>
                <label style={lS}>Texto de la reseña *</label>
                <textarea value={editing.content ?? ''} onChange={e => setEditing(p => p ? { ...p, content: e.target.value } : p)} rows={4} style={{ ...iS, resize: 'vertical' as const }} required />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                {([['Activa', 'active'], ['Verificada', 'verified']] as [string, keyof Review][]).map(([l, k]) => (
                  <label key={k as string} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!(editing[k])} onChange={e => setEditing(p => p ? { ...p, [k]: e.target.checked } : p)} style={{ width: '16px', height: '16px', accentColor: 'var(--brand)' }} />
                    {l}
                  </label>
                ))}
              </div>
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
