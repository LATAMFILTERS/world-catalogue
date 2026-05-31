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
        background: '#FFF12D',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#000',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(0,0,0,0.65)',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
          }}
        >
          {description}
        </p>
        <a
          href={buttonHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#000',
            color: '#FFF12D',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            padding: '1.1rem 3rem',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#111';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {buttonText} →
        </a>
      </div>
    </section>
  );
}
