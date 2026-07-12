import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';

const SYSTEM_IMAGES: Record<string, string> = {
  'air-intake': '/images/mecanica-air.avif',
  'fuel-cleanliness': '/images/fuellseparator-hero.avif',
  lubrication: '/images/oil-hand.avif',
  hydraulic: '/images/hidraulic.avif',
  'cooling-system': '/images/coolant-filters.avif',
  'cabin-air': '/images/cabin-hero.avif',
  'compressed-air': '/images/airdryer-hero.avif',
};

const SYSTEM_LINES: Record<string, string> = {
  'air-intake': 'Dust ingestion control, airflow stability, restriction management, and engine protection.',
  'fuel-cleanliness': 'Particle control, water separation, injector protection, and fuel system reliability.',
  lubrication: 'Wear particle control, oil cleanliness, bearing protection, and engine life extension.',
  hydraulic: 'Servo valve protection, pressure stability, pump protection, and ISO cleanliness discipline.',
  'cooling-system': 'Coolant stability, additive control, corrosion reduction, and thermal reliability.',
  'cabin-air': 'Operator exposure reduction, cabin air quality, dust control, and comfort protection.',
  'compressed-air': 'Moisture control, dryer protection, pneumatic reliability, and air system cleanliness.',
};

export const metadata: Metadata = {
  title: 'Protection Systems | ELIMFILTERS Asset Protection Platform',
  description:
    'Seven industrial protection systems engineered by ELIMFILTERS for air intake, fuel cleanliness, lubrication, hydraulic, cooling, cabin air, and compressed air protection.',
  alternates: { canonical: `${BASE_URL}/systems` },
};

export default function SystemsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Protection Systems',
    url: `${BASE_URL}/systems`,
    numberOfItems: PROTECTION_SYSTEM_LIST.length,
    itemListElement: PROTECTION_SYSTEM_LIST.map((system, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        name: system.name,
        url: `${BASE_URL}/systems/${system.slug}`,
        description: system.tagline,
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/assets/hero-systems.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <p style={eyebrow}>PROTECTION SYSTEMS</p>
          <h1 style={heroTitle}>
            Systems Built
            <br />
            <span style={{ color: '#FFF12D' }}>Around Failure Risk</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS organizes filtration by the asset system being protected. Air, fuel, oil, hydraulic, coolant, cabin, and compressed air each demand a different contamination control strategy.
          </p>
        </div>

        <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={partSearchHeroButton}>
          PART SEARCH
        </a>
      </section>

      <section style={systemSection}>
        <div style={wrapWide}>
          <div style={systemGrid}>
            {PROTECTION_SYSTEM_LIST.map((system) => {
              const image = SYSTEM_IMAGES[system.slug] || '/images/sistems-hero.avif';
              const line = SYSTEM_LINES[system.slug] || system.tagline;

              return (
                <Link key={system.key} href={`/systems/${system.slug}`} style={systemCard}>
                  <img src={image} alt={system.name} style={systemImage} />
                  <div style={systemOverlay} />
                  <div style={systemContent}>
                    <h3 style={systemTitle}>{system.name}</h3>
                    <p style={systemLine}>{line}</p>
                    <span style={explore}>EXPLORE SYSTEM</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };

const homeButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 50,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont,
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
  padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};

const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.34) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.20), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: displayFont, fontSize: '0.75rem',
  fontWeight: 700, letterSpacing: '0.34em', margin: '0 0 1.25rem', textTransform: 'uppercase',
};

const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1040px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '780px', color: 'rgba(255,255,255,0.76)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.65, fontWeight: 600,
};

const partSearchHeroButton: CSSProperties = {
  position: 'absolute', right: 'clamp(1.25rem, 6vw, 6rem)', bottom: 'clamp(2rem, 5vw, 4rem)', zIndex: 3,
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em',
  fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase',
};

const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const systemSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const systemGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const systemCard: CSSProperties = {
  minHeight: '440px', position: 'relative', overflow: 'hidden', textDecoration: 'none',
  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505',
};

const systemImage: CSSProperties = {
  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  opacity: 0.68, filter: 'brightness(1.05)',
};

const systemOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.52) 52%, rgba(0,0,0,0.88) 100%), linear-gradient(90deg, rgba(0,0,0,0.55), transparent)',
};

const systemContent: CSSProperties = {
  position: 'absolute', inset: 0, padding: '1.35rem',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};

const systemTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(1.7rem, 2.8vw, 3rem)',
  lineHeight: 0.96, letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};

const systemLine: CSSProperties = {
  color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem',
  lineHeight: 1.55, margin: '1rem 0 0', maxWidth: '360px',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};
