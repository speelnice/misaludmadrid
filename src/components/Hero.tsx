'use client';

import { useEffect, useRef } from 'react';

interface HeroProps {
  heading: string;
  subheading: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export default function Hero({ heading, subheading, ctaPrimary, ctaSecondary }: HeroProps) {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!circleRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      circleRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Large ambient circle */}
        <div
          ref={circleRef}
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-15%',
            width: '65vw',
            height: '65vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--green-200) 60%, transparent) 0%, transparent 70%)',
            transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />
        {/* Botanical line art */}
        <svg
          viewBox="0 0 200 400"
          fill="none"
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '-2%',
            width: 'min(18vw, 260px)',
            opacity: 0.12,
            color: 'var(--green-700)',
          }}
        >
          <path
            d="M100 380 C100 280 40 260 60 180 C80 100 100 80 100 20"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path d="M100 300 C100 300 60 280 30 260" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 280 C100 280 140 260 160 240" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 240 C100 240 55 210 35 180" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 210 C100 210 145 185 165 160" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 170 C100 170 60 145 45 120" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="30" cy="255" rx="15" ry="22" transform="rotate(-30 30 255)" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="165" cy="235" rx="15" ry="22" transform="rotate(20 165 235)" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="35" cy="175" rx="14" ry="20" transform="rotate(-25 35 175)" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="168" cy="155" rx="14" ry="20" transform="rotate(15 168 155)" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="45" cy="115" rx="12" ry="18" transform="rotate(-20 45 115)" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(var(--border-color) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            opacity: 0.4,
          }}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingBlock: 'var(--space-24)' }}>
        <div style={{ maxWidth: '800px' }}>
          {/* Label */}
          <span
            className="section-label animate-fade-up"
            style={{ marginBottom: 'var(--space-6)' }}
          >
            Salud que viene a ti · Madrid
          </span>

          {/* Heading */}
          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-8)',
              whiteSpace: 'pre-line',
            }}
          >
            {heading}
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '52ch',
              marginBottom: 'var(--space-12)',
            }}
          >
            {subheading}
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up delay-300"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}
          >
            <a href="#contacto" className="btn btn-primary" style={{ fontSize: 'var(--text-base)', padding: '0.875rem 2rem' }}>
              {ctaPrimary}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#especialistas" className="btn btn-secondary" style={{ fontSize: 'var(--text-base)', padding: '0.875rem 2rem' }}>
              {ctaSecondary}
            </a>
          </div>

          {/* Stats */}
          <div
            className="animate-fade-up delay-400"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-8)',
              marginTop: 'var(--space-16)',
              paddingTop: 'var(--space-8)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {[
              { value: '2', label: 'Especialistas' },
              { value: '5', label: 'Centros en Madrid' },
              { value: '4', label: 'Zonas a domicilio' },
              { value: '5★', label: 'Valoración media' },
            ].map(stat => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 300,
                    color: 'var(--brand)',
                    lineHeight: 1,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-8)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          animation: 'fadeIn 1s ease 1s both',
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, var(--brand), transparent)',
            animation: 'float 2s ease infinite',
          }}
        />
      </div>
    </section>
  );
}