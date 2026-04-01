'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/lib/types';

const NAV = [
  { href: '/admin',                label: 'Dashboard',      icon: '◈',  exact: true },
  { href: '/admin/especialistas',  label: 'Especialistas',  icon: '👤' },
  { href: '/admin/centros',        label: 'Centros',        icon: '📍' },
  { href: '/admin/servicios',      label: 'Servicios',      icon: '💆' },
  { href: '/admin/resenas',        label: 'Reseñas',        icon: '⭐' },
  { href: '/admin/faqs',           label: 'FAQs',           icon: '❓' },
  { href: '/admin/ajustes',        label: 'Ajustes',        icon: '⚙️' },
  { href: '/admin/usuarios',       label: 'Usuarios',       icon: '👥' },
];

export default function AdminShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      <style>{`
        .admin-sidebar {
          width: 240px; background: var(--bg-card); border-right: 1px solid var(--border-color);
          display: flex; flex-direction: column; position: fixed; top: 0; left: 0;
          height: 100vh; z-index: 50; transition: transform .25s ease;
        }
        .admin-nav-link {
          display: flex; align-items: center; gap: .75rem; padding: .625rem 1rem;
          border-radius: .5rem; font-size: .875rem; font-weight: 500;
          color: var(--text-secondary); text-decoration: none; transition: all .15s;
          margin: .125rem .5rem;
        }
        .admin-nav-link:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .admin-nav-link.active { background: var(--brand-light); color: var(--brand); }
        .admin-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100dvh; }
        .admin-topbar {
          position: sticky; top: 0; z-index: 40; background: var(--bg-card);
          border-bottom: 1px solid var(--border-color); height: 64px;
          display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem;
        }
        .admin-content { padding: 2rem 1.5rem; flex: 1; max-width: 1100px; }
        .admin-mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .admin-mobile-toggle { display: flex; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--brand)', flexShrink: 0 }} aria-label="MiSalud">
            <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 14c0 2.21 1.79 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>MiSalud</div>
            <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '.5rem 0' }}>
          {NAV.map(({ href, label, icon, exact }) => (
            <Link
              key={href} href={href}
              className={`admin-nav-link${isActive(href, exact) ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>Sesión activa</div>
          <div style={{ fontSize: '.82rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.email}
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ width: '100%', padding: '.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '.375rem', fontSize: '.8rem', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 45 }} />
      )}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-toggle" onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            style={{ padding: '.5rem', color: 'var(--text-secondary)', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <Link href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '.82rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Ver sitio
          </Link>
          <span style={{ background: 'var(--brand-light)', color: 'var(--brand)', fontSize: '.7rem', fontWeight: 600, padding: '.2rem .5rem', borderRadius: '999px' }}>
            {profile.role}
          </span>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
