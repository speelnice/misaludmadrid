// BookingForm.patch.ts
// ─────────────────────────────────────────────────────────────
// This is NOT a standalone file. It shows the ONLY change
// needed in BookingForm.tsx (from Step 7C) to trigger emails.
//
// In BookingForm.tsx, replace the handleSubmit function with
// the version below. Everything else stays the same.
// ─────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!valid) return;
  setSaving(true); setError('');
  const sb = createClient();

  // 1. Save booking to Supabase (unchanged from 7C)
  const { data, error } = await sb
    .from('citas')
    .insert({
      service_id:    service.id,
      specialist_id: specialist.id,
      fecha,
      hora_inicio:   horaInicio,
      hora_fin:      horaFin,
      patient_name:  `${form.nombre} ${form.apellidos}`.trim(),
      patient_email: form.email,
      patient_phone: form.phone,
      notas:         form.notas || null,
      estado:        'pendiente',
      source:        'web',
    })
    .select('id')
    .single();

  if (error) { setError(error.message); setSaving(false); return; }

  // 2. NEW — trigger confirmation emails (fire and forget, don't block UX)
  fetch('/api/send-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ citaId: data.id }),
  }).catch(console.error);

  // 3. Redirect to confirmation screen (unchanged)
  router.push(`/reservar/confirmacion?citaId=${data.id}`);
}
