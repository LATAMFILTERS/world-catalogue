import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from '@/components/PageHeader';

const LINES = [
  {
    slug: 'marineclean',
    name: 'MARINECLEAN',
    system: 'Marine Protection Line',
    image: '/assets/MARINECLEAN.avif',
    href: '/commercial-lines/marineclean',
    line: 'Salt-resistant filtration line for marine, offshore, harbor, and coastal operations.',
    details: ['Marine diesel', 'Hydraulic systems', 'Salt exposure', 'Corrosion control'],
  },
  {
    slug: 'duratech',
    name: 'DURATECH',
    system: 'Fleet Master Kit Line',
    image: '/assets/Duratech.avif',
    href: '/commercial-lines/duratech',
    line: 'Complete service kit logic for mixed-model fleets, trucks, machinery, and heavy equipment.',
    details: ['Oil', 'Fuel', 'Air', 'Cabin', 'Fleet service'],
  },
];

export const metadata = {
  title: 'Commercial Lines | ELIMFILTERS',
  description:
    'ELIMFILTERS commercial lines organize specialized product architectures for marine protection and fleet maintenance programs.',
};

export default function CommercialLinesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ELIMFILTERS Commercial Lines',
    url: 'https://elimfilters.com/commercial-lines',
    description:
      'ELIMFILTERS specialized commercial lines for marine protection and fleet maintenance.',
    hasPart: LINES.map((line) => ({
      '@type': 'WebPage',
      name: line.name,
      url: `https://elimfilters.com${line.href}`,
      description: line.line,
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader currentPage="Commercial" />

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/commercial-lines-hero.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>
            Lines Built
            <br />
            For Operating Reality
          </h1>
          <p style={heroLead}>
            ELIMFILTERS commercial lines package protection technologies into market-ready programs for marine environments and fleet maintenance operations.
          </p>

          <div style={tagRow}>
            {['MARINE', 'FLEETS', 'OFFSHORE', 'TRUCKS', 'KITS', 'UPTIME'].map((item) => (
              <span key={item} style={tag}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={sectionTitle}>A line is not a product. It is a market program.</h2>
          </div>
          <div>
            <p style={leadText}>
              Commercial lines organize technologies, product families, and application logic around a specific customer reality: harsh marine exposure or complete fleet service cycles.
            </p>
            <p style={bodyText}>
              This gives distributors and industrial customers a cleaner way to buy, explain, and standardize ELIMFILTERS protection across operating environments.
            </p>
          </div>
        </div>
      </section>

      <section style={lineSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>Two programs. Different operating missions.</h2>
          </div>

          <div style={lineGrid}>
            {LINES.map((line, index) => (
              <Link key={line.slug} href={line.href} style={lineCard}>
                <img src={line.image} alt={line.name} style={lineImage} />
                <div style={lineOverlay} />
                <div style={lineContent}>
                  <span style={lineNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={lineSystem}>{line.system}</p>
                  <h3 style={lineTitle}>{line.name}</h3>
                  <p style={lineBody}>{line.line}</p>

                  <div style={miniTags}>
                    {line.details.map((detail) => (
                      <span key={detail} style={miniTag}>{detail}</span>
                    ))}
                  </div>

                  <span style={explore}>EXPLORE LINE</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={comparisonSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Different markets. Same asset protection logic.</h2>

          <div style={comparisonGrid}>
            <article style={comparisonCard}>
              <span style={number}>01</span>
              <h3 style={comparisonTitle}>MARINECLEAN</h3>
              <p style={comparisonBody}>
                Built for salt exposure, corrosion pressure, diesel fuel protection, hydraulic circuits, wet-dry cycles, and marine operating environments.
              </p>
            </article>

            <article style={comparisonCard}>
              <span style={number}>02</span>
              <h3 style={comparisonTitle}>DURATECH</h3>
              <p style={comparisonBody}>
                Built for fleets that need complete service kits, reduced wrong-part installation, cleaner inventory structure, and faster service cycles.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Commercial lines turn technologies into market-ready protection programs.
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
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.42,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.12) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

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

const number: CSSProperties = {
  display: 'block', color: '#FFF12D', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.16em', marginBottom: '1rem',
};

const lineSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const lineGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem',
};

const lineCard: CSSProperties = {
  minHeight: '560px', position: 'relative', overflow: 'hidden', textDecoration: 'none',
  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505',
};

const lineImage: CSSProperties = {
  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.58,
};

const lineOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.64) 52%, rgba(0,0,0,0.98) 100%), linear-gradient(90deg, rgba(0,0,0,0.72), transparent)',
};

const lineContent: CSSProperties = {
  position: 'absolute', inset: 0, padding: '1.5rem',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};

const lineNumber: CSSProperties = {
  position: 'absolute', top: '1.2rem', left: '1.2rem', color: '#FFF12D',
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.86rem',
};

const lineSystem: CSSProperties = {
  color: 'rgba(255,241,45,0.82)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: '0 0 0.7rem',
};

const lineTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2.3rem, 5vw, 5rem)',
  lineHeight: 0.9, letterSpacing: '-0.05em', margin: 0, textTransform: 'uppercase',
};

const lineBody: CSSProperties = {
  color: 'rgba(255,255,255,0.7)', fontSize: '1rem',
  lineHeight: 1.6, margin: '1rem 0 0', maxWidth: '520px',
};

const miniTags: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.2rem' };

const miniTag: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.72)',
  padding: '0.42rem 0.6rem', fontFamily: 'var(--font-display)',
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1.3rem',
};

const comparisonSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const comparisonGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const comparisonCard: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.4rem', minHeight: '260px',
};

const comparisonTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '2.1rem',
  lineHeight: 1, margin: 0, letterSpacing: '-0.04em',
};

const comparisonBody: CSSProperties = {
  color: 'rgba(255,255,255,0.62)', lineHeight: 1.65,
  fontSize: '0.95rem', margin: '1rem 0 0',
};

const cta: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.2)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)',
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
