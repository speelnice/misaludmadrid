// src/components/onboarding/shared.tsx
'use client';
import type { ReactNode, CSSProperties } from 'react';

export const inputStyle: CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: '1.5px solid var(--color-border, #393836)',
  borderRadius: '0.5rem', fontSize: '0.875rem',
  background: 'var(--color-surface-2, #201f1d)',
  color: 'var(--color-text, #cdccca)',
  fontFamily: 'var(--font-body, sans-serif)',
  outline: 'none', transition: 'border-color 0.15s',
};

export function StepHeader({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4f98a3',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        Paso {step}
      </p>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text, #cdccca)',
        fontFamily: 'var(--font-display, serif)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #797876)', lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700,
        color: 'var(--color-text-muted, #797876)', marginBottom: '0.3rem',
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function PrimaryBtn({ onClick, disabled, children }:
  { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '0.75rem 1.75rem',
      background: disabled ? '#2d2c2a' : '#01696f',
      color: disabled ? '#5a5957' : '#fff',
      border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem',
      fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

export function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.75rem 1.25rem', background: 'transparent',
      color: 'var(--color-text-muted, #797876)',
      border: '1.5px solid var(--color-border, #393836)',
      borderRadius: '0.5rem', fontSize: '0.9rem',
      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    }}>
      ← Atrás
    </button>
  );
}
