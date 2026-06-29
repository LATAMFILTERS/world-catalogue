import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCT_FAMILY_LIST, getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';

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

export default function FamilyPage({ params }: Props) {
  const fam = getFamilyBySlug(params.slug);
  if (!fam) notFound();

  const sys = getProtectionSystemBySlug(fam.protectionSystem);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Families', item: `${BASE_URL}/families` },
      { '@type': 'ListItem', position: 3, name: fam.name, item: `${BASE_URL}/families/${fam.slug}` },
    ],
  };

  const label: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.22em', color: '#FFF12D', textTransform: 'uppercase' as const, marginBottom: '1rem' };
  const h2Style: React.CSSProperties = { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', lineHeight: 1.2, marginBottom: '1rem' };
  const prose: React.CSSProperties = { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.9rem, 1.3vw, 1rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 };
  const section: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        
        {/* Breadcrumb */}
        <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem clamp(1.5rem, 5vw, 4rem) 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/families', label: 'Families' },
            { label: fam.name },
          ].map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {crumb.href ? (
                <Link href={crumb.href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{crumb.label}</Link>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D' }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>/</span>}
            </span>
          ))}
        </nav>

        {/* Hero */}
        <header style={{ position: 'relative', height: 'clamp(280px, 40vh, 480px)', overflow: 'hidden' }}>
          <img src={fam.heroImage} alt={fam.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, transparent 100%)' }} />
          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={label}>// PRODUCT FAMILY CENTER</p>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.025em', maxWidth: '620px', marginBottom: '1rem' }}>
              {fam.name}
            </h1>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' as const }}>
              {fam.hdPrefix && <span style={{ background: 'rgba(255,241,45,0.12)', border: '1px solid rgba(255,241,45,0.3)', borderRadius: '3px', padding: '0.3rem 0.75rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D' }}>HD: {fam.hdPrefix}XXXX</span>}
              {fam.ldPrefix && <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px', padding: '0.3rem 0.75rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>LD: {fam.ldPrefix}XXXX</span>}
            </div>
          </div>
        </header>

        {/* Overview & Engineering */}
        <section style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div>
              <p style={label}>// PURPOSE</p>
              <p style={prose}>{fam.purpose}</p>
            </div>
            <div>
              <p style={label}>// ENGINEERING</p>
              <p style={prose}>{fam.engineering}</p>
            </div>
            <div>
              <p style={label}>// CONSTRUCTION</p>
              <p style={{ ...prose, ...(fam.construction === 'DOCUMENTATION PENDING' ? { color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.1em' } : {}) }}>
                {fam.construction}
              </p>
            </div>
          </div>
        </section>

        {/* Protection System & Tech Anchor */}
        <section style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {sys && (
              <div>
                <p style={label}>// PROTECTION SYSTEM</p>
                <Link href={`/systems/${sys.slug}`} style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '4px' }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{sys.name}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>View System →</p>
                </Link>
              </div>
            )}
            <div>
              <p style={label}>// ANCHOR TECHNOLOGY</p>
              <Link href={`/technologies/${fam.primaryTechnology}`} style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.1)', padding: '1.5rem', borderRadius: '4px' }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{fam.primaryTechnology.replace(/-/g, ' ')}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>View Technology →</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Products */}
        <section style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            {fam.hdPrefix && (
              <div>
                <p style={label}>// HEAVY DUTY PRODUCTS</p>
                {fam.hdProducts.length > 0 && fam.hdProducts[0] !== 'DOCUMENTATION PENDING' ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {fam.hdProducts.map(pn => (
                      <li key={pn}><Link href={`/products/${pn.toLowerCase()}`} style={{ color: '#fff', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>{pn}</Link></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Product documentation is currently in progress.</p>
                )}
              </div>
            )}
            {fam.ldPrefix && (
              <div>
                <p style={label}>// LIGHT DUTY PRODUCTS</p>
                {fam.ldProducts.length > 0 && fam.ldProducts[0] !== 'DOCUMENTATION PENDING' ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {fam.ldProducts.map(pn => (
                      <li key={pn}><Link href={`/products/${pn.toLowerCase()}`} style={{ color: '#fff', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>{pn}</Link></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Product documentation is currently in progress.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Standards */}
        <section style={section}>
          <p style={label}>// ENGINEERING STANDARDS</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            {fam.applicableStandards.map((std) => (
              <span key={std} style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px', padding: '0.35rem 0.85rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
                {std}
              </span>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
