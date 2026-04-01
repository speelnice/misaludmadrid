import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getStats() {
  const sb = await createClient();
  const [s, c, sv, f, r] = await Promise.all([
    sb.from('specialists').select('id', { count: 'exact', head: true }),
    sb.from('centros').select('id', { count: 'exact', head: true }),
    sb.from('services').select('id', { count: 'exact', head: true }),
    sb.from('faqs').select('id', { count: 'exact', head: true }),
    sb.from('reviews').select('id', { count: 'exact', head: true }),
  ]);
  return {
    specialists: s.count ?? 0,
    centros: c.count ?? 0,
    services: sv.count ?? 0,
    faqs: f.count ?? 0,
    reviews: r.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const cards = [
    { label: 'Especialistas', value: stats.specialists, href: '/admin/especialistas', icon: '👤', desc: 'Iván y Matteo' },
    { label: 'Centros',       value: stats.centros,     href: '/admin/centros',       icon: '📍', desc: 'Asociados en Madrid' },
    { label: 'Servicios',     value: stats.services,    href: '/admin/servicios',     icon: '💆', desc: 'Tratamientos activos' },
    { label: 'Reseñas',       value: stats.reviews,     href: '/admin/resenas',       icon: '⭐', desc: 'De pacientes' },
    { label: 'FAQs',          value: stats.faqs,        href: '/admin/faqs',          icon: '❓', desc: 'Preguntas frecuentes' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '.5rem' }}>
        Panel de control
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '2rem' }}>
        Gestiona todo el contenido del sitio web de MiSalud.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="card" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '.75rem' }}>{c.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 400, color: 'var(--brand)', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '.375rem' }}>{c.label}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>{c.desc}</div>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Acciones rápidas
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
          {[
            { href: '/admin/resenas',   l: '+ Nueva reseña' },
            { href: '/admin/faqs',      l: '+ Nueva FAQ' },
            { href: '/admin/servicios', l: '+ Nuevo servicio' },
            { href: '/admin/ajustes',   l: '⚙ Ajustes del sitio' },
          ].map(a => (
            <Link key={a.l} href={a.href} className="btn btn-secondary" style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}>
              {a.l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
