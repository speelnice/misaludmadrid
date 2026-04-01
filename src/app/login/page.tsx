'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const sb = createClient();
    const { error: authErr } = await sb.auth.signInWithPassword({ email, password });
    if (authErr) {
      setError('Credenciales incorrectas.');
      setLoading(false);
      return;
    }
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single();
      if (!p || p.role !== 'admin') {
        await sb.auth.signOut();
        setError('No tienes permisos de administrador.');
        setLoading(false);
        return;
      }
    }
    router.push('/admin');
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '.75rem 1rem',
    border: '1.5px solid var(--border-color)', borderRadius: '.5rem',
    fontSize: '.9rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    outline: 'none', transition: 'border-color .15s', fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--brand-light)', borderRadius: '50%', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--brand)' }} aria-label="MiSalud logo">
              <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 14c0 2.21 1.79 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '.5rem' }}>Acceso Admin</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>MiSalud — Panel de gestión</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Email</label>
              <input type="email" value={email} required autoComplete="email"
                onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Contraseña</label>
              <input type="password" value={password} required autoComplete="current-password"
                onChange={e => setPassword(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>
            {error && (
              <div style={{ background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.25)', borderRadius: '.5rem', padding: '.75rem 1rem', fontSize: '.85rem', color: '#c0392b' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? .7 : 1 }}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
