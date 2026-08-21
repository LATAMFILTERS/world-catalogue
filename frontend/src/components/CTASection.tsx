'use client';

import { useEffect, useRef, useState } from 'react';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function CTASection({
  title = "Ready to Upgrade?",
  description = "Find the correct filtration component for your equipment, application, and protected system using ELIMFILTERS Part Search.",
  buttonText = "FIND MY FILTER",
  buttonHref = "https://part-search.elimfilters.com",
  secondaryButtonText = "TALK TO APPLICATION SUPPORT",
  secondaryButtonHref = "/contact/",
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

  const primaryExternal = isExternalHref(buttonHref);
  const secondaryExternal = isExternalHref(secondaryButtonHref);

  return (
    <section
      ref={sectionRef}
      aria-label="Application conversion path"
      style={{
        background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255,241,45,0.15)',
        padding: 'clamp(3.5rem, 7vw, 6rem) 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
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
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.75,
            margin: '0 auto 1.25rem',
            maxWidth: '560px',
          }}
        >
          {description}
        </p>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.42)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 auto 2.25rem',
          }}
        >
          Search the application database or send the operating requirement to our team.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={buttonHref}
            {...(primaryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            data-conversion-action="product-intelligence"
            style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              padding: '0.9rem 2rem',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              borderRadius: '2px',
            }}
          >
            {buttonText} →
          </a>
          <a
            href={secondaryButtonHref}
            {...(secondaryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            data-conversion-action="application-support"
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#fff',
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              padding: '0.9rem 1.6rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.24)',
              borderRadius: '2px',
            }}
          >
            {secondaryButtonText} →
          </a>
        </div>
      </div>
    </section>
  );
}
