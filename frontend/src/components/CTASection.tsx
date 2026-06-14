'use client';

import { useEffect, useRef, useState } from 'react';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTASection({
  title = "Ready to Upgrade?",
  description = "Find the exact filter for your application. Our system cross-references 500,000+ parts across every major OEM to find your perfect match.",
  buttonText = "FIND MY FILTER",
  buttonHref = "https://part-search.elimfilters.com",
}: CTASectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255,241,45,0.15)',
        padding: 'clamp(3.5rem, 7vw, 6rem) 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: '#FFF12D',
            marginBottom: '1.25rem',
          }}
        >
          // ASSET PROTECTION
        </p>
        <h2
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.15,
            marginBottom: '0.4rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title.split(' ').slice(0, Math.ceil(title.split(' ').length / 2)).join(' ')}
        </h2>
        <h2
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: '#FFF12D',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title.split(' ').slice(Math.ceil(title.split(' ').length / 2)).join(' ')}
        </h2>
        <p
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75,
            marginBottom: '2.5rem',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
          }}
        >
          {description}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              padding: '0.85rem 2.5rem',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              borderRadius: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(255,241,45,0.45)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {buttonText} →
          </a>
        </div>
      </div>
    </section>
  );
}
