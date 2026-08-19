import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TechnologiesPortfolio } from '@/components/TechnologiesPortfolio';
import { PageHeader } from '@/components/PageHeader';

const canonicalTechnologies = [
  ['MACROCORE™', 'macrocore', 'Engine air contamination control and intake-system protection.'],
  ['MICROKAPPA™', 'microkappa', 'Occupant-compartment air quality and cabin-system protection.'],
  ['DRYCORE™', 'drycore', 'Pneumatic brake-system air protection.'],
  ['INTEKCORE™', 'intekcore', 'Controlled air intake and filtration-system integration.'],
  ['SYNTAPORE™', 'syntapore', 'Fuel particulate contamination control and fuel-system protection.'],
  ['HYDROCORE™', 'hydrocore', 'Fuel-water separation across standard spin-on/cartridge separator applications and approved Turbine Series FH/FG applications and 2010/2020/2040 replacement elements.'],
  ['SYNTRAX™', 'syntrax', 'Lubricant cleanliness and engine/component protection.'],
  ['NANOFORCE™', 'nanoforce', 'Hydraulic-fluid contamination control and hydraulic-component protection.'],
  ['THERMACORE™', 'thermacore', 'Cooling-system cleanliness and component protection.'],
] as const;

export const metadata = {
  title: 'Industrial Filtration Engineering Technologies',
  description: 'ELIMFILTERS protection technologies: MACROCORE, MICROKAPPA, DRYCORE, INTEKCORE, SYNTAPORE, HYDROCORE, SYNTRAX, NANOFORCE and THERMACORE.',
  keywords: ['industrial filtration engineering', 'asset protection systems', 'ELIMFILTERS technologies', 'contamination control', 'equipment reliability'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies/',
  },
  openGraph: {
    title: 'Industrial Filtration Engineering Technologies | ELIMFILTERS',
    description: 'Protection technologies engineered within ELIMFILTERS Asset Protection Systems.',
    url: 'https://elimfilters.com/technologies/',
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration Engineering Technologies | ELIMFILTERS',
    description: 'Protection technologies engineered within ELIMFILTERS Asset Protection Systems.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function TechnologiesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://elimfilters.com/technologies/#collection',
    name: 'ELIMFILTERS Protection Technologies',
    url: 'https://elimfilters.com/technologies/',
    description: 'Industrial filtration engineering technologies within ELIMFILTERS Asset Protection Systems.',
    numberOfItems: canonicalTechnologies.length,
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: canonicalTechnologies.length,
      itemListElement: canonicalTechnologies.map(([name, slug, description], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'DefinedTerm',
          '@id': `https://elimfilters.com/technologies/${slug}/#technology`,
          name,
          description,
          url: `https://elimfilters.com/technologies/${slug}/`,
          inDefinedTermSet: {
            '@id': 'https://elimfilters.com/technologies/#collection',
          },
        },
      })),
    },
  };

  return (
    <main className="technologies-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Technologies" />

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/operator-technology.avif)' }} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <h1 style={heroTitle}>
            Technology Built
            <br />
            <span style={{ color: '#FFF12D' }}>To Protect Assets</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS® technologies are engineering architectures mapped to protected systems, contamination risks, and industrial duty cycles.
          </p>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 className="technologies-difference-title" style={whyTitle}>The filter is the means. Asset protection is the objective.</h2>
          </div>
          <div>
            <p style={leadText}>A product number tells you what fits. A technology defines the protection function and the operating risk being controlled.</p>
            <p style={bodyText}>Systems define the protection domain. Technologies define the engineering architecture. Filtration components deliver the field implementation.</p>
          </div>
        </div>
      </section>

      <TechnologiesPortfolio />

      <section className="technologies-final-cta" style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="technologies-final-title" style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>Technologies support systems. Systems protect assets.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/systems/" style={yellowButton}>EXPLORE SYSTEMS</Link>
            <Link href="/contact/" style={darkButton}>CONTACT ELIMFILTERS</Link>
          </div>
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
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 };
const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.12) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.24), transparent 36%)',
};
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1040px', margin: 0, textTransform: 'uppercase',
};
const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '780px', color: 'rgba(255,255,255,0.76)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.65, fontWeight: 600,
};
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const whyTitle: CSSProperties = { fontFamily: approvedDisplayFont, fontSize: 'clamp(2.04rem, 4.08vw, 3.67rem)', lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)' };
