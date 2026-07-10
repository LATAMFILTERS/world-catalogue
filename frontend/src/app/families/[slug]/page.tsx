import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCT_FAMILY_LIST, getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';
const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return PRODUCT_FAMILY_LIST.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fam = getFamilyBySlug(params.slug);
  if (!fam) return { title: 'Not Found' };

  const url = `${BASE_URL}/families/${fam.slug}`;
  const title = `${fam.name} | ELIMFILTERS Product Family`;

  return {
    title,
    description: fam.purpose,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: fam.purpose,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
    },
    twitter: { card: 'summary', title, description: fam.purpose },
  };
}

function standardHref(std: string) {
  const key = std.toLowerCase();
  if (key.includes('iso 16889')) return '/knowledge-system/standards/iso-16889';
  if (key.includes('iso 4406')) return '/knowledge-system/standards/iso-4406';
  if (key.includes('iso 5011')) return '/knowledge-system/standards/iso-5011';
  return '/knowledge-system/standards';
}

export default function FamilyPage({ params }: Props) {
  const fam = getFamilyBySlug(params.slug);
  if (!fam) notFound();

  const sys = getProtectionSystemBySlug(fam.protectionSystem);
  const hasHdProducts = fam.hdPrefix && fam.hdProducts.length > 0 && fam.hdProducts[0] !== 'DOCUMENTATION PENDING';
  const hasLdProducts = fam.ldPrefix && fam.ldProducts.length > 0 && fam.ldProducts[0] !== 'DOCUMENTATION PENDING';

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Families', item: `${BASE_URL}/families` },
      { '@type': 'ListItem', position: 3, name: fam.name, item: `${BASE_URL}/families/${fam.slug}` },
    ],
  };

  const productGroupSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${BASE_URL}/families/${fam.slug}#productgroup`,
    name: fam.name,
    description: fam.purpose,
    url: `${BASE_URL}/families/${fam.slug}`,
    brand: { '@type': 'Brand', name: 'ELIMFILTERS' },
    manufacturer: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
    category: 'Industrial Filtration',
    variesBy: ['Duty Class'],
    hasVariant: [
      ...(fam.hdPrefix ? [{
        '@type': 'Product',
        '@id': `${BASE_URL}/families/${fam.slug}#variant-hd`,
        name: `${fam.name} - Heavy Duty (HD)`,
        description: `Heavy Duty ${fam.name} series. SKU prefix: ${fam.hdPrefix}.`,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
          url: 'https://part-search.elimfilters.com',
          seller: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
        },
      }] : []),
      ...(fam.ldPrefix ? [{
        '@type': 'Product',
        '@id': `${BASE_URL}/families/${fam.slug}#variant-ld`,
        name: `${fam.name} - Light Duty (LD)`,
        description: `Light Duty ${fam.name} series. SKU prefix: ${fam.ldPrefix}.`,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
          url: 'https://part-search.elimfilters.com',
          seller: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
        },
      }] : []),
    ],
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupSchema) }} />

      <Link href="/families" style={homeButton}>FAMILIES</Link>

      <header style={hero}>
        <img src={fam.heroImage} alt={fam.name} fetchPriority="high" style={heroImage} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <h1 style={heroTitle}>{fam.name}</h1>
          <p style={heroLead}>{fam.purpose}</p>
          <div style={tagRow}>
            {fam.hdPrefix && <span style={tag}>HD PREFIX {fam.hdPrefix}</span>}
            {fam.ldPrefix && <span style={tag}>LD PREFIX {fam.ldPrefix}</span>}
            {sys && <Link href={`/systems/${sys.slug}`} style={tagLink}>{sys.name}</Link>}
          </div>
        </div>
      </header>

      <section style={section}>
        <div style={twoCol}>
          <h2 style={sectionTitle}>Family engineering role.</h2>
          <div>
            <p style={leadText}>{fam.engineering}</p>
            {fam.construction !== 'DOCUMENTATION PENDING' && (
              <p style={bodyText}>{fam.construction}</p>
            )}
          </div>
        </div>
      </section>

      <section style={darkSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Technical anchors.</h2>
          <div style={anchorGrid}>
            {sys && (
              <Link href={`/systems/${sys.slug}`} style={anchorCard}>
                <span style={anchorLabel}>Protection System</span>
                <strong style={anchorTitle}>{sys.name}</strong>
                <span style={explore}>VIEW SYSTEM</span>
              </Link>
            )}
            <Link href={`/technologies/${fam.primaryTechnology}`} style={anchorCardYellow}>
              <span style={anchorLabel}>Primary Technology</span>
              <strong style={anchorTitle}>{fam.primaryTechnology.replace(/-/g, ' ')}</strong>
              <span style={explore}>VIEW TECHNOLOGY</span>
            </Link>
            <Link href="https://part-search.elimfilters.com" style={anchorCard}>
              <span style={anchorLabel}>Part Identification</span>
              <strong style={anchorTitle}>Cross-reference search</strong>
              <span style={explore}>FIND MY FILTER</span>
            </Link>
          </div>
        </div>
      </section>

      {(hasHdProducts || hasLdProducts) && (
        <section style={section}>
          <div style={wrap}>
            <h2 style={sectionTitle}>Product references.</h2>
            <div style={productGrid}>
              {hasHdProducts && (
                <div style={productCard}>
                  <h3 style={cardTitle}>Heavy Duty Series</h3>
                  <div style={productList}>
                    {fam.hdProducts.map((pn) => (
                      <Link key={pn} href={`/products/${pn.toLowerCase()}`} style={productLink}>{pn}</Link>
                    ))}
                  </div>
                </div>
              )}
              {hasLdProducts && (
                <div style={productCard}>
                  <h3 style={cardTitle}>Light Duty Series</h3>
                  <div style={productList}>
                    {fam.ldProducts.map((pn) => (
                      <Link key={pn} href={`/products/${pn.toLowerCase()}`} style={productLink}>{pn}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section style={darkSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Applicable standards.</h2>
          <div style={standardsGrid}>
            {fam.applicableStandards.map((std) => (
              <Link key={std} href={standardHref(std)} style={standardCard}>{std}</Link>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionLast}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Continue through the platform.</h2>
          <div style={anchorGrid}>
            <Link href="/families" style={anchorCard}>All Product Families<span style={explore}>OPEN</span></Link>
            <Link href="/systems" style={anchorCard}>Protection Systems<span style={explore}>OPEN</span></Link>
            <Link href="/technologies" style={anchorCard}>Technologies<span style={explore}>OPEN</span></Link>
            <Link href="/knowledge-system" style={anchorCard}>Knowledge System<span style={explore}>OPEN</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };

const homeButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 50,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont,
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
  padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};

const hero: CSSProperties = {
  minHeight: '88vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 };
const heroOverlay: CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.76) 50%, rgba(0,0,0,0.34) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.22), transparent 36%)',
};
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};
const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '860px', color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600,
  borderLeft: '3px solid #FFF12D', paddingLeft: '1.35rem',
};
const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };
const tag: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.16)', padding: '0.75rem 1rem',
  fontFamily: displayFont, fontSize: '0.72rem', letterSpacing: '0.14em', fontWeight: 700,
  color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase',
};
const tagLink: CSSProperties = { ...tag, color: '#FFF12D', textDecoration: 'none', borderColor: 'rgba(255,241,45,0.34)' };

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const darkSection: CSSProperties = { ...section, background: 'rgba(255,255,255,0.018)' };
const sectionLast: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const twoCol: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)',
};
const sectionTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700,
};
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78, marginTop: '1.2rem' };

const anchorGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '2.4rem' };
const anchorCard: CSSProperties = {
  minHeight: '190px', textDecoration: 'none', color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)',
  padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase',
};
const anchorCardYellow: CSSProperties = { ...anchorCard, borderColor: 'rgba(255,241,45,0.22)', background: 'rgba(255,241,45,0.045)' };
const anchorLabel: CSSProperties = { color: 'rgba(255,255,255,0.38)', fontFamily: displayFont, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase' };
const anchorTitle: CSSProperties = { color: '#fff', fontFamily: displayFont, fontSize: 'clamp(1.2rem, 2vw, 1.7rem)', lineHeight: 1.02, textTransform: 'uppercase' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.72rem', textTransform: 'uppercase' };

const productGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '2.4rem' };
const productCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.55)', padding: '1.35rem' };
const cardTitle: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: '1.25rem', lineHeight: 1.05, margin: '0 0 1.2rem', textTransform: 'uppercase' };
const productList: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' };
const productLink: CSSProperties = { color: '#FFF12D', textDecoration: 'none', border: '1px solid rgba(255,241,45,0.24)', padding: '0.7rem 0.9rem', fontFamily: displayFont, fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: 700 };

const standardsGrid: CSSProperties = { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '2rem' };
const standardCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.16)', padding: '0.8rem 1rem', fontFamily: displayFont, fontSize: '0.78rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.78)', textDecoration: 'none', textTransform: 'uppercase' };
