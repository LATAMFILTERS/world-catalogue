import type { Metadata } from 'next';
import Link from 'next/link';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  title: 'Protection Systems | ELIMFILTERS Asset Protection Platform',
  description:
    'Seven industrial protection systems engineered by ELIMFILTERS: Air Intake, Fuel Cleanliness, Lubrication, Hydraulic, Cooling System, Cabin Air, and Compressed Air protection.',
  alternates: { canonical: `${BASE_URL}/systems` },
  openGraph: {
    title: 'Protection Systems | ELIMFILTERS',
    description: 'Industrial contamination control systems protecting engines and assets across mining, agriculture, marine, construction, and power generation.',
    url: `${BASE_URL}/systems`,
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

const SYSTEM_IMAGES: Record<string, string> = {
  'air-intake': '/images/mecanica-air.avif',
  'fuel-cleanliness': '/images/fuellseparator-hero.avif',
  'lubrication': '/images/oil-hand.avif',
  'hydraulic': '/images/hidraulic.avif',
  'cooling-system': '/images/coolant-filters.avif',
  'cabin-air': '/images/cabin-hero.avif',
  'compressed-air': '/images/airdryer-hero.avif',
};

export default function SystemsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Protection Systems',
    url: `${BASE_URL}/systems`,
    numberOfItems: PROTECTION_SYSTEM_LIST.length,
    itemListElement: PROTECTION_SYSTEM_LIST.map((sys, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: sys.name,
        url: `${BASE_URL}/systems/${sys.slug}`,
        description: sys.tagline,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <section
          style={{
            padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(2rem, 4vw, 3rem)',
            maxWidth: '1200px',
            margin: '0 auto',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            // ELIMFILTERS · PROTECTION SYSTEMS
          </p>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              maxWidth: '680px',
            }}
          >
            Protection Systems
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75,
              maxWidth: '560px',
            }}
          >
            Seven contamination control domains — each engineered to protect a specific
            asset system. Select a domain to explore its technology architecture,
            product families, and engineering reference.
          </p>
        </section>

        {/* ── Grid ───────────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5px',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          {PROTECTION_SYSTEM_LIST.map((sys) => {
            const img = SYSTEM_IMAGES[sys.slug] || '/images/sistems-hero.avif';
            return (
              <Link
                key={sys.key}
                href={`/systems/${sys.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article
                  style={{
                    background: '#000',
                    position: 'relative',
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={img}
                    alt={sys.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.45,
                      transition: 'opacity 0.4s ease, transform 0.5s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                    }}
                  />
                  <div style={{ position: 'relative', padding: '1.5rem 1.75rem' }}>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6rem',
                        letterSpacing: '0.2em',
                        color: '#FFF12D',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {sys.hdPrefix}{sys.ldPrefix ? ` · ${sys.ldPrefix}` : ''}
                    </p>
                    <h2
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 700,
                        fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                        lineHeight: 1.2,
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {sys.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.5,
                      }}
                    >
                      {sys.tagline}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>

        {/* ── Hierarchy note ──────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 clamp(1.5rem, 5vw, 4rem) clamp(4rem, 6vw, 5rem)',
          }}
        >
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { label: 'Protection System', sub: 'Domain' },
              { label: 'Technology', sub: 'Architecture' },
              { label: 'Product Family', sub: 'Category' },
              { label: 'Products', sub: 'HD · LD' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: i === 0 || i === arr.length - 1 ? '#FFF12D' : '#fff', marginBottom: '0.15rem' }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
                    {item.sub}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', flexShrink: 0 }}>↓</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
