'use client';

import { useState, useEffect } from 'react';

const navLinks = [
  { href: '#especialistas', label: 'Especialistas' },
  { href: '#centros', label: 'Centros' },
  { href: '#domicilio', label: 'A domicilio' },
  { href: '#resenas', label: 'Reseñas' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('misalud-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('misalud-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 'var(--navbar-height)',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: scrolled
            ? 'color-mix(in srgb, var(--bg-primary) 95%, transparent)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'all var(--transition-slow)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo */}
          <a
            href="#"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.625rem',
                fontWeight: 400,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Mi
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.625rem',
                fontWeight: 600,
                color: 'var(--brand)',
                letterSpacing: '-0.02em',
              }}
            >
              Salud
            </span>
          </a>

          {/* Desktop links */}
          <ul
            className="hide-mobile"
            style={{
              display: 'flex',
              gap: 'var(--space-8)',
              alignItems: 'center',
            }}
          >
            {navLinks.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.01em',
                    transition: 'color var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontSize: '1rem',
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* CTA */}
            <a
              href="#contacto"
              className="btn btn-primary hide-mobile"
              style={{ fontSize: 'var(--text-sm)', padding: '0.625rem 1.25rem' }}
            >
              Reservar
            </a>

            {/* Hamburger */}
            <button
              className="hide-desktop"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Abrir menú"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '16px',
                  height: '1.5px',
                  background: 'currentColor',
                  transition: 'transform var(--transition-base)',
                  transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '16px',
                  height: '1.5px',
                  background: 'currentColor',
                  transition: 'opacity var(--transition-fast)',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '16px',
                  height: '1.5px',
                  background: 'currentColor',
                  transition: 'transform var(--transition-base)',
                  transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'calc(var(--navbar-height) + 2rem)',
            paddingInline: 'var(--container-padding)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-4xl)',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    padding: 'var(--space-3) 0',
                    borderBottom: '1px solid var(--border-color)',
                    animation: `fadeUp 0.4s ease ${i * 60}ms both`,
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'var(--space-8)' }}>
            <a
              href="#contacto"
              className="btn btn-primary"
              onClick={() => setMenuOpen(false)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Reservar cita
            </a>
          </div>
        </div>
      )}
    </>
  );
}