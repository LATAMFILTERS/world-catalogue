import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ENGINEERING_ARTICLES,
  KC_STANDARDS,
  KC_SYSTEMS,
  KC_INDUSTRIES,
  KC_TECHNOLOGIES,
} from '@/lib/knowledge-center-data';
import { ERL_SECTIONS } from '@/lib/engineering-reference-data';

const SECTIONS = [
  {
    href: '/knowledge-center/engineering',
    label: 'ENGINEERING',
    title: 'Engineering Principles',
    count: `${ENGINEERING_ARTICLES.length} ARTICLES`,
    description: 'Filtration theory, media science, airflow, fluid cleanliness, and contamination control fundamentals.',
  },
  {
    href: '/knowledge-center/standards',
    label: 'STANDARDS',
    title: 'Industry Standards',
    count: `${KC_STANDARDS.length} STANDARDS`,
    description: 'ISO, ASTM, SAE, and NAS references explained for testing, validation, and technical selection.',
  },
  {
    href: '/knowledge-center/systems',
    label: 'SYSTEMS',
    title: 'Protection Systems',
    count: `${KC_SYSTEMS.length} SYSTEMS`,
    description: 'Air, fuel, lube, hydraulic, cooling, cabin, and compressed air protection domains.',
  },
  {
    href: '/knowledge-center/industries',
    label: 'INDUSTRIES',
    title: 'Industry Applications',
    count: `${KC_INDUSTRIES.length} INDUSTRIES`,
    description: 'Contamination profiles, operating exposure, and filtration risk by industrial market.',
  },
  {
    href: '/knowledge-center/technologies',
    label: 'TECHNOLOGIES',
    title: 'Technology Registry',
    count: `${KC_TECHNOLOGIES.length} TECHNOLOGIES`,
    description: 'ELIMFILTERS proprietary protection architectures mapped to failure mechanisms.',
  },
  {
    href: '/knowledge-center/technical-library',
    label: 'LIBRARY',
    title: 'Technical Library',
    count: 'FIELD GUIDES',
    description: 'Specification guides, selection frameworks, procedures, and technical references.',
  },
  {
    href: '/knowledge-center/engineering-reference',
    label: 'REFERENCE',
    title: 'Engineering Reference Library',
    count: `${ERL_SECTIONS.length} SECTIONS`,
    description: 'Structured reference library for standards, filtration science, performance metrics, and reliability.',
  },
  {
    href: '/knowledge-center/search',
    label: 'SEARCH',
    title: 'Knowledge Search',
    count: 'AI INDEXED',
    description: 'Search by symptom, equipment, industry, standard, system, or technology.',
  },
];

const KNOWLEDGE_LOGIC = [
  'Failure mechanism',
  'Contamination mode',
  'Standard reference',
  'Protection system',
  'Technology architecture',
  'Field decision',
];

const FEATURED_ARTICLES = ENGINEERING_ARTICLES.slice(0, 3);

export const metadata = {
  title: 'Knowledge Center | ELIMFILTERS',
  description:
    'ELIMFILTERS Knowledge Center for industrial filtration engineering, contamination control, standards, technologies, systems, and asset protection reference.',
};

export default function KnowledgeCenterPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ELIMFILTERS Knowledge Center',
    url: 'https://elimfilters.com/knowledge-center',
    description:
      'Engineering documentation for contamination control, filtration system design, and asset protection across industrial applications.',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://elimfilters.com/#organization',
      name: 'ELIMFILTERS',
    },
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/knowledge-center-hero.avif)' }} />
        <div style={heroOverlay} />

        <div style={heroInner}>
          <p style={eyebrow}>KNOWLEDGE CENTER</p>
          <h1 style={heroTitle}>
            Engineering
            <br />
            Intelligence Library
          </h1>
          <p style={heroLead}>
            ELIMFILTERS Knowledge Center organizes contamination control, filtration standards, protection systems, technologies, and industrial application logic into a technical reference platform.
          </p>

          <div style={tagRow}>
            {['STANDARDS', 'SYSTEMS', 'TECHNOLOGIES', 'FAILURE MODES', 'INDUSTRIES', 'AI SEARCH'].map((item) => (
              <span key={item} style={tag}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>TECHNICAL PURPOSE</p>
            <h2 style={sectionTitle}>Knowledge turns filtration into engineering decisions.</h2>
          </div>
          <div>
            <p style={leadText}>
              Industrial filtration is not only a catalogue problem. It is a contamination control problem tied to standards, failure mechanisms, operating exposure, and asset risk.
            </p>
            <p style={bodyText}>
              The Knowledge Center exists to support distributors, engineers, fleets, and AI systems with structured, citable, technical information.
            </p>
          </div>
        </div>
      </section>

      <section style={yellowSection}>
        <div style={wrap}>
          <p style={eyebrow}>KNOWLEDGE ARCHITECTURE</p>
          <h2 style={sectionTitle}>From failure mechanism to field decision.</h2>

          <div style={logicGrid}>
            {KNOWLEDGE_LOGIC.map((item, index) => (
              <div key={item} style={logicCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <strong style={logicText}>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={domainSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <p style={eyebrow}>KNOWLEDGE DOMAINS</p>
            <h2 style={sectionTitle}>Structured technical reference by domain.</h2>
          </div>

          <div style={domainGrid}>
            {SECTIONS.map((section, index) => (
              <Link key={section.href} href={section.href} style={domainCard}>
                <span style={domainNumber}>{String(index + 1).padStart(2, '0')}</span>
                <p style={domainLabel}>{section.label}</p>
                <h3 style={domainTitle}>{section.title}</h3>
                <p style={domainBody}>{section.description}</p>
                <span style={domainCount}>{section.count}</span>
                <span style={explore}>OPEN DOMAIN</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={featuredSection}>
        <div style={wrap}>
          <div style={splitHeader}>
            <div>
              <p style={eyebrow}>FEATURED ENGINEERING TOPICS</p>
              <h2 style={sectionTitle}>Start with core principles.</h2>
            </div>
            <Link href="/knowledge-center/engineering" style={yellowButton}>VIEW ALL ARTICLES</Link>
          </div>

          <div style={featuredGrid}>
            {FEATURED_ARTICLES.map((article, index) => (
              <Link key={article.slug} href={`/knowledge-center/engineering/${article.slug}`} style={featuredCard}>
                <span style={number}>{String(index + 1).padStart(2, '0')}</span>
                <p style={featuredMeta}>{article.category} / {article.readTime}</p>
                <h3 style={featuredTitle}>{article.title}</h3>
                <p style={featuredBody}>{article.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={standardsSection}>
        <div style={wrap}>
          <div style={splitHeader}>
            <div>
              <p style={eyebrow}>CORE STANDARDS</p>
              <h2 style={sectionTitle}>Technical references that anchor the platform.</h2>
            </div>
            <Link href="/knowledge-center/standards" style={darkButton}>ALL STANDARDS</Link>
          </div>

          <div style={standardsGrid}>
            {KC_STANDARDS.slice(0, 10).map((standard) => (
              <Link key={standard.slug} href={`/knowledge-center/standards/${standard.slug}`} style={standardCard}>
                <strong style={standardCode}>{standard.code}</strong>
                <span style={standardScope}>{standard.scope}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={searchCallout}>
        <div style={searchInner}>
          <div>
            <p style={eyebrow}>AI-INDEXED REFERENCE</p>
            <h2 style={{ ...sectionTitle, fontSize: 'clamp(2rem, 4vw, 4.2rem)' }}>
              Search knowledge by symptom, standard, system, or technology.
            </h2>
            <p style={{ ...bodyText, maxWidth: '760px', marginTop: '1.2rem' }}>
              Use Knowledge Search to connect field symptoms, equipment types, standards, and contamination modes to the right technical reference.
            </p>
          </div>
          <Link href="/knowledge-center/search" style={yellowButton}>SEARCH KNOWLEDGE</Link>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>TOTAL ASSET PROTECTION</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            The stronger the knowledge base, the stronger the protection decision.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/engineering/asset-protection" style={yellowButton}>ASSET PROTECTION</Link>
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
  position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.24,
};

const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 48%, rgba(0,0,0,0.38) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.22), transparent 36%)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };

const eyebrow: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.78rem',
  fontWeight: 700, letterSpacing: '0.28em', margin: '0 0 1rem',
};

const heroTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.92, fontSize: 'clamp(4rem, 9.5vw, 9.5rem)',
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
  fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 5.3rem)',
  lineHeight: 0.96, letterSpacing: '-0.045em', margin: 0, textTransform: 'uppercase',
};

const leadText: CSSProperties = {
  color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72, fontWeight: 600, margin: 0,
};

const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };

const yellowSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,241,45,0.04), rgba(255,241,45,0.01))',
  borderTop: '1px solid rgba(255,241,45,0.16)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };

const logicGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '0.8rem', marginTop: '2.4rem',
};

const logicCard: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.44)',
  padding: '1.2rem', minHeight: '140px',
};

const number: CSSProperties = {
  display: 'block', color: '#FFF12D', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.16em', marginBottom: '1rem',
};

const logicText: CSSProperties = { display: 'block', fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.2 };

const domainSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };

const domainGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem',
};

const domainCard: CSSProperties = {
  minHeight: '360px', textDecoration: 'none', color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)',
  padding: '1.25rem', display: 'flex', flexDirection: 'column',
};

const domainNumber: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.82rem', marginBottom: '1.4rem',
};

const domainLabel: CSSProperties = {
  color: 'rgba(255,241,45,0.82)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', margin: '0 0 0.7rem',
};

const domainTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 2.8vw, 3rem)',
  lineHeight: 0.96, letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase',
};

const domainBody: CSSProperties = {
  color: 'rgba(255,255,255,0.58)', lineHeight: 1.58,
  fontSize: '0.92rem', margin: '1rem 0 0',
};

const domainCount: CSSProperties = {
  color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.72rem', marginTop: '1rem',
};

const explore: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: 'auto',
};

const featuredSection: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const splitHeader: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  gap: '2rem', flexWrap: 'wrap', marginBottom: '2.4rem',
};

const featuredGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
};

const featuredCard: CSSProperties = {
  minHeight: '260px', textDecoration: 'none', color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.25rem', display: 'flex', flexDirection: 'column',
};

const featuredMeta: CSSProperties = {
  color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)',
  fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.68rem',
};

const featuredTitle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.35rem',
  lineHeight: 1.05, margin: '0.7rem 0 0', letterSpacing: '-0.03em',
};

const featuredBody: CSSProperties = {
  color: 'rgba(255,255,255,0.58)', lineHeight: 1.58,
  fontSize: '0.9rem', margin: '1rem 0 0',
};

const standardsSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const standardsGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '0.7rem',
};

const standardCard: CSSProperties = {
  display: 'flex', gap: '1rem', alignItems: 'flex-start',
  textDecoration: 'none', color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)',
  padding: '1rem',
};

const standardCode: CSSProperties = {
  color: '#FFF12D', fontFamily: 'var(--font-display)',
  fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap',
};

const standardScope: CSSProperties = {
  color: 'rgba(255,255,255,0.58)', fontSize: '0.82rem', lineHeight: 1.45,
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
