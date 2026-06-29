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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sys.name,
    brand: { '@type': 'Brand', name: 'ELIMFILTERS' },
    description: sys.overview,
    url: `${BASE_URL}/systems/${sys.slug}`,
    category: 'Industrial Filtration Protection System',
    manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS', url: BASE_URL },
  };

  const label: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.62rem',
    letterSpacing: '0.22em',
    color: '#FFF12D',
    textTransform: 'uppercase' as const,
    marginBottom: '1rem',
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
    lineHeight: 1.2,
    marginBottom: '1rem',
  };

  const prose: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.85,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

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
        <header style={{ position: 'relative', height: 'clamp(300px, 45vh, 520px)', overflow: 'hidden' }}>
          <img
            src={sys.heroImage}
            alt={sys.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, transparent 100%)' }} />
          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={label}>// PROTECTION SYSTEM</p>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.025em', maxWidth: '620px', marginBottom: '1rem' }}>
              {sys.name}
            </h1>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.6)', maxWidth: '540px', lineHeight: 1.65 }}>
              {sys.tagline}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' as const }}>
              {sys.hdPrefix && (
                <span style={{ background: 'rgba(255,241,45,0.12)', border: '1px solid rgba(255,241,45,0.3)', borderRadius: '3px', padding: '0.3rem 0.75rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D' }}>
                  HD: {sys.hdPrefix}XXXX
                </span>
              )}
              {sys.ldPrefix && (
                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px', padding: '0.3rem 0.75rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
                  LD: {sys.ldPrefix}XXXX
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        <section style={section}>
          <p style={label}>// OVERVIEW</p>
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
          <p style={label}>// TECHNOLOGY CENTER</p>
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
          <p style={label}>// PRODUCT FAMILIES</p>
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
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
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

        {/* ── Products ─────────────────────────────────────────────────── */}
        <section style={section}>
          <p style={label}>// PRODUCTS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {sys.hdPrefix && (
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.15em', color: '#FFF12D', marginBottom: '0.5rem' }}>
                  HEAVY DUTY — {sys.hdPrefix}XXXX
                </p>
                <Link href={`/products?system=${sys.slug}&duty=HD`} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                  Browse HD Products →
                </Link>
              </div>
            )}
            {sys.ldPrefix && (
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  LIGHT DUTY — {sys.ldPrefix}XXXX
                </p>
                <Link href={`/products?system=${sys.slug}&duty=LD`} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  Browse LD Products →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Standards ────────────────────────────────────────────────── */}
        <section style={section}>
          <p style={label}>// ENGINEERING STANDARDS</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            {sys.relatedStandards.map((std) => (
              <span
                key={std}
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '3px',
                  padding: '0.35rem 0.85rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {std}
              </span>
            ))}
          </div>
        </section>

        {/* ── Related Industries ───────────────────────────────────────── */}
        <section style={section}>
          <p style={label}>// RELATED INDUSTRIES</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            {sys.relatedIndustries.map((ind) => (
              <Link
                key={ind}
                href={`/industries/${ind}`}
                style={{
                  border: '1px solid rgba(255,241,45,0.2)',
                  borderRadius: '3px',
                  padding: '0.35rem 0.85rem',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.7)',
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
          <p style={label}>// EXPLORE FURTHER</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { href: '/technologies', label: 'All Technologies' },
              { href: '/knowledge-system', label: 'Knowledge Center' },
              { href: '/products', label: 'Product Registry' },
              { href: '/systems', label: 'All Protection Systems' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  padding: '1rem 1.25rem',
                  textDecoration: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.6)',
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
