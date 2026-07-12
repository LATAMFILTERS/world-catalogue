import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  PROTECTION_SYSTEM_LIST,
  getProtectionSystemBySlug,
} from '@/lib/protection-systems-data';
import { getFamiliesByProtectionSystem } from '@/lib/product-families-data';

const BASE_URL = 'https://elimfilters.com';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return PROTECTION_SYSTEM_LIST.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sys = getProtectionSystemBySlug(params.slug);
  if (!sys) return { title: 'Not Found' };
  const url = `${BASE_URL}/systems/${sys.slug}`;
  const title = `${sys.name} | ELIMFILTERS`;
  return {
    title,
    description: sys.tagline,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: sys.tagline,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
      images: [{ url: `${BASE_URL}${sys.heroImage}`, width: 1200, height: 630, alt: sys.name }],
    },
    twitter: { card: 'summary_large_image', title, description: sys.tagline },
  };
}

export default function ProtectionSystemPage({ params }: Props) {
  const sys = getProtectionSystemBySlug(params.slug);
  if (!sys) notFound();

  const families = getFamiliesByProtectionSystem(sys.slug);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems` },
      { '@type': 'ListItem', position: 3, name: sys.name, item: `${BASE_URL}/systems/${sys.slug}` },
    ],
  };

  // Protection systems (Air Intake, Fuel Cleanliness, Hydraulic, etc.) are integrated
  // contamination control solutions — not standalone purchasable products. Each system
  // is a combination of product families, technologies, and protocols that ELIMFILTERS
  // provides as an engineered service offering for a specific fluid domain.
  // `Service` correctly represents this: it has a provider, a service type, and an
  // area served. `Product` would require offer/pricing data and misrepresent these
  // as discrete SKUs. Consistent with how /industries/[slug] schemas are structured.
  const systemSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE_URL}/systems/${sys.slug}#service`,
    name: sys.name,
    description: sys.overview,
    url: `${BASE_URL}/systems/${sys.slug}`,
    serviceType: 'Industrial Asset Protection',
    provider: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    areaServed: 'Worldwide',
    category: 'Industrial Filtration',
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
    lineHeight: 1.2,
    textAlign: 'justify',
    marginBottom: '1rem',
  };

  const prose: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.85,
    textAlign: 'justify',
  };

  const section: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(systemSchema) }} />

      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem clamp(1.5rem, 5vw, 4rem) 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/systems', label: 'Systems' },
            { label: sys.name },
          ].map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {crumb.href ? (
                <Link href={crumb.href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D' }}>
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>/</span>}
            </span>
          ))}
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header style={{ position: 'relative', height: 'clamp(480px, 62vh, 680px)', overflow: 'hidden' }}>
          <img
            src={sys.heroImage}
            alt={sys.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', opacity: 0.45 }}
          />
          {/* gradient darkens engine/filter area (left-center) where text sits */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.25) 65%, transparent 100%)' }} />
          {/* text block anchored to bottom-left — over the filter housing area */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem) clamp(2.5rem, 4vw, 3.5rem)' }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.025em', maxWidth: '55%', marginBottom: '0.75rem' }}>
                {sys.name}
              </h1>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.9rem, 1.3vw, 1rem)', color: '#FFF12D', maxWidth: '48%', lineHeight: 1.6 }}>
                {sys.tagline}
              </p>
            </div>
          </div>
        </header>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        <section style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <p style={prose}>{sys.overview}</p>
            <div>
              <h2 style={{ ...h2Style, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: '0.75rem' }}>
                Engineering Principle
              </h2>
              <p style={prose}>{sys.engineeringPrinciple}</p>
            </div>
          </div>
        </section>

        {/* ── Technology Center ────────────────────────────────────────── */}
        <section style={section}>
          <h2 style={h2Style}>Primary Technologies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
            {sys.primaryTechnologies.map((slug) => (
              <Link
                key={slug}
                href={`/technologies/${slug}`}
                style={{ textDecoration: 'none', background: '#000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'background 0.2s' }}
              >
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', color: '#FFF12D', textTransform: 'uppercase' }}>Primary</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                  {slug.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>View Technology →</p>
              </Link>
            ))}
            {sys.supportingTechnologies.map((slug) => (
              <Link
                key={slug}
                href={`/technologies/${slug}`}
                style={{ textDecoration: 'none', background: '#000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Supporting</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1rem', color: 'rgba(255,255,255,0.75)' }}>
                  {slug.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>View Technology →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Product Families ─────────────────────────────────────────── */}
        <section style={section}>
          <h2 style={h2Style}>Product Families</h2>
          {families.length === 0 ? (
            <p style={prose}>DOCUMENTATION PENDING</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {families.map((fam) => (
                <Link
                  key={fam.key}
                  href={`/families/${fam.slug}`}
                  style={{ textDecoration: 'none', background: '#000', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                    {fam.hdPrefix && (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.1em', color: '#FFF12D', background: 'rgba(255,241,45,0.08)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>
                        HD
                      </span>
                    )}
                    {fam.ldPrefix && (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>
                        LD
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{fam.name}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, textAlign: 'justify' }}>
                    {fam.purpose.slice(0, 100)}…
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    View Family →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Standards ────────────────────────────────────────────────── */}
        <section style={section}>
          <h2 style={h2Style}>Applicable Standards</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginTop: '0.5rem' }}>
            {sys.relatedStandards.map((std) => (
              <span
                key={std}
                style={{
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '0.45rem 1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                {std}
              </span>
            ))}
          </div>
        </section>

        {/* ── Related Industries ───────────────────────────────────────── */}
        <section style={section}>
          <h2 style={h2Style}>Industries Served</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginTop: '0.5rem' }}>
            {sys.relatedIndustries.map((ind) => (
              <Link
                key={ind}
                href={`/industries/${ind}`}
                style={{
                  border: '1px solid rgba(255,241,45,0.25)',
                  padding: '0.45rem 1rem',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  textTransform: 'capitalize' as const,
                }}
              >
                {ind.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Cross-links ──────────────────────────────────────────────── */}
        <section style={{ ...section, borderBottom: 'none' }}>
          <h2 style={h2Style}>Explore Further</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', marginTop: '0.5rem' }}>
            {[
              { href: '/technologies', label: 'All Technologies' },
              { href: '/knowledge-system', label: 'Knowledge Center' },
              { href: 'https://part-search.elimfilters.com', label: 'Part Search' },
              { href: '/systems', label: 'All Protection Systems' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  background: '#000',
                  padding: '1.25rem 1.5rem',
                  textDecoration: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
