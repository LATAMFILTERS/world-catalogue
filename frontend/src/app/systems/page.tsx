import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://elimfilters.com';

const SYSTEM_CARDS = [
  {
    name: 'Air Intake & Airflow Protection',
    slug: 'air-intake',
    image: '/images/mecanica-air.avif',
    line: 'Dust ingestion control, airflow stability, restriction management, and engine protection.',
  },
  {
    name: 'Fuel Cleanliness Protection',
    slug: 'fuel-cleanliness',
    image: '/images/fuellseparator-hero.avif',
    line: 'Particle control, water separation, injector protection, and fuel system reliability.',
  },
  {
    name: 'Lubrication Protection',
    slug: 'lubrication',
    image: '/images/oil-hand.avif',
    line: 'Wear particle control, oil cleanliness, bearing protection, and engine life extension.',
  },
  {
    name: 'Hydraulic Protection',
    slug: 'hydraulic',
    image: '/images/hidraulic.avif',
    line: 'Servo valve protection, pressure stability, pump protection, and ISO cleanliness discipline.',
  },
  {
    name: 'Cooling System Protection',
    slug: 'cooling-system',
    image: '/images/coolant-filters.avif',
    line: 'Coolant stability, additive control, corrosion reduction, and thermal reliability.',
  },
];

export const metadata: Metadata = {
  title: 'Protection Systems | ELIMFILTERS Asset Protection Platform',
  description:
    'Five industrial protection systems engineered by ELIMFILTERS for air intake, fuel cleanliness, lubrication, hydraulic, and cooling system protection.',
  alternates: { canonical: `${BASE_URL}/systems` },
};

export default function SystemsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Protection Systems',
    url: `${BASE_URL}/systems`,
    numberOfItems: SYSTEM_CARDS.length,
    itemListElement: SYSTEM_CARDS.map((system, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        name: system.name,
        url: `${BASE_URL}/systems/${system.slug}`,
        description: system.line,
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
            ELIMFILTERS organizes filtration by the asset system being protected. Air, fuel, oil, hydraulic, and coolant systems each demand a different contamination control strategy.
          </p>
        </div>

        <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={partSearchHeroButton}>
          PART SEARCH
        </a>
      </section>

      <section style={systemSection}>
        <div style={systemsGrid}>
          {SYSTEM_CARDS.map((system, index) => {
            const placement = index < 3 ? topCardPlacement : bottomCardPlacement;

            return (
              <Link
                key={system.slug}
                href={`/systems/${system.slug}`}
                style={{ ...systemCard, ...placement, backgroundImage: `url(${system.image})` }}
              >
                <div style={systemOverlay} />
                <div style={systemContent}>
                  <h2 style={systemTitle}>{system.name}</h2>
                  <p style={systemLine}>{system.line}</p>
                  <span style={explore}>EXPLORE SYSTEM</span>
                </div>
              </Link>
            );
          })}
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
  minHeight: '76vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,241,45,0.18)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.36,
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

const systemSection: CSSProperties = {
  padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.25rem, 4vw, 4rem) clamp(4rem, 8vw, 7rem)',
};

const systemsGrid: CSSProperties = {
  maxWidth: '1320px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '1rem',
};

const topCardPlacement: CSSProperties = { gridColumn: 'span 2' };
const bottomCardPlacement: CSSProperties = { gridColumn: 'span 3' };

const systemCard: CSSProperties = {
  minHeight: '440px', position: 'relative', overflow: 'hidden', textDecoration: 'none',
  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#050505', display: 'block',
  backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
};

const systemOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.50) 52%, rgba(0,0,0,0.90) 100%), linear-gradient(90deg, rgba(0,0,0,0.58), transparent)',
};

const systemContent: CSSProperties = {
  position: 'absolute', inset: 0, padding: '1.35rem',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 2,
};

const systemTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(1.55rem, 2.45vw, 2.55rem)',
  lineHeight: 0.96, letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};

const systemLine: CSSProperties = {
  color: 'rgba(255,255,255,0.72)', fontSize: '0.95rem',
  lineHeight: 1.55, margin: '1rem 0 0', maxWidth: '360px',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};
