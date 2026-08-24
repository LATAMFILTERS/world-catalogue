'use client';

import { useRef } from 'react';

const INDUSTRIES = [
  { slug: 'agriculture', title: 'Agriculture', image: '/images/agriculture.avif' },
  { slug: 'construction', title: 'Construction', image: '/images/construccion.avif' },
  { slug: 'mining', title: 'Mining', image: '/images/mineria.avif' },
  { slug: 'oil-gas', title: 'Oil & Gas', image: '/images/oil&gas.avif' },
  { slug: 'marine', title: 'Marine', image: '/images/marine-2_converted.avif' },
  { slug: 'manufacturing', title: 'Manufacturing', image: '/images/manufacture.avif' },
  { slug: 'power-generation', title: 'Power Generation', image: '/images/power-generator.avif' },
  { slug: 'railway', title: 'Railway', image: '/images/trenes.avif' },
  { slug: 'truck-fleets', title: 'Truck Fleets', image: '/images/trucks-1.avif' },
  { slug: 'waste-municipal', title: 'Waste & Municipal', image: '/images/wasted.avif' },
] as const;

const CARD_WIDTH = 300;
const CARD_GAP = 16;

export function IndustriesShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (CARD_WIDTH + CARD_GAP) * 2, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        background: '#000',
        padding: 'clamp(2.5rem, 5vw, 4rem) 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1.25rem, 6vw, 6rem)',
          marginBottom: '1.75rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'Barlow, Arial, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: '#fff',
            margin: 0,
          }}
        >
          Built for Every <span style={{ color: '#FFF12D' }}>Industry</span>
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            aria-label="Scroll industries left"
            onClick={() => scrollByCards(-1)}
            style={arrowButtonStyle}
          >
            {'<'}
          </button>
          <button
            type="button"
            aria-label="Scroll industries right"
            onClick={() => scrollByCards(1)}
            style={arrowButtonStyle}
          >
            {'>'}
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '0 clamp(1.25rem, 6vw, 6rem)',
          scrollbarWidth: 'none',
        }}
        className="industries-track"
      >
        {INDUSTRIES.map((industry) => (
          <a
            key={industry.slug}
            href={`/industries/${industry.slug}`}
            style={{
              position: 'relative',
              flex: `0 0 ${CARD_WIDTH}px`,
              height: '380px',
              scrollSnapAlign: 'start',
              overflow: 'hidden',
              display: 'block',
              textDecoration: 'none',
              background: '#111',
            }}
          >
            <div
              role="img"
              aria-label={industry.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${industry.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '1.25rem',
                bottom: '1.25rem',
                right: '1.25rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'Barlow, Arial, sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '1.1rem',
                  color: '#fff',
                }}
              >
                {industry.title}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const arrowButtonStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'Barlow, Arial, sans-serif',
  fontSize: '1.1rem',
  transition: 'all 0.2s ease',
};
