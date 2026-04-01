// src/app/reserva/cancelada/page.tsx
import Link from 'next/link';

export default function CanceladaPage() {
  return (
    <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', padding:'2rem' }}>
      <div style={{ maxWidth:'420px', width:'100%', textAlign:'center', background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'1rem', padding:'2.5rem', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(161,44,123,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a12c7b" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-xl)', fontWeight:400, color:'var(--text-primary)', marginBottom:'0.5rem' }}>Pago cancelado</h1>
        <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginBottom:'1.5rem', lineHeight:1.6 }}>No se ha realizado ningún cargo. Tu reserva sigue pendiente de pago durante 30 minutos.</p>
        <Link href="/" style={{ display:'inline-block', padding:'0.75rem 1.5rem', border:'1.5px solid var(--border-color)', borderRadius:'0.5rem', fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text-primary)', textDecoration:'none' }}>← Volver al inicio</Link>
      </div>
    </main>
  );
}
