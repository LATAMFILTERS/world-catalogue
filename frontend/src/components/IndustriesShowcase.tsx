'use client';

import { useRef } from 'react';

const INDUSTRIES = [
  { slug: 'agriculture', title: 'Agriculture', video: '/images/Agriculture-2.mp4' },
  { slug: 'construction', title: 'Construction', video: '/images/construction-2.mp4' },
  { slug: 'mining', title: 'Mining', video: '/images/Mina-Video-1.mp4' },
  { slug: 'oil-gas', title: 'Oil & Gas', video: '/images/Oil&Gas(1).mp4' },
  { slug: 'marine', title: 'Marine', video: '/images/Marino-1.mp4' },
  { slug: 'manufacturing', title: 'Manufacturing', video: '/images/Manufacture-1.mp4' },
  { slug: 'power-generation', title: 'Power Generation', video: '/images/Power-1.mp4' },
  { slug: 'railway', title: 'Railway', video: '/images/Train.mp4' },
  { slug: 'truck-fleets', title: 'Truck Fleets', video: '/images/Trucks&Feel-1.mp4' },
  { slug: 'waste-municipal', title: 'Waste & Municipal', video: '/images/wasted-2.mp4' },
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
            <video
              src={industry.video}
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
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
