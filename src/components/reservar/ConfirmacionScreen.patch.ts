// ConfirmacionScreen.patch.ts
// ─────────────────────────────────────────────────────────────
// Shows the "Pagar señal" button on the confirmation screen
// if the service has a deposit_eur set AND payment hasn't happened yet.
//
// In ConfirmacionScreen.tsx (from Step 7D), add this block
// ABOVE the existing "Volver al inicio" Link button:
// ─────────────────────────────────────────────────────────────

// Add to imports at top:
// import { useSearchParams } from 'next/navigation';

// Inside the component, add:
const searchParams = useSearchParams();
const paid = searchParams.get('paid');
const depositEur = cita.services?.deposit_eur;
const priceEur   = cita.services?.price_eur;
const showPayBtn = !paid && (depositEur != null || priceEur != null);

// Then add this block ABOVE the "Volver al inicio" Link:
{showPayBtn && (
  <a
    href={`/reservar/pago?citaId=${cita.id}&mode=${depositEur ? 'deposit' : 'full'}`}
    style={{
      display: 'block', textAlign: 'center', padding: '0.875rem',
      background: '#01696f', color: '#fff', borderRadius: '0.5rem',
      textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
      marginBottom: '0.625rem',
    }}
  >
    {depositEur
      ? `Pagar señal (${depositEur}€) →`
      : `Pagar ahora (${priceEur}€) →`}
  </a>
)}

// Also add this success notice ABOVE the payment button when paid=true:
{paid === 'true' && (
  <div style={{
    padding: '0.875rem', background: 'rgba(1,105,111,0.08)',
    border: '1px solid rgba(1,105,111,0.2)',
    borderRadius: '0.5rem', textAlign: 'center',
    fontSize: '0.875rem', color: '#01696f',
    fontWeight: 600, marginBottom: '0.625rem',
  }}>
    ✓ Pago recibido correctamente
  </div>
)}
