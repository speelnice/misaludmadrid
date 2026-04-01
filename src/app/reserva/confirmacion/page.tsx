// src/app/reserva/confirmacion/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { booking_id?: string; session_id?: string };
}) {
  const { booking_id } = searchParams;
  let booking: any = null;

  if (booking_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(name,duration_minutes), specialist:specialists(name,title), centro:centros(name,address)')
      .eq('id', booking_id)
      .single();
    booking = data;
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  return (
    <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', padding:'2rem' }}>
      <div style={{ maxWidth:'480px', width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'1rem', padding:'2.5rem', boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(1,105,111,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color:'#01696f' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-xl)', fontWeight:400, color:'var(--text-primary)', marginBottom:'0.5rem' }}>¡Pago completado!</h1>
        <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginBottom:'1.5rem' }}>Tu cita ha sido confirmada. Recibirás un email con todos los detalles.</p>
        {booking && (
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:'0.625rem', padding:'1rem', textAlign:'left', marginBottom:'1.5rem' }}>
            {([['Servicio', booking.service?.name], ['Especialista', booking.specialist?.name], ['Lugar', booking.location_type === 'home' ? 'A domicilio' : booking.centro?.name], ['Fecha y hora', fmt(booking.starts_at)]] as [string,string][]).map(([label, value]) => value && (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem', padding:'0.375rem 0', borderBottom:'1px solid var(--border-color)' }}>
                <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize:'var(--text-xs)', fontWeight:500, color:'var(--text-primary)', textAlign:'right' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/" style={{ display:'inline-block', padding:'0.75rem 1.5rem', background:'var(--brand,#01696f)', color:'#fff', borderRadius:'0.5rem', fontSize:'var(--text-sm)', fontWeight:600, textDecoration:'none' }}>Volver al inicio</Link>
      </div>
    </main>
  );
}
