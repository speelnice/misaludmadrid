// src/app/reservar/confirmacion/page.tsx
// Final step — success screen after booking is saved

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ConfirmacionScreen } from '@/components/reservar/ConfirmacionScreen';

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { citaId?: string };
}) {
  if (!searchParams.citaId) notFound();

  const supabase = await createClient();

  const { data: cita } = await supabase
    .from('citas')
    .select(`
      id, fecha, hora_inicio, hora_fin, estado,
      patient_name, patient_email, patient_phone, notas,
      services   ( name, duration_minutes, price_eur, deposit_eur ),
      specialists ( name, title, phone )
    `)
    .eq('id', searchParams.citaId)
    .single();

  if (!cita) notFound();

  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['site_name', 'contact_phone', 'contact_email']);

  const cfg = Object.fromEntries((settings || []).map(s => [s.key, s.value]));

  return <ConfirmacionScreen cita={cita} cfg={cfg} />;
}
