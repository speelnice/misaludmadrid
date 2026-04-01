// src/lib/emails/booking-confirmation.tsx
// Patient confirmation email — plain React, rendered by Resend

import * as React from 'react';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function fmtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} de ${MONTHS_ES[m - 1]} de ${y}`;
}

export type BookingConfirmationProps = {
  patientName:      string;
  serviceName:      string;
  specialistName:   string;
  specialistTitle?: string;
  fecha:            string;
  horaInicio:       string;
  horaFin:          string;
  durationMinutes:  number;
  priceEur?:        number | null;
  depositEur?:      number | null;
  refNumber:        string;
  clinicName:       string;
  contactPhone?:    string;
  contactEmail?:    string;
};

export function BookingConfirmationEmail({
  patientName, serviceName, specialistName, specialistTitle,
  fecha, horaInicio, horaFin, durationMinutes,
  priceEur, depositEur, refNumber,
  clinicName, contactPhone, contactEmail,
}: BookingConfirmationProps) {
  return (
    <html lang="es">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: 0, background: '#f7f6f2', fontFamily: 'system-ui, sans-serif' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#f7f6f2', padding: '32px 16px' }}>
          <tr><td align="center">
            <table width="100%" style={{ maxWidth: '520px', background: '#fff',
              borderRadius: '12px', overflow: 'hidden',
              border: '1px solid #d4d1ca' }}>

              {/* Header */}
              <tr>
                <td style={{ background: '#01696f', padding: '28px 32px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 400,
                    color: '#fff', letterSpacing: '-0.01em' }}>
                    {clinicName}
                  </p>
                </td>
              </tr>

              {/* Success message */}
              <tr>
                <td style={{ padding: '32px 32px 0', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600,
                    color: '#28251d' }}>
                    ¡Cita confirmada!
                  </p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#7a7974', lineHeight: '1.6' }}>
                    Hola <strong style={{ color: '#28251d' }}>{patientName}</strong>,
                    tu reserva ha sido registrada correctamente.
                  </p>
                </td>
              </tr>

              {/* Booking details */}
              <tr>
                <td style={{ padding: '28px 32px' }}>
                  <table width="100%" style={{ background: '#f7f6f2',
                    borderRadius: '8px', border: '1px solid #d4d1ca' }}>
                    <tr><td style={{ padding: '20px 24px' }}>
                      {([
                        ['Servicio',     serviceName],
                        ['Especialista', `${specialistName}${specialistTitle ? ` · ${specialistTitle}` : ''}`],
                        ['Fecha',        fmtDate(fecha)],
                        ['Hora',         `${horaInicio} – ${horaFin}`],
                        ['Duración',     `${durationMinutes} min`],
                        ...(priceEur   != null ? [['Precio',  `${priceEur}€`]]   : []),
                        ...(depositEur != null ? [['Señal',   `${depositEur}€`]] : []),
                        ['Nº reserva',   refNumber],
                      ] as [string,string][]).map(([k, v]) => (
                        <table key={k} width="100%" style={{ marginBottom: '12px' }}>
                          <tr>
                            <td style={{ fontSize: '11px', fontWeight: 700, color: '#7a7974',
                              textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '2px' }}>
                              {k}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontSize: '14px', color: '#28251d', fontWeight: 500 }}>{v}</td>
                          </tr>
                        </table>
                      ))}
                    </td></tr>
                  </table>
                </td>
              </tr>

              {/* Cancel info */}
              <tr>
                <td style={{ padding: '0 32px 28px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#28251d' }}>
                    ¿Necesitas cancelar o cambiar la cita?
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7a7974', lineHeight: '1.6' }}>
                    Contáctanos con al menos 24 horas de antelación.
                    {contactPhone && <> Llámanos al <a href={`tel:${contactPhone}`}
                      style={{ color: '#01696f' }}>{contactPhone}</a>.</>}
                    {contactEmail && <> O escríbenos a <a href={`mailto:${contactEmail}`}
                      style={{ color: '#01696f' }}>{contactEmail}</a>.</>}
                  </p>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td style={{ background: '#f7f6f2', borderTop: '1px solid #d4d1ca',
                  padding: '16px 32px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#bab9b4' }}>
                    {clinicName} · Este email fue generado automáticamente
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
    </html>
  );
}
