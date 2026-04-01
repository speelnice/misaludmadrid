import { Suspense } from 'react';
import { PagoContent } from './PagoContent';

export default function PagoPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg, #f7f6f2)', flexDirection: 'column', gap: '1rem',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
          style={{ animation: 'spin 0.9s linear infinite' }}>
          <circle cx="20" cy="20" r="16" stroke="#d4d1ca" strokeWidth="3" />
          <path d="M20 4a16 16 0 0 1 16 16" stroke="#01696f" strokeWidth="3" strokeLinecap="round"/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      </main>
    }>
      <PagoContent />
    </Suspense>
  );
}
