import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCT_FAMILY_LIST } from '@/lib/product-families-data';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  title: 'Product Family Centers | ELIMFILTERS',
  description: 'Explore the ELIMFILTERS Product Family Centers across all Protection Systems. HD and LD product architectures for industrial contamination control.',
  alternates: { canonical: `${BASE_URL}/families` },
};

export default function FamiliesPage() {
  // CollectionPage + hasPart avoids triggering ProductGroup validation rules
  // (hasVariant/offers requirements) on the hub. Individual family detail pages
  // carry their own ProductGroup schema with hasVariant + Offer.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ELIMFILTERS Product Families',
    url: `${BASE_URL}/families`,
    description: 'Industrial filtration product families organized by Protection System and Duty Class. HD and LD architectures for contamination control across all ELIMFILTERS application domains.',
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    hasPart: PRODUCT_FAMILY_LIST.map((fam) => ({
      '@type': 'WebPage',
      name: fam.name,
      url: `${BASE_URL}/families/${fam.slug}`,
      description: fam.purpose.slice(0, 160),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <section style={{ padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(2rem, 4vw, 3rem)', maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem', maxWidth: '680px' }}>
            Product Families
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '560px' }}>
            The classification and categorization of all ELIMFILTERS protection products. 
            Organized by Protection System and Duty Class.
          </p>
        </section>

        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem)' }}>
          {PROTECTION_SYSTEM_LIST.map((sys) => {
            const families = PRODUCT_FAMILY_LIST.filter(f => f.protectionSystem === sys.slug);
            if (families.length === 0) return null;
            return (
              <div key={sys.key} style={{ marginBottom: '4rem' }}>
                <Link href={`/systems/${sys.slug}`} style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'inline-block' }}>
                    {sys.name} <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>→</span>
                  </h2>
                </Link>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
                  {families.map(fam => (
                    <Link
                      key={fam.key}
                      href={`/families/${fam.slug}`}
                      style={{ textDecoration: 'none', background: '#000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'background 0.2s' }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {fam.hdPrefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.1em', color: '#FFF12D', background: 'rgba(255,241,45,0.08)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>HD</span>}
                        {fam.ldPrefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>LD</span>}
                      </div>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                        {fam.name}
                      </p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, textAlign: 'justify' }}>
                        {fam.purpose.slice(0, 90)}…
                      </p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginTop: '0.5rem' }}>
                        View Family →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
