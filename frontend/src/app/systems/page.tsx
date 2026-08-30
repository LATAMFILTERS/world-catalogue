import type { CSSProperties } from 'react';
import { PageHeader } from '@/components/PageHeader';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';

const SYSTEM_IMAGES: Record<string, string> = {
  // Not mecanica-air.avif: a legacy page-scoped CSS hack (main:has(img[src*="mecanica-air.avif"]))
  // hides every sibling section after the 3rd once that file appears anywhere in <main>.
  'air-intake': '/images/air-filters-lab.avif',
  'fuel-cleanliness': '/images/syntapore_mecanico_camion.avif',
  lubrication: '/images/oil-hand.avif',
  hydraulic: '/images/hidraulic.avif',
  'cooling-system': '/images/coolant-filters.avif',
};

const SYSTEM_LINES: Record<string, string> = {
  'air-intake': 'Engine intake, cabin-air and pneumatic moisture-control functions organized within one airflow protection domain.',
  'fuel-cleanliness': 'Particle control and approved fuel-water separation functions for fuel-system protection.',
  lubrication: 'Lubricant contamination control for bearings, journals and other lubricated components.',
  hydraulic: 'Fluid cleanliness control for pumps, valves, actuators and precision hydraulic components.',
  'cooling-system': 'Coolant cleanliness and component protection within the approved cooling-system maintenance strategy.',
};

export const metadata: Metadata = {
  title: 'Industrial Asset Protection Systems | Contamination Control | ELIMFILTERS',
  description:
    'Explore five ELIMFILTERS protection systems for air intake, fuel, lubrication, hydraulic, and cooling system contamination control. Prevent equipment failure with engineered asset protection.',
  keywords: [
    'asset protection systems',
    'contamination control',
    'air intake protection',
    'fuel cleanliness',
    'lubrication protection',
    'hydraulic protection',
    'cooling system protection',
    'industrial filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: `${BASE_URL}/systems/` },
  openGraph: {
    title: 'Protection Systems | ELIMFILTERS',
    description:
      'Five canonical ELIMFILTERS protection systems for system-level contamination control and asset protection.',
    url: `${BASE_URL}/systems/`,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/sistems-hero.avif`, width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protection Systems | ELIMFILTERS',
    description:
      'Five canonical ELIMFILTERS protection systems for system-level contamination control and asset protection.',
    images: [`${BASE_URL}/images/sistems-hero.avif`],
  },
};

export default function SystemsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${BASE_URL}/systems/#systems`,
    name: 'ELIMFILTERS Protection Systems',
    url: `${BASE_URL}/systems/`,
    numberOfItems: PROTECTION_SYSTEM_LIST.length,
    itemListElement: PROTECTION_SYSTEM_LIST.map((system, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        name: system.name,
        url: `${BASE_URL}/systems/${system.slug}/`,
        description: system.tagline,
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader currentPage="Systems" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={{ ...heroImage, objectFit: 'cover', objectPosition: 'center' }}>
          <source src="/images/Robotic_arm_replacing_filtration_system.mp4" type="video/mp4" />
        </video>
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>
            Five Protection
            <br />
            <span style={{ color: '#FFF12D' }}>Systems. One Asset Strategy.</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS organizes contamination control around five canonical protection systems. Cabin-air filtration and pneumatic air-dryer protection remain functions inside Air Intake & Airflow Protection rather than separate core systems.
          </p>

          <div style={tagRow}>
            {['AIR INTAKE & AIRFLOW', 'FUEL', 'LUBRICATION', 'HYDRAULIC', 'COOLING'].map((item) => (
              <span key={item} style={tag}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={whyTitle}>A filter is the means. The protected system defines the engineering logic.</h2>
          </div>
          <div>
            <p style={leadText}>
              The same asset can face different contamination pathways across air intake, fuel, lubrication, hydraulic and cooling circuits. Operator cabin protection and pneumatic moisture control are incorporated within the Air Intake & Airflow architecture.
            </p>
            <p style={bodyText}>
              ELIMFILTERS structures the platform around protection systems first, canonical technologies second, product families third, and individual part numbers last.
            </p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(2rem, 6vw, 4rem)', alignItems: 'center' }}>
          <div>
            <img
              src="/images/banco-pruebas-filtros.png"
              alt="Filter validation test bench"
              style={{ width: '100%', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div>
            <h2 style={whyTitle}>Validated on the bench before it is specified in the field.</h2>
            <p style={{ ...leadText, marginTop: '1.5rem' }}>
              Every protection system is run through dedicated test equipment that reproduces the pressure, flow rate, temperature, and contaminant characteristics of the actual application, not a generic laboratory standard. That is where efficiency, contaminant-holding capacity, and structural durability are measured against the conditions the part will actually face before it ever reaches production.
            </p>
            <p style={{ ...bodyText, marginTop: '1.2rem' }}>
              Industry-standard test protocols set a baseline, but they do not always reflect a specific duty cycle, fuel quality, or operating environment. ELIMFILTERS structures its validation around application-based simulation testing to close that gap, so a protection system is proven under real operating conditions before it is specified, not after it fails in the field.
            </p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(2rem, 6vw, 4rem)', alignItems: 'center' }}>
          <div>
            <h2 style={whyTitle}>Consistency is the standard, not the exception.</h2>
            <p style={{ ...leadText, marginTop: '1.5rem' }}>
              Getting it right the first time starts with the people running the bench, not just the equipment on it. Every ELIMFILTERS® media formulation and finished component is measured against the same testing discipline before it is approved for production, so reliability does not depend on which batch, which shift, or which line built the part.
            </p>
            <p style={{ ...bodyText, marginTop: '1.2rem' }}>
              Preventing a failure is worth more than diagnosing one after it happens. ELIMFILTERS® engineering combines physics-based modeling with AI-generated simulation built on hostile-environment data — extreme dust loading, thermal cycling, vibration, and contaminant flow characteristics modeled down to the fiber and micro-scale level. That makes it possible to analyze hundreds of design configurations before a single physical unit exists, so the design that reaches the bench has already been optimized against the conditions it will actually face.
            </p>
          </div>
          <div>
            <img
              src="/images/operador-bancopruebas.png"
              alt="Test bench results review"
              style={{ width: '100%', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
      </section>

      <section style={systemSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>Select the protected system. Control the contamination pathway.</h2>
          </div>

          <div style={systemGrid}>
            {PROTECTION_SYSTEM_LIST.map((system) => {
              const image = SYSTEM_IMAGES[system.slug] || '/images/sistems-hero.avif';
              const line = SYSTEM_LINES[system.slug] || system.tagline;

              return (
                <Link key={system.key} href={`/systems/${system.slug}/`} style={systemCard}>
                  {/* alt intentionally not the literal system name: a legacy page-scoped CSS rule
                      (main:has(img[alt="Air Intake & Airflow Protection"])) hides sibling sections
                      on any page where that exact string appears on an <img>. */}
                  <img src={image} alt={`${system.name} system card`} style={systemImage} />
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

      <section style={searchCallout}>
        <div style={searchInner}>
          <div>
            <h2 style={sectionTitle}>From system domain to real part number.</h2>
            <p style={{ ...bodyText, maxWidth: '760px', marginTop: '1.2rem' }}>
              Use ELIMFILTERS Part Search to connect OEM numbers, cross-reference data, dimensions and application logic back to the correct protection system.
            </p>
          </div>
          <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={yellowButton}>
            PART SEARCH
          </a>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Continue from system architecture to the applicable product family.
          </h2>
          <p style={{ ...bodyText, maxWidth: '720px', margin: '1.4rem auto 0', textAlign: 'center' }}>
            Product families connect the five protection systems to physical filtration components and application-specific part identification.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/families/" style={yellowButton}>EXPLORE PRODUCT FAMILIES</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'rgba(255,241,45,0.03)', borderTop: '1px solid rgba(255,241,45,0.1)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Deep Dive into System Architecture</h2>
          <p style={{ ...bodyText, maxWidth: '720px', marginBottom: '1.5rem' }}>
            Learn the engineering reference standards, testing methods, and technical strategies behind each protection system in our Knowledge Center.
          </p>
          <Link href="/knowledge-center/systems/" style={yellowButton}>
            Read the Engineering Reference for Each System →
          </Link>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const approvedDisplayFont = "'Chakra Petch', 'Arial Narrow', monospace";

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };

const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.52,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.26) 48%, rgba(0,0,0,0.08) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.20), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1040px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '820px', color: 'rgba(255,255,255,0.76)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.65, fontWeight: 600,
};

const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };

const tag: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem',
  fontFamily: displayFont, fontSize: '0.72rem', textTransform: 'uppercase',
  letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.72)',
};

const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };

const twoCol: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  gap: 'clamp(2rem, 6vw, 5rem)',
};

const sectionTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};

const whyTitle: CSSProperties = {
  fontFamily: approvedDisplayFont, fontSize: 'clamp(2.04rem, 4.08vw, 3.67rem)',
  lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};

const leadText: CSSProperties = {
  color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72, fontWeight: 600, margin: 0,
};

const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };

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
  lineHeight: 1.55, margin: '1rem 0 0', maxWidth: '380px',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};

const searchCallout: CSSProperties = {
  padding: '0 clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)',
};

const searchInner: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'flex', flexWrap: 'wrap',
  alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
  border: '1px solid rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.045)',
  padding: 'clamp(1.5rem, 4vw, 2.4rem)',
};

const cta: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.2)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)',
};

const yellowButton: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em',
  fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase',
};
