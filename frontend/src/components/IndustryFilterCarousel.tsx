'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { PRODUCT_FAMILIES, type FamilyKey } from '@/lib/product-families-data';

const CORE_KEYS: FamilyKey[] = ['primary-air', 'primary-fuel', 'oil-filters', 'cabin-filters'];
const EXTRA_HD_KEYS: FamilyKey[] = ['fuel-water-separators', 'air-dryer-filters', 'coolant-filters'];

// mecanica-air.avif is targeted by legacy page-scoped CSS hacks (main:has(img[src*="mecanica-air.avif"]))
// that hide sibling sections on the Air Intake technology page. Swap it here so this carousel
// doesn't accidentally trip those selectors on unrelated pages.
const IMAGE_OVERRIDES: Partial<Record<FamilyKey, string>> = {
  'primary-air': '/images/air-filter1.avif',
};

const CARD_WIDTH = 300;
const CARD_GAP = 16;

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

interface IndustryFilterCarouselProps {
  dutyClass: 'HD' | 'LD';
  industryName: string;
}

export function IndustryFilterCarousel({ dutyClass, industryName }: IndustryFilterCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const keys = dutyClass === 'LD' ? CORE_KEYS : [...CORE_KEYS, ...EXTRA_HD_KEYS];
  const families = keys.map((key) => PRODUCT_FAMILIES[key]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (CARD_WIDTH + CARD_GAP) * 2, behavior: 'smooth' });
  };

  return (
    <section style={{ background: '#000', padding: 'clamp(4rem, 8vw, 7rem) 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '0 clamp(1.25rem, 6vw, 6rem)', marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 0.9rem',
          }}
        >
          Filters Built For <span style={{ color: '#FFF12D' }}>{industryName}</span>
        </h2>
        <p style={{ fontFamily: bodyFont, fontSize: '1rem', lineHeight: 1.78, color: 'rgba(255,255,255,0.58)', maxWidth: '780px', margin: 0 }}>
          We are proud to serve customers who build a better future and protect what matters. ELIMFILTERS® protection systems keep {industryName.toLowerCase()} equipment running, because the industries we serve most depend on us being reliable.
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" aria-label="Scroll filters left" onClick={() => scrollByCards(-1)} style={{ ...arrowButtonStyle, left: 'clamp(0.75rem, 3vw, 2rem)' }}>
          {'<'}
        </button>
        <button type="button" aria-label="Scroll filters right" onClick={() => scrollByCards(1)} style={{ ...arrowButtonStyle, right: 'clamp(0.75rem, 3vw, 2rem)' }}>
          {'>'}
        </button>

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
          {families.map((family) => {
            const code = dutyClass === 'LD' ? family.ldPrefix : family.hdPrefix;
            return (
              <Link
                key={family.key}
                href={`/families/${family.slug}/`}
                style={{
                  flex: `0 0 ${CARD_WIDTH}px`,
                  scrollSnapAlign: 'start',
                  display: 'block',
                  textDecoration: 'none',
                  background: '#050505',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden' }}>
                  <img
                    src={IMAGE_OVERRIDES[family.key] ?? family.heroImage}
                    alt={family.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {code && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        fontFamily: displayFont,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.08em',
                        color: '#000',
                        background: '#FFF12D',
                        padding: '0.3rem 0.55rem',
                      }}
                    >
                      {code}
                    </span>
                  )}
                </div>
                <div style={{ padding: '1.1rem 1.25rem 1.35rem' }}>
                  <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: '0 0 0.6rem', textTransform: 'uppercase' }}>
                    {family.name}
                  </h3>
                  <p style={{ fontFamily: bodyFont, fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                    {family.purpose}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const arrowButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '37.5%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: bodyFont,
  fontSize: '1.1rem',
  transition: 'all 0.2s ease',
};
