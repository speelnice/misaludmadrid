// src/lib/emails/admin-notification.tsx
// Internal alert sent to the clinic when a new booking arrives
import * as React from 'react';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} de ${MONTHS_ES[m - 1]} de ${y}`;
}

export type AdminNotificationProps = {
  patientName:    string;
  patientEmail:   string;
  patientPhone:   string;
  serviceName:    string;
  specialistName: string;
  fecha:          string;
  horaInicio:     string;
  horaFin:        string;
  notas?:         string | null;
  refNumber:      string;
  adminUrl:       string;
};

export function AdminNotificationEmail({
  patientName, patientEmail, patientPhone,
  serviceName, specialistName,
  fecha, horaInicio, horaFin,
  notas, refNumber, adminUrl,
}: AdminNotificationProps) {
  return (
    <html lang="es">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: 0, background: '#171614', fontFamily: 'system-ui, sans-serif' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#171614', padding: '32px 16px' }}>
          <tr><td align="center">
            <table width="100%" style={{ maxWidth: '480px', background: '#1c1b19',
              borderRadius: '12px', border: '1px solid #393836', overflow: 'hidden' }}>

              {/* Header */}
              <tr>
                <td style={{ background: '#01696f', padding: '20px 28px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                    letterSpacing: '0.08em' }}>
                    Nueva reserva
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                    {patientName}
                  </p>
                </td>
              </tr>

              {/* Details */}
              <tr>
                <td style={{ padding: '24px 28px' }}>
                  {([
                    ['Servicio',     serviceName],
                    ['Especialista', specialistName],
                    ['Fecha',        fmtDate(fecha)],
                    ['Hora',         `${horaInicio} – ${horaFin}`],
                    ['Email',        patientEmail],
                    ['Teléfono',     patientPhone],
                    ...(notas ? [['Notas', notas]] : []),
                    ['Ref.',         refNumber],
                  ] as [string,string][]).map(([k, v]) => (
                    <table key={k} width="100%" style={{ marginBottom: '14px' }}>
                      <tr>
                        <td style={{ fontSize: '10px', fontWeight: 700, color: '#797876',
                          textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '2px' }}>
                          {k}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: '14px', color: '#cdccca' }}>{v}</td>
                      </tr>
                    </table>
                  ))}
                </td>
              </tr>

              {/* CTA */}
              <tr>
                <td style={{ padding: '0 28px 28px' }}>
                  <a href={adminUrl} style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px 24px', background: '#01696f',
                    color: '#fff', borderRadius: '8px',
                    textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                  }}>
                    Ver en el panel de administración →
                  </a>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
    </html>
  );
}
