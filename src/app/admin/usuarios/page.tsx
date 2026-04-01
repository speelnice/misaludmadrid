'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  avatar_url?: string;
};

export default function AdminUsuarios() {
  const sb = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modal, setModal] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [editRole, setEditRole] = useState('user');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openModal(user: User) {
    setModal(user);
    setEditRole(user.role);
  }

  async function handleSaveRole() {
    if (!modal) return;
    setSaving(true);
    const { error } = await sb.from('profiles').update({ role: editRole }).eq('id', modal.id);
    if (error) showToast('Error al actualizar', 'err');
    else { showToast('Rol actualizado', 'ok'); fetchUsers(); }
    setSaving(false);
    setModal(null);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  const s = {
    page: { padding: 'var(--space-8)', maxWidth: '960px', margin: '0 auto' } as React.CSSProperties,
    title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)' } as React.CSSProperties,
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
    input: { padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)' } as React.CSSProperties,
    avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 } as React.CSSProperties,
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' } as React.CSSProperties,
    modalBox: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: 'var(--space-8)', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-lg)' } as React.CSSProperties,
    toastBase: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow-md)' } as React.CSSProperties,
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, React.CSSProperties> = {
      admin: { background: 'rgba(1,105,111,0.12)', color: '#01696f' },
      user: { background: 'rgba(122,121,116,0.1)', color: 'var(--text-muted)' },
    };
    return { fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', ...( styles[role] || styles.user) };
  };

  return (
    <div style={s.page}>
      {toast && (
        <div style={{ ...s.toastBase, background: toast.type === 'ok' ? '#437a22' : '#a12c7b', color: '#fff' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={s.title}>Usuarios</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input style={{ ...s.input, width: '200px' }} placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.input} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="user">Usuario</option>
          </select>
        </div>
      </div>

      <div style={s.card}>
        {/* Header */}
        <div style={{ ...s.row, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: 'var(--space-3) var(--space-6)' }}>
          <div style={{ width: '36px', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Usuario</div>
          <div style={{ width: '80px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rol</div>
          <div style={{ width: '110px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Registro</div>
          <div style={{ width: '60px' }} />
        </div>

        {loading && (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search || roleFilter !== 'all' ? 'Sin resultados para este filtro.' : 'No hay usuarios todavía.'}
          </div>
        )}
        {!loading && filtered.map((user, i) => (
          <div key={user.id} style={{ ...s.row, borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
            <div style={s.avatar}>{getInitials(user.full_name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{user.full_name || 'Sin nombre'}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user.email || user.id.slice(0, 8) + '...'}</p>
            </div>
            <div style={{ width: '80px' }}>
              <span style={roleBadge(user.role)}>{user.role}</span>
            </div>
            <div style={{ width: '110px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {formatDate(user.created_at)}
            </div>
            <div style={{ width: '60px', textAlign: 'right' }}>
              <button onClick={() => openModal(user)} style={{ fontSize: 'var(--text-xs)', padding: '0.375rem 0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={s.modalBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ ...s.avatar, width: '48px', height: '48px', fontSize: '1rem' }}>{getInitials(modal.full_name)}</div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modal.full_name || 'Sin nombre'}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{modal.email || modal.id}</p>
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rol</label>
              <select style={{ ...s.input, width: '100%' }} value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveRole} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
