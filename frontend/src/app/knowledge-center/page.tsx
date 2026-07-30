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

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

const SECTIONS = [
  { href: '/knowledge-center/engineering', label: 'Engineering', title: 'Engineering Principles', count: `${ENGINEERING_ARTICLES.length} Articles`, description: 'Filtration theory, media science, airflow, fluid cleanliness, and contamination control fundamentals.' },
  { href: '/knowledge-center/standards', label: 'Standards', title: 'Industry Standards', count: `${KC_STANDARDS.length} Standards`, description: 'ISO, ASTM, SAE, and NAS references explained for testing, validation, and technical selection.' },
  { href: '/knowledge-center/systems', label: 'Systems', title: 'Protection Systems', count: `${KC_SYSTEMS.length} Systems`, description: 'Air, fuel, lube, hydraulic, cooling, cabin, and compressed air protection domains.' },
  { href: '/knowledge-center/industries', label: 'Industries', title: 'Industry Applications', count: `${KC_INDUSTRIES.length} Industries`, description: 'Contamination profiles, operating exposure, and filtration risk by industrial market.' },
  { href: '/knowledge-center/technologies', label: 'Technologies', title: 'Technology Registry', count: `${KC_TECHNOLOGIES.length} Technologies`, description: 'ELIMFILTERS proprietary protection architectures mapped to failure mechanisms.' },
  { href: '/knowledge-center/technical-library', label: 'Library', title: 'Technical Library', count: 'Field Guides', description: 'Specification guides, selection frameworks, procedures, and technical references.' },
  { href: '/knowledge-center/engineering-reference', label: 'Reference', title: 'Engineering Reference Library', count: `${ERL_SECTIONS.length} Sections`, description: 'Structured reference library for standards, filtration science, performance metrics, and reliability.' },
  { href: '/knowledge-center/search', label: 'Search', title: 'Knowledge Search', count: 'AI Indexed', description: 'Search by symptom, equipment, industry, standard, system, or technology.' },
];

const VALIDATED_REFERENCES = [
  { value: 'ISO 4406', body: 'Hydraulic fluid cleanliness is classified using solid-particle contamination codes.', source: 'ISO 4406:2021' },
  { value: 'ISO 16889', body: 'Hydraulic filter element performance is evaluated through multi-pass testing.', source: 'ISO 16889 Multi-Pass Test' },
  { value: 'B10(c) >= 200', body: 'Beta 200 corresponds to approximately 99.5% efficiency at the rated particle size.', source: 'Beta Ratio Formula' },
  { value: 'PARTICLE CONTROL', body: 'Cleaner hydraulic fluid reduces abrasive wear, valve sticking, pump damage, and reliability loss.', source: 'Hydraulic Contamination Control' },
];

const FEATURED_ARTICLES = ENGINEERING_ARTICLES.slice(0, 3);

export const metadata = {
  title: 'Knowledge Center',
  description: 'ELIMFILTERS Knowledge Center for industrial filtration engineering, contamination control, standards, technologies, systems, and asset protection reference.',
  openGraph: {
    title: 'Knowledge Center | ELIMFILTERS',
    description: 'ELIMFILTERS Knowledge Center for industrial filtration engineering, contamination control, standards, technologies, systems, and asset protection reference.',
    url: 'https://elimfilters.com/knowledge-center/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/images/knowledge-center-hero.avif', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knowledge Center | ELIMFILTERS',
    description: 'ELIMFILTERS Knowledge Center for industrial filtration engineering, contamination control, standards, technologies, systems, and asset protection reference.',
    images: ['https://elimfilters.com/images/knowledge-center-hero.avif'],
  },
};

export default function KnowledgeCenterPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ELIMFILTERS Knowledge Center',
    url: 'https://elimfilters.com/knowledge-center',
    description: 'Engineering documentation for contamination control, filtration system design, and asset protection across industrial applications.',
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
  };

  return (
    <main style={main}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/knowledge-center-hero.avif)' }} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <h1 style={heroTitle}>Engineering<br /><span style={{ color: '#FFF12D' }}>Intelligence Library</span></h1>
          <p style={heroLead}>ELIMFILTERS organizes contamination control, filtration standards, protection systems, proprietary technologies, and industrial application logic into a technical reference platform.</p>
          <div style={tagRow}>{['STANDARDS', 'SYSTEMS', 'TECHNOLOGIES', 'FAILURE MODES', 'INDUSTRIES', 'AI SEARCH'].map((item) => <span key={item} style={tag}>{item}</span>)}</div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div><h2 style={sectionTitle}>Knowledge turns filtration into engineering decisions.</h2></div>
          <div>
            <p style={leadText}>Industrial filtration is not only a catalogue problem. It is a contamination control problem tied to standards, failure mechanisms, operating exposure, and asset risk.</p>
            <p style={bodyText}>The Knowledge Center supports distributors, engineers, fleets, and AI systems with structured, citable, technical information.</p>
          </div>
        </div>
      </section>

      <section style={validatedSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Validated hydraulic contamination references.</h2>
          <div style={validatedGrid}>
            {VALIDATED_REFERENCES.map((item) => (
              <div key={item.value} style={validatedCard}>
                <strong style={validatedValue}>{item.value}</strong>
                <p style={validatedBody}>{item.body}</p>
                <span style={validatedSource}>{item.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={domainSection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}><h2 style={sectionTitle}>Structured technical reference by domain.</h2></div>
          <div style={domainGrid}>
            {SECTIONS.map((section) => (
              <Link key={section.href} href={section.href} style={domainCard}>
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
          <div style={splitHeader}><div><h2 style={sectionTitle}>Start with core principles.</h2></div><Link href="/knowledge-center/engineering" style={yellowButton}>VIEW ALL ARTICLES</Link></div>
          <div style={featuredGrid}>
            {FEATURED_ARTICLES.map((article) => (
              <Link key={article.slug} href={`/knowledge-center/engineering/${article.slug}`} style={featuredCard}>
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
          <div style={splitHeader}><div><h2 style={sectionTitle}>Technical references that anchor the platform.</h2></div><Link href="/knowledge-center/standards" style={darkButton}>ALL STANDARDS</Link></div>
          <div style={standardsGrid}>{KC_STANDARDS.slice(0, 10).map((standard) => <Link key={standard.slug} href={`/knowledge-center/standards/${standard.slug}`} style={standardCard}><strong style={standardCode}>{standard.code}</strong><span style={standardScope}>{standard.scope}</span></Link>)}</div>
        </div>
      </section>

      <section style={searchCallout}>
        <div style={searchInner}>
          <div><h2 style={sectionTitle}>Search knowledge by symptom, standard, system, or technology.</h2><p style={{ ...bodyText, maxWidth: '760px', marginTop: '1.2rem' }}>Use Knowledge Search to connect field symptoms, equipment types, standards, and contamination modes to the right technical reference.</p></div>
          <Link href="/knowledge-center/search" style={yellowButton}>SEARCH KNOWLEDGE</Link>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>The stronger the knowledge base, the stronger the protection decision.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}><Link href="/engineering/asset-protection" style={yellowButton}>ASSET PROTECTION</Link><Link href="/contact" style={darkButton}>CONTACT ELIMFILTERS</Link></div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const homeButton: CSSProperties = { position: 'fixed', top: '5.35rem', right: '1.35rem', zIndex: 120, background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(255,241,45,0.45)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem', padding: '0.75rem 1.05rem', backdropFilter: 'blur(14px)' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.12) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.24), transparent 36%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)', maxWidth: '1120px', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { marginTop: '2rem', maxWidth: '800px', color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600 };
const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };
const tag: CSSProperties = { border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', fontFamily: displayFont, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.72)' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };
const validatedSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'linear-gradient(180deg, rgba(255,241,45,0.04), rgba(255,255,255,0.01))', borderTop: '1px solid rgba(255,241,45,0.26)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const validatedGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '2.4rem' };
const validatedCard: CSSProperties = { minHeight: '220px', border: '1px solid rgba(255,241,45,0.24)', background: 'rgba(255,241,45,0.03)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const validatedValue: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: 'clamp(1.3rem, 2.2vw, 2rem)', letterSpacing: '0.08em' };
const validatedBody: CSSProperties = { color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: '1rem 0' };
const validatedSource: CSSProperties = { color: 'rgba(255,255,255,0.38)', fontFamily: displayFont, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' };
const domainSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };
const domainGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' };
const domainCard: CSSProperties = { minHeight: '320px', padding: '1.35rem', border: '1px solid rgba(255,255,255,0.1)', background: '#050505', color: '#fff', textDecoration: 'none', display: 'flex', flexDirection: 'column' };
const domainLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 };
const domainTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.35rem, 2vw, 1.9rem)', lineHeight: 1.02, margin: '1rem 0 0', textTransform: 'uppercase' };
const domainBody: CSSProperties = { color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, margin: '1rem 0 0' };
const domainCount: CSSProperties = { marginTop: 'auto', color: 'rgba(255,255,255,0.45)', fontFamily: displayFont, fontSize: '0.72rem', letterSpacing: '0.12em', paddingTop: '1rem' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: '1rem' };
const featuredSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'rgba(255,255,255,0.02)' };
const splitHeader: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'end', marginBottom: '2.2rem', flexWrap: 'wrap' };
const featuredGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' };
const featuredCard: CSSProperties = { minHeight: '260px', padding: '1.35rem', border: '1px solid rgba(255,255,255,0.1)', background: '#030303', textDecoration: 'none', color: '#fff' };
const featuredMeta: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 };
const featuredTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.35rem, 2vw, 1.9rem)', lineHeight: 1.02, margin: '1rem 0', textTransform: 'uppercase' };
const featuredBody: CSSProperties = { color: 'rgba(255,255,255,0.58)', lineHeight: 1.65 };
const standardsSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const standardsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.8rem' };
const standardCard: CSSProperties = { minHeight: '150px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', padding: '1rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const standardCode: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '1.1rem', letterSpacing: '0.08em' };
const standardScope: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '0.9rem', lineHeight: 1.5 };
const searchCallout: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(90deg, rgba(255,241,45,0.12), transparent)' };
const searchInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)', textTransform: 'uppercase' };
