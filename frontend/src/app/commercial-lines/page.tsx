import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from '@/components/PageHeader';

const BASE_URL = 'https://elimfilters.com';

const SOLUTIONS = [
  {
    slug: 'marineclean',
    name: 'MARINECLEAN™',
    role: 'Specialized Marine Solution',
    image: '/assets/MARINECLEAN.avif',
    href: '/commercial-lines/marineclean/',
    description: 'Extends the ELIMFILTERS Asset Protection Systems architecture into marine operating environments through application-specific contamination-control planning.',
    labels: ['MARINE', 'ASSET PROTECTION', 'APPLICATION-SPECIFIC'],
  },
  {
    slug: 'duratech',
    name: 'DURATECH™',
    role: 'Integrated Maintenance Solution',
    image: '/assets/Duratech.avif',
    href: '/commercial-lines/duratech/',
    description: 'Integrates the filtration components required for a defined maintenance interval so protection is managed at the vehicle, machine or equipment level.',
    labels: ['MAINTENANCE', 'INTEGRATED KIT', 'GOVERNED INTERVAL'],
  },
] as const;

export const metadata = {
  title: 'Specialized Asset Protection Solutions | ELIMFILTERS',
  description: 'MARINECLEAN™ and DURATECH™ extend the ELIMFILTERS Asset Protection Systems architecture into specialized marine and integrated-maintenance applications.',
  alternates: { canonical: `${BASE_URL}/commercial-lines/` },
};

export default function CommercialLinesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/commercial-lines/#collection`,
    name: 'ELIMFILTERS Specialized Asset Protection Solutions',
    url: `${BASE_URL}/commercial-lines/`,
    description: 'Specialized ELIMFILTERS solutions for marine operating environments and integrated maintenance programs.',
    publisher: { '@id': `${BASE_URL}/#organization` },
    hasPart: SOLUTIONS.map((solution) => ({
      '@type': 'WebPage',
      name: solution.name,
      url: `${BASE_URL}${solution.href}`,
      description: solution.description,
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Commercial" />

      <section style={hero}>
        <div style={heroInner}>
          <p style={eyebrow}>// SPECIALIZED ASSET PROTECTION SOLUTIONS</p>
          <h1 style={heroTitle}>Specialized operating environments require governed application logic.</h1>
          <p style={heroLead}>
            MARINECLEAN™ and DURATECH™ extend the five core ELIMFILTERS protection systems without creating additional core technologies or systems.
          </p>
        </div>
      </section>

      <section style={section}>
        <div style={grid}>
          {SOLUTIONS.map((solution, index) => (
            <Link key={solution.slug} href={solution.href} style={card}>
              <div style={cardHeader}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <span style={role}>{solution.role}</span>
              </div>
              <img src={solution.image} alt={solution.name} style={logo} />
              <h2 style={cardTitle}>{solution.name}</h2>
              <p style={cardBody}>{solution.description}</p>
              <div style={labels}>
                {solution.labels.map((label) => <span key={label} style={labelStyle}>{label}</span>)}
              </div>
              <span style={explore}>VIEW GOVERNED SOLUTION →</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={governanceBand}>
        <div style={governanceInner}>
          <div>
            <p style={eyebrow}>// GOVERNANCE</p>
            <h2 style={sectionTitle}>9 core technologies. 5 core systems. 2 specialized solutions.</h2>
          </div>
          <p style={governanceCopy}>
            Specialized solutions organize approved technologies and components around a specific operating or maintenance context. They do not replace or expand the canonical core taxonomy.
          </p>
        </div>
      </section>

      <section style={cta}>
        <Link href="/systems/" style={primaryButton}>EXPLORE CORE SYSTEMS</Link>
        <Link href="/knowledge-center/" style={secondaryButton}>KNOWLEDGE CENTER</Link>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const hero: CSSProperties = { padding: 'clamp(6rem, 10vw, 9rem) clamp(1.5rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'radial-gradient(circle at top right, rgba(255,241,45,0.12), transparent 32%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const eyebrow: CSSProperties = { fontFamily: 'var(--font-mono)', color: '#FFF12D', letterSpacing: '0.16em', fontSize: '0.72rem', fontWeight: 700, marginBottom: '1rem' };
const heroTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 0.98, letterSpacing: '-0.045em', textTransform: 'uppercase', maxWidth: '980px', margin: 0 };
const heroLead: CSSProperties = { maxWidth: '820px', marginTop: '1.75rem', color: 'rgba(255,255,255,0.68)', fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', lineHeight: 1.7 };
const section: CSSProperties = { maxWidth: '1240px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)' };
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' };
const card: CSSProperties = { textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)', padding: 'clamp(1.5rem, 3vw, 2.3rem)', minHeight: '430px', display: 'flex', flexDirection: 'column' };
const cardHeader: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' };
const number: CSSProperties = { fontFamily: 'var(--font-mono)', color: '#FFF12D', fontSize: '0.72rem', fontWeight: 700 };
const role: CSSProperties = { fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.38)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' };
const logo: CSSProperties = { width: 'min(250px, 70%)', height: '90px', objectFit: 'contain', objectPosition: 'left center', margin: '2rem 0 1.5rem' };
const cardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1, margin: 0, color: '#FFF12D' };
const cardBody: CSSProperties = { color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, margin: '1rem 0 1.4rem', maxWidth: '560px' };
const labels: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.45rem' };
const labelStyle: CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.55rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.52)', fontSize: '0.58rem', letterSpacing: '0.08em' };
const explore: CSSProperties = { marginTop: 'auto', paddingTop: '2rem', color: '#FFF12D', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em' };
const governanceBand: CSSProperties = { borderTop: '1px solid rgba(255,241,45,0.14)', borderBottom: '1px solid rgba(255,241,45,0.14)', background: 'rgba(255,241,45,0.035)', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 6rem)' };
const governanceInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', lineHeight: 1, textTransform: 'uppercase', margin: 0 };
const governanceCopy: CSSProperties = { color: 'rgba(255,255,255,0.66)', lineHeight: 1.75, margin: 0 };
const cta: CSSProperties = { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem', padding: '4rem 1.5rem' };
const primaryButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', padding: '1rem 1.25rem' };
const secondaryButton: CSSProperties = { border: '1px solid rgba(255,241,45,0.35)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', padding: '1rem 1.25rem' };
