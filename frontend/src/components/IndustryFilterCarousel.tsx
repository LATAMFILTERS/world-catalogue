'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRODUCT_FAMILIES, type FamilyKey } from '@/lib/product-families-data';

const CORE_KEYS: FamilyKey[] = ['primary-air', 'primary-fuel', 'oil-filters', 'cabin-filters'];
const EXTRA_HD_KEYS: FamilyKey[] = ['fuel-water-separators', 'air-dryer-filters', 'coolant-filters'];

// Approved ELIMFILTERS product renders, hosted on Cloudflare R2 (elimfilters-renders bucket).
// No light-duty (automotive) renders exist yet in the pilot batch, so LD industries currently
// reuse the same HD-class renders until light-duty SKUs are produced.
const R2_BASE = 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20';
const CLOUDFLARE_IMAGES: Record<FamilyKey, string> = {
  'primary-air': `${R2_BASE}/EA10489-MACROCORE-approved-opt.png`,
  'secondary-air': `${R2_BASE}/EA10489-MACROCORE-approved-opt.png`,
  'air-cleaner-housings': `${R2_BASE}/EA20080-INTEKCORE-approved-opt.png`,
  'primary-fuel': `${R2_BASE}/EF98279-SYNTAPORE-approved-opt.png`,
  'secondary-fuel': `${R2_BASE}/EF98960-SYNTAPORE-approved-opt.png`,
  'fuel-water-separators': `${R2_BASE}/ES90990-HYDROCORE-approved-opt.png`,
  'oil-filters': `${R2_BASE}/EL87900-LF14000NN-1of20-approved.png`,
  'hydraulic-filters': `${R2_BASE}/EH60388-NANOFORCE-approved-opt.png`,
  'coolant-filters': `${R2_BASE}/EW74685-WF2077-2of20-approved-opt.png`,
  'cabin-filters': `${R2_BASE}/EC10249-MICROKAPPA-approved-opt.png`,
  'air-dryer-filters': `${R2_BASE}/ED43571-THERMACORE-approved-opt.png`,
};

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

interface IndustryFilterCarouselProps {
  dutyClass: 'HD' | 'LD';
  industryName: string;
}

export function IndustryFilterCarousel({ dutyClass, industryName }: IndustryFilterCarouselProps) {
  const keys = dutyClass === 'LD' ? CORE_KEYS : [...CORE_KEYS, ...EXTRA_HD_KEYS];
  const families = keys.map((key) => PRODUCT_FAMILIES[key]);
  const [index, setIndex] = useState(0);

  const go = (direction: 1 | -1) => {
    setIndex((prev) => (prev + direction + families.length) % families.length);
  };

  const family = families[index];
  const image = CLOUDFLARE_IMAGES[family.key];

  return (
    <section style={{ background: '#000', padding: 'clamp(4rem, 8vw, 7rem) 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '0 clamp(1.25rem, 6vw, 6rem)', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
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

      <div style={{ position: 'relative', padding: '0 clamp(1.25rem, 6vw, 6rem)' }}>
        <div
          className="filter-carousel-slide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'center',
            minHeight: '360px',
          }}
        >
          <div>
            <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.16em', color: '#FFF12D' }}>
              {String(index + 1).padStart(2, '0')} / {String(families.length).padStart(2, '0')}
            </span>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', color: '#fff', margin: '0.9rem 0 1.1rem', textTransform: 'uppercase' }}>
              {family.name}
            </h3>
            <p style={{ fontFamily: bodyFont, fontSize: '1.02rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', margin: '0 0 1.5rem', maxWidth: '520px' }}>
              {family.purpose}
            </p>
            <Link
              href={`/families/${family.slug}/`}
              style={{
                display: 'inline-block',
                fontFamily: displayFont,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: '#000',
                background: '#FFF12D',
                padding: '0.85rem 1.4rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              View {family.name} →
            </Link>
          </div>

          <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#fff' }}>
            <img
              src={image}
              alt={family.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '1.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
          <button type="button" aria-label="Previous filter" onClick={() => go(-1)} style={arrowButtonStyle}>
            {'<'}
          </button>
          <button type="button" aria-label="Next filter" onClick={() => go(1)} style={arrowButtonStyle}>
            {'>'}
          </button>
        </div>
      </div>
    </section>
  );
}

const arrowButtonStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: bodyFont,
  fontSize: '1.1rem',
  transition: 'all 0.2s ease',
};
