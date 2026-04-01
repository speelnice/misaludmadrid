// src/app/api/send-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { resend, FROM_ADDRESS } from '@/lib/resend';
import { BookingConfirmationEmail } from '@/lib/emails/booking-confirmation';
import { AdminNotificationEmail } from '@/lib/emails/admin-notification';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { citaId } = await req.json();
    if (!citaId) return NextResponse.json({ error: 'citaId required' }, { status: 400 });

    const supabase = await createClient();

    const { data: cita, error: citaErr } = await supabase
      .from('citas')
      .select(`
        id, fecha, hora_inicio, hora_fin,
        patient_name, patient_email, patient_phone, notas,
        services ( name, duration_minutes, price_eur, deposit_eur ),
        specialists ( name, title )
      `)
      .eq('id', citaId)
      .single();

    if (citaErr || !cita) {
      return NextResponse.json({ error: 'Cita not found' }, { status: 404 });
    }

    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['site_name', 'contact_phone', 'contact_email']);

    const cfg = Object.fromEntries((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
    const refNumber = cita.id.slice(0, 8).toUpperCase();
    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://misaludv3.vercel.app'}/admin/citas`;

    if (!process.env.RESEND_API_KEY) {
      console.warn('[send-confirmation] RESEND_API_KEY not set, skipping email.');
      return NextResponse.json({ skipped: true });
    }

    const svc = (Array.isArray(cita.services) ? cita.services[0] : cita.services) as { name: string; duration_minutes: number; price_eur: number | null; deposit_eur: number | null } | null;
    const spec = (Array.isArray(cita.specialists) ? cita.specialists[0] : cita.specialists) as { name: string; title: string } | null;

    const patientHtml = await render(BookingConfirmationEmail({
      patientName: cita.patient_name,
      serviceName: svc?.name ?? '-',
      specialistName: spec?.name ?? '-',
      specialistTitle: spec?.title,
      fecha: cita.fecha,
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin,
      durationMinutes: svc?.duration_minutes ?? 0,
      priceEur: svc?.price_eur,
      depositEur: svc?.deposit_eur,
      refNumber,
      clinicName: cfg.site_name ?? 'MiSalud',
      contactPhone: cfg.contact_phone,
      contactEmail: cfg.contact_email,
    }));

    const adminHtml = await render(AdminNotificationEmail({
      patientName: cita.patient_name,
      patientEmail: cita.patient_email,
      patientPhone: cita.patient_phone,
      serviceName: svc?.name ?? '-',
      specialistName: spec?.name ?? '-',
      fecha: cita.fecha,
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin,
      notas: cita.notas,
      refNumber,
      adminUrl,
    }));

    const [patientRes, adminRes] = await Promise.allSettled([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [cita.patient_email],
        subject: `Confirmacion de cita - ${svc?.name ?? 'MiSalud'} - ${cita.fecha}`,
        html: patientHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [cfg.contact_email ?? 'admin@misalud.es'],
        subject: `Nueva reserva: ${cita.patient_name} - ${cita.fecha} ${cita.hora_inicio}`,
        html: adminHtml,
      }),
    ]);

    return NextResponse.json({
      patient: patientRes.status === 'fulfilled' ? 'sent' : 'failed',
      admin: adminRes.status === 'fulfilled' ? 'sent' : 'failed',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-confirmation]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
