import { PageHeader } from '@/components/PageHeader';
import { GlobalCommercialModel } from '@/components/GlobalCommercialModel';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Distributors & B2B Partners | ELIMFILTERS',
  description: 'Find ELIMFILTERS authorized distributors for industrial, heavy-duty, fleet and equipment filtration, access Product Intelligence, or contact Application Support.',
  keywords: ['industrial filtration distributors', 'heavy duty filter distributor', 'fleet filtration distributor', 'authorized filtration distributors', 'B2B filtration partners', 'ELIMFILTERS distributors'],
  alternates: { canonical: 'https://elimfilters.com/distributors/' },
  openGraph: {
    title: 'Industrial Filtration Distributors & B2B Partners | ELIMFILTERS',
    description: 'Find authorized regional distributors, access Product Intelligence, or contact ELIMFILTERS Application Support for industrial and heavy-duty filtration requirements.',
    url: 'https://elimfilters.com/distributors/',
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
};

const DISTRIBUTORS = [
  {
    country: 'Dominican Republic',
    company: 'TROY, SRL',
    region: 'Caribbean / LATAM',
    address: 'Ave. Las Palmas #64, Santo Domingo, Dominican Republic 10905',
    phone: '',
    social: 'Instagram',
    href: 'https://www.instagram.com/troydominicana/',
  },
  {
    country: 'Colombia',
    company: 'COLSAISA',
    region: 'Andean Region',
    address: 'Cl. 17 #82 - 67, Fontibon, Bogota, Colombia',
    phone: '+57 310 611 2190',
    social: '',
    href: '',
  },
  {
    country: 'United States',
    company: 'ELIMPERCA',
    region: 'North America',
    address: 'Frisco, Texas, United States',
    phone: '',
    social: '',
    href: '',
  },
];

const TAGS = [
  'Industrial Filtration',
  'Heavy Duty',
  'Fleet Support',
  'Automotive',
  'Product Intelligence',
  'Asset Protection',
];

const PARTNER_VALUES = [
  {
    title: 'Technical Capability',
    body: 'Partners support disciplined product identification and application context across industrial, heavy-duty, fleet, equipment, and relevant automotive requirements.',
  },
  {
    title: 'Territory Knowledge',
    body: 'Local market knowledge connects equipment populations, operating environments, customer relationships, and service requirements to the correct ELIMFILTERS protection approach.',
  },
  {
    title: 'Application Support',
    body: 'Authorized partners use product intelligence, cross-reference intake, equipment context, and technical escalation to reduce identification friction and application risk.',
  },
  {
    title: 'Inventory Discipline',
    body: 'Regional availability is managed around installed-base demand, recurring service requirements, and intelligent stocking rather than undifferentiated commodity inventory.',
  },
  {
    title: 'Brand Governance',
    body: 'Partners represent ELIMFILTERS using approved technical language, current product and technology taxonomy, evidence-based claims, and consistent Asset Protection positioning.',
  },
  {
    title: 'Customer Continuity',
    body: 'The distribution model is designed around long-term accounts, regional service, sustainable partner economics, equipment lifecycle protection, and repeatable customer support.',
  },
];

export default function DistributorsPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://elimfilters.com/distributors/#authorized-distributors',
    name: 'ELIMFILTERS Authorized Distributors',
    url: 'https://elimfilters.com/distributors/',
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://elimfilters.com/#website',
      url: 'https://elimfilters.com/',
      name: 'ELIMFILTERS',
    },
    numberOfItems: DISTRIBUTORS.length,
    itemListElement: DISTRIBUTORS.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: item.company,
        address: item.address,
        areaServed: item.country,
        memberOf: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
      },
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader currentPage="Distributors" />

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/distributor-network.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <h1 style={heroTitle}>Authorized Commercial Partner Network</h1>
          <p style={heroLead}>
            Find an ELIMFILTERS authorized distributor for industrial, heavy-duty, fleet and equipment filtration, or use our technical channels when you need product identification or application support.
          </p>

          <div style={heroActions}>
            <a href="#authorized-distributors" style={yellowButton} data-conversion-action="distributor-locator">FIND A DISTRIBUTOR</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton} data-conversion-action="product-intelligence">SEARCH PRODUCT INTELLIGENCE</a>
            <Link href="/contact/" style={darkButton} data-conversion-action="application-support">APPLICATION SUPPORT</Link>
          </div>

          <div style={tagRow}>
            {TAGS.map((label) => (
              <span key={label} style={tag}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <h2 style={sectionTitle}>Regional Coverage. Technical Accountability. Sustainable Partner Value.</h2>
          </div>
          <div>
            <p style={leadText}>
              Authorized partners extend ELIMFILTERS technical and commercial coverage while preserving one global product, quality, intelligence, and brand-governance system.
            </p>
            <p style={bodyText}>
              ELIMFILTERS is structured to support the partner rather than reduce the relationship to a product transaction. Local customer relationships, inventory strategy, technical sales, service, and market knowledge are integral parts of the value chain.
            </p>
          </div>
        </div>
      </section>

      <GlobalCommercialModel variant="distributors" />

      <section id="authorized-distributors" style={networkSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>Authorized Distributors</h2>
          </div>

          <div style={distributorGrid}>
            {DISTRIBUTORS.map((item, index) => (
              <article key={item.company} style={distributorCard}>
                <span style={distributorNumber}>{String(index + 1).padStart(2, '0')}</span>
                <p style={region}>{item.region}</p>
                <h3 style={company}>{item.company}</h3>
                <p style={country}>{item.country}</p>
                <p style={address}>{item.address}</p>

                {item.phone && <a href={`tel:${item.phone.replace(/\s/g, '')}`} style={contactLink}>{item.phone}</a>}

                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={contactLink}>
                    {item.social}
                  </a>
                )}

                <div style={authorized}>ELIMFILTERS AUTHORIZED DISTRIBUTOR</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={partnerSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Partner Standards</h2>

          <div style={partnerGrid}>
            {PARTNER_VALUES.map((item, index) => (
              <article key={item.title} style={partnerCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 style={partnerTitle}>{item.title}</h3>
                <p style={partnerBody}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={applicationCallout}>
        <div style={applicationInner}>
          <div>
            <h2 style={sectionTitle}>Become an ELIMFILTERS Authorized Commercial Partner</h2>
            <p style={{ ...bodyText, maxWidth: '740px', marginTop: '1.2rem' }}>
              Submit your company profile, service territory, technical capabilities, target industries, automotive / Light Duty coverage where relevant, and market-development objectives for commercial review.
            </p>
          </div>
          <Link href="/distributor-application" style={yellowButton} data-conversion-action="partner-application">APPLY FOR REVIEW</Link>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Need a Distributor, a Product Match, or Technical Support?
          </h2>
          <p style={{ ...bodyText, maxWidth: '720px', margin: '1.2rem auto 0' }}>
            Choose the path that matches your requirement. Distributor discovery, product identification and application support are separate workflows so technical questions do not get lost inside a generic commercial inquiry.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <a href="#authorized-distributors" style={yellowButton} data-conversion-action="distributor-locator">FIND A DISTRIBUTOR</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton} data-conversion-action="product-intelligence">PRODUCT INTELLIGENCE</a>
            <Link href="/contact/" style={darkButton} data-conversion-action="application-support">APPLICATION SUPPORT</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };

const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = {
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.52) 48%, rgba(0,0,0,0.20) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const heroTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '850px', color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600,
};

const heroActions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2rem' };
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

const networkSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)', scrollMarginTop: '6rem' };

const distributorGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const distributorCard: CSSProperties = {
  position: 'relative', minHeight: '420px', padding: '1.4rem',
  border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
  display: 'flex', flexDirection: 'column',
};

const distributorNumber: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.86rem', marginBottom: '2.5rem',
};

const region: CSSProperties = {
  color: 'rgba(255,241,45,0.82)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: '0 0 0.7rem',
};

const company: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3vw, 3.3rem)',
  lineHeight: 0.94, letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase',
};

const country: CSSProperties = {
  color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.08em', fontSize: '0.82rem', margin: '1.1rem 0 0.4rem',
};

const address: CSSProperties = {
  color: 'rgba(255,255,255,0.62)', fontSize: '0.95rem',
  lineHeight: 1.58, margin: 0,
};

const contactLink: CSSProperties = {
  color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.82rem', marginTop: '1.2rem',
};

const authorized: CSSProperties = {
  marginTop: 'auto', paddingTop: '1.4rem', borderTop: '1px solid rgba(255,241,45,0.26)',
  color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.68rem',
};

const partnerSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const partnerGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const partnerCard: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.4rem', minHeight: '230px',
};

const partnerTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.35rem',
  lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em',
};

const partnerBody: CSSProperties = {
  color: 'rgba(255,255,255,0.6)', lineHeight: 1.62,
  fontSize: '0.92rem', margin: '1rem 0 0',
};

const applicationCallout: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const applicationInner: CSSProperties = {
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
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em',
  fontSize: '0.82rem', padding: '1rem 1.25rem',
};

const darkButton: CSSProperties = {
  display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D',
  textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)',
};