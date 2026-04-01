'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/types';

interface Props {
  faqs: Faq[];
}

function FaqItem({ faq, index }: { faq: Faq; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          padding: 'var(--space-6) 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              color: 'var(--text-muted)',
              minWidth: '2rem',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {faq.question}
          </span>
        </div>
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1.5px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--brand)',
            transition: 'transform var(--transition-base)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows var(--transition-base)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <p
            style={{
              paddingLeft: 'calc(2rem + var(--space-4))',
              paddingBottom: 'var(--space-6)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              fontSize: 'var(--text-base)',
            }}
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({ faqs }: Props) {
  return (
    <section id="faq" className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: 'var(--space-16)',
            alignItems: 'start',
          }}
        >
          {/* Left: header */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 2rem)' }}>
            <span className="section-label">Preguntas frecuentes</span>
            <h2 className="section-title">Todo lo que necesitas saber</h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-8)',
              }}
            >
              ¿Tienes alguna duda? Aquí respondemos las preguntas más habituales. Si necesitas algo más, escríbenos.
            </p>
            <a href="#contacto" className="btn btn-secondary">
              Hacer una pregunta
            </a>
          </div>

          {/* Right: accordion */}
          <div>
            {faqs.map((faq, i) => (
              <FaqItem key={faq.id} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}