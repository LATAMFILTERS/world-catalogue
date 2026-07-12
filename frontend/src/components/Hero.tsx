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

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

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
        fontFamily: bodyFont,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');

        @media (max-width: 860px) {
          .industry-hero-section {
            min-height: 88vh !important;
          }

          .industry-hero-bg {
            transform: none !important;
            background-position: center center !important;
            filter: brightness(1.18) contrast(1.06) !important;
          }
        }
      `}</style>

      <div
        className="industry-hero-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          transform: 'none',
          filter: 'brightness(1.14) contrast(1.05)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.56) 48%, rgba(0,0,0,0.20) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.18), transparent 36%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1180px',
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
              fontFamily: displayFont,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.34em',
              color: '#FFF12D',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
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
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
            lineHeight: 0.88,
            letterSpacing: '-0.055em',
            color: 'rgba(255,255,255,0.96)',
            maxWidth: '980px',
            margin: 0,
            marginBottom: subtitle ? '0.25rem' : '1.5rem',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            ref={subtitleRef}
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              lineHeight: 0.88,
              color: '#FFF12D',
              marginBottom: '1.5rem',
              letterSpacing: '-0.055em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </p>
        )}

        {tagline && !category && (
          <p
            ref={taglineRef}
            style={{
              fontFamily: bodyFont,
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.76)',
              maxWidth: '770px',
              lineHeight: 1.65,
              fontWeight: 600,
              marginBottom: '2.5rem',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
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
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.16em',
              padding: '0.95rem 1.4rem',
              textDecoration: 'none',
              textTransform: 'uppercase',
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
            {ctaText}
          </a>
          <a
            href="#features"
            style={{
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.72)',
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.16em',
              padding: '0.95rem 1.4rem',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.25s ease',
              borderRadius: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,241,45,0.45)';
              e.currentTarget.style.color = '#FFF12D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
            }}
          >
            EXPLORE
          </a>
        </div>
      </div>

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
                    fontFamily: displayFont,
                    fontWeight: 700,
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
                    fontFamily: displayFont,
                    fontSize: '0.65rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
