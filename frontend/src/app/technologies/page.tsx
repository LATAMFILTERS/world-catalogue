import Link from 'next/link';
import type { CSSProperties } from 'react';

const TECHNOLOGIES = [
  ['macrocore', 'MACROCORE', 'Air Intake Protection', '/assets/MACROCORE.avif', 'Progressive density air intake protection for dust-heavy combustion environments.'],
  ['syntepore', 'SYNTEPORE', 'Fuel Cleanliness Protection', '/assets/SYNTEPORE.avif', 'Precision fuel protection for high-pressure diesel injection systems.'],
  ['hydrocore', 'HYDROCORE', 'Fuel / Water Separation', '/assets/HYDROCORE.avif', 'Water separation architecture for diesel fuel reliability and injector protection.'],
  ['turbocore-series', 'TURBOCORE', 'Bulk Fuel Protection', '/assets/TURBOCORE.avif', 'High-flow fuel protection for power generation, mining, and severe-duty supply systems.'],
  ['syntrax', 'SYNTRAX', 'Lubrication Protection', '/assets/SYNTRAX.avif', 'Engine oil protection designed around wear control and extended service discipline.'],
  ['nanoforce', 'NANOFORCE', 'Hydraulic Protection', '/assets/NANOFORCE.avif', 'Hydraulic contamination control for pumps, valves, cylinders, and pressure stability.'],
  ['thermacore', 'THERMACORE', 'Cooling System Protection', '/assets/THERMACORE.avif', 'Coolant protection architecture for thermal stability and corrosion control.'],
  ['drycore', 'DRYCORE', 'Compressed Air Protection', '/assets/DRYCORE.avif', 'Moisture control for air brake, pneumatic, and compressed air systems.'],
  ['intekcore', 'INTEKCORE', 'Housing Architecture', '/assets/INTEKCORE.avif', 'Filter housing protection focused on sealing integrity, pressure, and zero-bypass logic.'],
  ['microkappa', 'MICROKAPPA', 'Cabin Air Protection', '/assets/MICROKAPPA.avif', 'Cabin air protection for operators exposed to dust, exhaust, and industrial environments.'],
];

const COMMERCIAL_LINES = [
  {
    slug: 'marineclean',
    name: 'MARINECLEAN',
    label: 'Marine Protection Line',
    image: '/assets/MARINECLEAN.avif',
    href: '/commercial-lines/marineclean',
    description: 'Salt-resistant filtration solutions engineered for marine, offshore, and coastal operations.',
  },
  {
    slug: 'duratech',
    name: 'DURATECH',
    label: 'Fleet Master Kit Line',
    image: '/assets/Duratech.avif',
    href: '/commercial-lines/duratech',
    description: 'Integrated maintenance kits engineered for heavy-duty fleet service and severe-duty equipment uptime.',
  },
];

export const metadata = {
  title: 'Technologies | ELIMFILTERS Asset Protection Platform',
  description:
    'ELIMFILTERS technologies are proprietary protection architectures engineered for contamination control across air intake, fuel, lubrication, hydraulic, cooling, cabin, and compressed air systems.',
};

export default function TechnologiesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Proprietary Technologies',
    url: 'https://elimfilters.com/technologies',
    numberOfItems: TECHNOLOGIES.length,
    itemListElement: TECHNOLOGIES.map(([slug, name, system, , description], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TechArticle',
        name,
        description,
        url: `https://elimfilters.com/technologies/${slug}`,
        about: system,
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/operator-technology.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <p style={eyebrow}>PROPRIETARY TECHNOLOGIES</p>
          <h1 style={heroTitle}>
            Technology
            <br />
            <span style={{ color: '#FFF12D' }}>Built To Protect Assets</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS technologies are not decorative product names. They are protection architectures mapped to specific contamination mechanisms, system risks, and industrial operating environments.
          </p>

          <div style={tagRow}>
            {['AIR', 'FUEL', 'LUBE', 'HYDRAULIC', 'COOLING', 'CABIN'].map((item) => (
              <span key={item} style={tag}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>THE DIFFERENCE</p>
            <h2 style={sectionTitle}>Products replace parts. Technologies control failure.</h2>
          </div>
          <div>
            <p style={leadText}>
              A product number tells you what fits. A technology tells you why the asset is being protected, what contamination pathway is being controlled, and what operating risk is being reduced.
            </p>
            <p style={bodyText}>
              This is the foundation of the ELIMFILTERS platform: systems define the protection domain, technologies define the engineering architecture, and product families deliver the field implementation.
            </p>
          </div>
        </div>
      </section>

      <section style={techSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <p style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
            <h2 style={sectionTitle}>Select the architecture. Understand the protection role.</h2>
          </div>

          <div style={techGrid}>
            {TECHNOLOGIES.map(([slug, name, system, image, line]) => (
              <Link key={slug} href={`/technologies/${slug}`} style={techCard}>
                <div style={techLogoStage}>
                  <img src={image} alt={name} style={techImage} />
                </div>
                <div style={techOverlay} />
                <div style={techContent}>
                  <p style={techSystem}>{system}</p>
                  <p style={techLine}>{line}</p>
                  <span style={explore}>EXPLORE TECHNOLOGY</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={commercialSection}>
        <div style={wrap}>
          <p style={eyebrow}>COMMERCIAL LINES</p>
          <h2 style={sectionTitle}>Specialized lines built on technology architecture.</h2>

          <div style={commercialGrid}>
            {COMMERCIAL_LINES.map((line) => (
              <Link key={line.slug} href={line.href} style={commercialCard}>
                <div style={commercialLogoPanel}>
                  <img src={line.image} alt={line.name} style={commercialImage} />
                </div>
                <div style={commercialContent}>
                  <p style={commercialLabel}>{line.label}</p>
                  <p style={commercialDescription}>{line.description}</p>
                  <span style={explore}>EXPLORE LINE</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={searchCallout}>
        <div style={searchInner}>
          <div>
            <p style={eyebrow}>PART SEARCH INTELLIGENCE</p>
            <h2 style={sectionTitle}>Technology must connect to real parts.</h2>
            <p style={{ ...bodyText, maxWidth: '760px', marginTop: '1.2rem' }}>
              Use ELIMFILTERS part search to connect OEM numbers, competitive references, product families, dimensions, and application logic to the correct protection architecture.
            </p>
          </div>
          <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={yellowButton}>
            PART SEARCH
          </a>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>TOTAL ASSET PROTECTION</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Technologies support systems. Systems protect assets.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/systems" style={yellowButton}>EXPLORE SYSTEMS</Link>
            <Link href="/contact" style={darkButton}>CONTACT ELIMFILTERS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };

const homeButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 50,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
  padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};

const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.36,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 48%, rgba(0,0,0,0.30) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.20), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.75rem',
  fontWeight: 700, letterSpacing: '0.3em', margin: '0 0 1rem',
};

const heroTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '800px', color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600,
};

const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };

const tag: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.18)', padding: '0.82rem 1rem',
  fontFamily: 'var(--font-display)', fontSize: '0.74rem',
  letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.88)',
};

const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };

const twoCol: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  gap: 'clamp(2rem, 6vw, 5rem)',
};

const sectionTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase',
};

const leadText: CSSProperties = {
  color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72, fontWeight: 600, margin: 0,
};

const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const techSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const techGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const techCard: CSSProperties = {
  minHeight: '440px', position: 'relative', overflow: 'hidden', textDecoration: 'none',
  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505',
};

const techLogoStage: CSSProperties = {
  position: 'absolute', top: '1rem', left: '1rem', right: '1rem', height: '255px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
};

const techImage: CSSProperties = {
  display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center',
  opacity: 0.84, filter: 'brightness(1.16) contrast(1.05)',
};

const techOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.16) 46%, rgba(0,0,0,0.88) 100%), linear-gradient(90deg, rgba(0,0,0,0.22), transparent)',
};

const techContent: CSSProperties = {
  position: 'absolute', inset: 0, padding: '1.35rem',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};

const techSystem: CSSProperties = {
  color: 'rgba(255,241,45,0.9)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: '0 0 0.7rem',
};

const techLine: CSSProperties = {
  color: 'rgba(255,255,255,0.68)', fontSize: '0.95rem',
  lineHeight: 1.55, margin: 0, maxWidth: '360px',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};

const commercialSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const commercialGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const commercialCard: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'minmax(120px, 0.85fr) minmax(0, 1.15fr)', alignItems: 'center', gap: '1.6rem',
  textDecoration: 'none', color: '#fff', background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)', padding: '1.45rem', overflow: 'hidden',
};

const commercialLogoPanel: CSSProperties = {
  minHeight: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'radial-gradient(circle at center, rgba(255,255,255,0.055), rgba(0,0,0,0.12) 62%)',
  border: '1px solid rgba(255,255,255,0.05)', padding: '1rem',
};

const commercialImage: CSSProperties = {
  width: '100%', maxWidth: '210px', height: 'auto', objectFit: 'contain', flexShrink: 0,
};

const commercialContent: CSSProperties = {
  minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
};

const commercialLabel: CSSProperties = {
  color: 'rgba(255,241,45,0.88)', fontFamily: 'var(--font-display)',
  fontSize: '0.72rem', letterSpacing: '0.16em', fontWeight: 700, margin: '0 0 0.8rem', textTransform: 'uppercase',
};

const commercialDescription: CSSProperties = {
  color: 'rgba(255,255,255,0.64)', fontSize: '0.92rem', lineHeight: 1.55,
  maxWidth: '420px', margin: 0,
};

const searchCallout: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
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
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)',
};

const yellowButton: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em',
  fontSize: '0.82rem', padding: '1rem 1.25rem',
};

const darkButton: CSSProperties = {
  display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D',
  textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)',
};
