// ============================================================
// src/components/booking/BookingModal.tsx
// Drop-in modal wrapper — use anywhere on the site
// Usage: <BookingModal trigger={<button>Reservar</button>} />
// ============================================================

'use client';
import { useState, useEffect } from 'react';
import { BookingForm } from './BookingForm';

export function BookingModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: 'pointer', display: 'contents' }}>
        {trigger}
      </span>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div style={{ animation: 'slideUp 0.2s ease', width: '100%', maxWidth: '600px' }}>
            <BookingForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </>
  );
}
