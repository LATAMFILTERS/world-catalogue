import Link from 'next/link';
import type { CSSProperties } from 'react';

const INDUSTRIES = [
  ['mining', 'Mining', '/images/mineria-1.avif', 'Abrasive dust, hydraulic load, engine stress, and severe production cycles.'],
  ['agriculture', 'Agriculture', '/images/agricultor-1.avif', 'Harvest dust, long service windows, fuel cleanliness, and equipment uptime.'],
  ['construction', 'Construction', '/images/chino-construction.avif', 'Jobsite dust, idle time, hydraulic stress, and high-cost downtime.'],
  ['oil-gas', 'Oil & Gas', '/images/ingpetrolero.avif', 'Remote uptime, fluid cleanliness, bulk fuel control, and harsh duty cycles.'],
  ['marine', 'Marine', '/images/ingmarine.avif', 'Water separation, fuel reliability, corrosion exposure, and propulsion protection.'],
  ['power-generation', 'Power Generation', '/images/generatorsupervisor.avif', 'Standby readiness, fuel stability, lube protection, and emergency uptime.'],
  ['trucks-fleets', 'Truck Fleets', '/images/transport.avif', 'Route uptime, service discipline, fuel economy, and lifecycle control.'],
  ['manufacturing', 'Manufacturing', '/images/manufactura.avif', 'Plant continuity, compressed air quality, hydraulic control, and process reliability.'],
  ['railway', 'Railway', '/images/ing-railway.avif', 'Long operating cycles, diesel reliability, vibration exposure, and maintenance planning.'],
  ['waste-municipal', 'Waste Municipal', '/images/wasted-municipal.avif', 'Stop-start duty, dust ingestion, hydraulic load, and public-service uptime.'],
  ['bus-coach', 'Bus & Coach', '/images/bus-hero.avif', 'Passenger uptime, cabin air, engine protection, and predictable route service.'],
  ['automotive', 'Automotive', '/images/Automotive-1.avif', 'Light-duty protection, service reliability, and high-volume application coverage.'],
];

export const metadata = {
  title: 'Industries | ELIMFILTERS Industrial Asset Protection',
  description: 'Industrial asset protection for severe-duty markets including mining, agriculture, construction, marine, oil and gas, power generation, truck fleets, railway, and manufacturing.',
};

export default function IndustriesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ELIMFILTERS Industrial Markets',
    url: 'https://elimfilters.com/industries',
    numberOfItems: INDUSTRIES.length,
    itemListElement: INDUSTRIES.map(([slug, label], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: label,
        url: `https://elimfilters.com/industries/${slug}`,
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/mineria-1.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>
            Built For
            <br />
            <span style={{ color: '#FFF12D' }}>Severe-Duty Work</span>
          </h1>
          <p style={heroLead}>
            Every industry has a different contamination profile. ELIMFILTERS structures protection around the machine, the environment, the duty cycle, and the cost of downtime.
          </p>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={industryRiskTitle}>The same filter does not face the same failure risk.</h2>
          </div>
          <div>
            <p style={leadText}>
              A mining loader, a marine engine, a standby generator, and a city waste truck may share filter categories, but they do not share the same operating reality.
            </p>
            <p style={bodyText}>
              Dust concentration, fuel quality, moisture exposure, idle time, thermal stress, load cycle, service discipline, and system sensitivity all change how filtration should be selected, positioned, and supported.
            </p>
          </div>
        </div>
      </section>

      <section style={marketSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>Select the market. Protect the asset.</h2>
          </div>

          <div style={marketGrid}>
            {INDUSTRIES.map(([slug, label, image, line]) => (
              <Link key={slug} href={`/industries/${slug}`} style={marketCard}>
                <img src={image} alt={label} style={marketImage} />
                <div style={marketOverlay} />
                <div style={marketContent}>
                  <h3 style={marketTitle}>{label}</h3>
                  <p style={marketLine}>{line}</p>
                  <span style={explore}>EXPLORE MARKET</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Each market requires a different protection conversation.
          </h2>
          <p style={{ ...bodyText, maxWidth: '720px', margin: '1.4rem auto 0', textAlign: 'center' }}>
            ELIMFILTERS helps distributors and industrial operators connect the correct technology portfolio to the operating reality of each market.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/contact" style={yellowButton}>CONTACT ELIMFILTERS</Link>
            <Link href="/distributor-application" style={darkButton}>DISTRIBUTOR REVIEW</Link>
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
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center 38%', opacity: 0.40,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.68) 48%, rgba(0,0,0,0.28) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.16), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '980px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '770px', color: 'rgba(255,255,255,0.76)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.65, fontWeight: 600,
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

const industryRiskTitle: CSSProperties = {
  ...sectionTitle,
  fontSize: 'clamp(2.3rem, 4.6vw, 4.14rem)',
};

const leadText: CSSProperties = {
  color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72, fontWeight: 600, margin: 0,
};

const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };

const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const marketSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const marketGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const marketCard: CSSProperties = {
  minHeight: '420px', position: 'relative', overflow: 'hidden', textDecoration: 'none',
  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505',
};

const marketImage: CSSProperties = {
  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  opacity: 0.76, filter: 'brightness(1.12) contrast(1.04)',
};

const marketOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0.78) 100%), linear-gradient(90deg, rgba(0,0,0,0.42), transparent)',
};

const marketContent: CSSProperties = {
  position: 'absolute', inset: 0, padding: '1.35rem',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};

const marketTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(1.4rem, 2vw, 1.9rem)',
  lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};

const marketLine: CSSProperties = {
  color: 'rgba(255,255,255,0.68)', fontSize: '0.95rem',
  lineHeight: 1.55, margin: '1rem 0 0', maxWidth: '360px',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};

const cta: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.2)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)',
};

const yellowButton: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em',
  fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase',
};

const darkButton: CSSProperties = {
  display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D',
  textDecoration: 'none', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)', textTransform: 'uppercase',
};