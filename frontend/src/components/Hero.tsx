'use client';

import { useEffect, useRef } from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  tagline?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  stats?: { label: string; value: string }[];
  category?: string;
}

export function Hero({
  title,
  subtitle,
  tagline,
  ctaText = 'FIND MY FILTER',
  ctaHref = 'https://part-search.elimfilters.com',
  backgroundImage = '/images/fondomotor.PNG',
  stats,
  category,
}: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = [
      { ref: titleRef, delay: 0 },
      { ref: subtitleRef, delay: 100 },
      { ref: taglineRef, delay: 200 },
      { ref: ctaRef, delay: 300 },
      { ref: statsRef, delay: 500 },
    ];

    elements.forEach(({ ref, delay }) => {
      if (ref.current) {
        ref.current.style.opacity = '0';
        ref.current.style.transform = 'translateY(32px)';
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            ref.current.style.opacity = '1';
            ref.current.style.transform = 'translateY(0)';
          }
        }, delay);
      }
    });
  }, []);

  return (
    <section
      className="industry-hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.90) 100%)',
        }}
      />

      {/* Noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          paddingTop: '120px',
          paddingBottom: stats ? '8rem' : '6rem',
          width: '100%',
        }}
      >
        {category && (
          <div
            ref={taglineRef}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '32px',
                height: '1px',
                background: '#FFF12D',
              }}
            />
            {category}
          </div>
        )}

        <h1
          ref={titleRef}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            maxWidth: '900px',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            ref={subtitleRef}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 1.1,
              color: '#FFF12D',
              marginBottom: '1.5rem',
            }}
          >
            {subtitle}
          </p>
        )}

        {tagline && !category && (
          <p
            ref={taglineRef}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '560px',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
              fontStyle: 'italic',
            }}
          >
            {tagline}
          </p>
        )}

        <div ref={ctaRef} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <a
            href={ctaHref}
            target={ctaHref.startsWith('http') ? '_blank' : undefined}
            rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              padding: '1rem 2.5rem',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 36px rgba(255,241,45,0.55)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {ctaText}
          </a>
          <a
            href="#features"
            style={{
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              padding: '1rem 2rem',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFF12D';
              e.currentTarget.style.color = '#FFF12D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            EXPLORE
          </a>
        </div>
      </div>

      {/* Stats bar */}
      {stats && stats.length > 0 && (
        <div
          ref={statsRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 2rem',
              display: 'grid',
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              gap: '0',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem 2rem',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#FFF12D',
                    lineHeight: 1,
                    marginBottom: '0.3rem',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: stats ? '120px' : '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.4,
          animation: 'bounce 2s infinite',
        }}
      >
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,241,45,0.8))',
          }}
        />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  );
}
