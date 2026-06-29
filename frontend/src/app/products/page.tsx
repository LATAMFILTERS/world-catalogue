import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  title: 'Product Registry | ELIMFILTERS',
  description: 'Search the ELIMFILTERS Product Registry by part number, OEM cross-reference, machine, engine, industry, or protection system.',
  alternates: { canonical: `${BASE_URL}/products` },
};

export default function ProductsIndexPage() {
  const label: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.22em', color: '#FFF12D', textTransform: 'uppercase' as const, marginBottom: '1rem' };
  const h2Style: React.CSSProperties = { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', lineHeight: 1.2, marginBottom: '1rem' };
  const section: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      
      <section style={{ padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(2rem, 4vw, 3rem)', maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem', maxWidth: '680px' }}>
          Product Registry
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '560px', marginBottom: '2.5rem' }}>
          Explore the complete catalogue of ELIMFILTERS products. Search by part number, machine, engine, or cross-reference.
        </p>
        
        {/* Search Callout */}
        <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', padding: '2rem', borderRadius: '4px', maxWidth: '800px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Access the Part Search Engine</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            For real-time OEM cross-referencing, dimension queries, and application lookups, use our dedicated Part Search application.
          </p>
          <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#FFF12D', color: '#000', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '2px', fontFamily: "'Titillium Web', sans-serif", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            OPEN PART SEARCH ↗
          </a>
        </div>
      </section>

      <section style={section}>
        <h2 style={h2Style}>Explore by Hierarchy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <Link href="/systems" style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '4px' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Protection Systems</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Air Intake, Fuel, Lube, Hydraulic...</p>
          </Link>
          <Link href="/families" style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '4px' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Product Families</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Primary Air, Secondary Fuel, Oil Filters...</p>
          </Link>
          <Link href="/technologies" style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '4px' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Technologies</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>MACROCORE™, SYNTRAX™, NANOFORCE™...</p>
          </Link>
          <Link href="/industries" style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '4px' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Industries</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Mining, Agriculture, Marine...</p>
          </Link>
        </div>
      </section>

    </main>
  );
}
