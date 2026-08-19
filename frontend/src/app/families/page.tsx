import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCT_FAMILY_LIST } from '@/lib/product-families-data';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';
const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

export const metadata: Metadata = {
  title: 'Industrial Filter Product Families & Protection Systems | ELIMFILTERS',
  description:
    'Browse ELIMFILTERS product families organized by system, duty class, and application. Find the right filtration products for your asset protection strategy.',
  alternates: { canonical: `${BASE_URL}/families/` },
};

export default function FamiliesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/families/#collection`,
    name: 'ELIMFILTERS Product Families',
    url: `${BASE_URL}/families/`,
    description: 'Industrial filtration product families organized by Protection System and Duty Class.',
    publisher: { '@id': `${BASE_URL}/#organization` },
    hasPart: PRODUCT_FAMILY_LIST.map((family) => ({
      '@type': 'WebPage',
      name: family.name,
      url: `${BASE_URL}/families/${family.slug}/`,
      description: family.purpose.slice(0, 160),
    })),
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/products/" style={backButton}>← PRODUCTS</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/families-hero.avif)' }} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <h1 style={heroTitle}>
            Product Families
            <br />
            <span style={{ color: '#FFF12D' }}>Built By System Logic</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS product families organize filtration products by protection system, duty class, application role, and contamination control purpose.
          </p>
          <div style={tagRow}>
            {['HD', 'LD', 'AIR', 'FUEL', 'LUBE', 'HYDRAULIC', 'COOLING'].map((item) => (
              <span key={item} style={tag}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <h2 style={sectionTitle}>Part numbers need structure before they can scale.</h2>
          <div>
            <p style={leadText}>
              A product family groups parts by the system they protect, the duty class they serve, and the application environment they are built for.
            </p>
            <p style={bodyText}>
              This gives distributors, fleets, and technical users a cleaner path from protection system to product selection without reducing ELIMFILTERS to a commodity filter list.
            </p>
          </div>
        </div>
      </section>

      <section style={familySection}>
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <h2 style={sectionTitle}>Organized by protection system.</h2>
          </div>

          <div style={systemStack}>
            {PROTECTION_SYSTEM_LIST.map((system) => {
              const families = PRODUCT_FAMILY_LIST.filter((family) => family.protectionSystem === system.slug);
              if (families.length === 0) return null;

              return (
                <section key={system.key} style={systemBlock}>
                  <div style={systemHeader}>
                    <Link href={`/systems/${system.slug}/`} style={systemLink}>{system.name}</Link>
                    <span style={systemCount}>{families.length} FAMILIES</span>
                  </div>

                  <div style={familyGrid}>
                    {families.map((family) => (
                      <Link key={family.key} href={`/families/${family.slug}/`} style={familyCard}>
                        <div style={badges}>
                          {family.hdPrefix && <span style={badgeYellow}>HD {family.hdPrefix}</span>}
                          {family.ldPrefix && <span style={badgeDark}>LD {family.ldPrefix}</span>}
                        </div>
                        <h3 style={familyTitle}>{family.name}</h3>
                        <p style={familyBody}>{family.purpose.slice(0, 150)}...</p>
                        <span style={explore}>VIEW FAMILY</span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Product families connect technical architecture to real field applications.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/systems/" style={yellowButton}>EXPLORE SYSTEMS</Link>
            <Link href="/technologies/" style={darkButton}>EXPLORE TECHNOLOGIES</Link>
            <Link href="/contact/" style={darkButton}>CONTACT ELIMFILTERS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const backButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', left: '1.35rem', zIndex: 50,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont,
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem', padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};
const hero: CSSProperties = {
  minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)',
};
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 };
const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.12) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
};
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.88,
  fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)', maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};
const heroLead: CSSProperties = { marginTop: '2rem', maxWidth: '820px', color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600 };
const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };
const tag: CSSProperties = { border: '1px solid rgba(255,255,255,0.18)', padding: '0.82rem 1rem', fontFamily: displayFont, fontSize: '0.74rem', letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.88)' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78, marginTop: '1.2rem' };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };
const familySection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)' };
const systemStack: CSSProperties = { display: 'grid', gap: '3rem' };
const systemBlock: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' };
const systemHeader: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' };
const systemLink: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase' };
const systemCount: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.74rem' };
const familyGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' };
const familyCard: CSSProperties = { minHeight: '300px', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.025)', padding: '1.2rem', display: 'flex', flexDirection: 'column' };
const badges: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.2rem' };
const badgeYellow: CSSProperties = { color: '#000', background: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.62rem', padding: '0.3rem 0.5rem' };
const badgeDark: CSSProperties = { color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.18)', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.62rem', padding: '0.3rem 0.5rem' };
const familyTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.45rem', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase' };
const familyBody: CSSProperties = { color: 'rgba(255,255,255,0.58)', lineHeight: 1.58, fontSize: '0.92rem', margin: '1rem 0 0' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem', marginTop: 'auto', textTransform: 'uppercase' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)', textTransform: 'uppercase' };
