import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TechnologiesPortfolio } from '@/components/TechnologiesPortfolio';

export const metadata = {
  title: 'Technologies | ELIMFILTERS Asset Protection Platform',
  description: 'ELIMFILTERS proprietary technologies for industrial asset protection systems.',
};

export default function TechnologiesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ELIMFILTERS Proprietary Technologies',
    url: 'https://elimfilters.com/technologies',
    description: 'Engineering technologies behind ELIMFILTERS asset protection systems.',
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Link href="/" style={homeButton}>HOME</Link>

      <section style={hero}>
        <div style={{ ...heroImage, backgroundImage: 'url(/images/operator-technology.avif)' }} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>PROPRIETARY TECHNOLOGIES</p>
          <h1 style={heroTitle}>Technology<br /><span style={{ color: '#FFF12D' }}>Built To Protect Assets</span></h1>
          <p style={heroLead}>ELIMFILTERS® technologies are engineering architectures mapped to protected systems, contamination risks, and industrial duty cycles.</p>
          <div style={tagRow}>{['AIR', 'FUEL', 'WATER', 'LUBE', 'HYDRAULIC', 'COOLING', 'CABIN'].map((item) => <span key={item} style={tag}>{item}</span>)}</div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>THE DIFFERENCE</p>
            <h2 style={sectionTitle}>Products replace parts. Technologies control failure.</h2>
          </div>
          <div>
            <p style={leadText}>A product number tells you what fits. A technology tells you why the asset is being protected and what operating risk is being reduced.</p>
            <p style={bodyText}>Systems define the protection domain. Technologies define the engineering architecture. Product families deliver the field implementation.</p>
          </div>
        </div>
      </section>

      <TechnologiesPortfolio />

      <section style={architectureSection}>
        <div style={wrap}>
          <p style={eyebrow}>ASSET PROTECTION LOGIC</p>
          <h2 style={sectionTitle}>Each technology belongs to a protected system.</h2>
          <p style={{ ...leadText, marginTop: '1.4rem' }}>MACROCORE™, SYNTEPORE™, AQUAGUARD™, SYNTRAX™, NANOFORCE™, COOLTECH™, DRYCORE™, INTEKCORE™, and MICROKAPPA™ form the engineering layer behind ELIMFILTERS® asset protection systems.</p>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>TOTAL ASSET PROTECTION</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>Technologies support systems. Systems protect assets.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/systems" style={yellowButton}>EXPLORE SYSTEMS</Link>
            <Link href="/contact" style={darkButton}>CONTACT ELIMFILTERS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const homeButton: CSSProperties = { position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 50, background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem', padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.36 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 48%, rgba(0,0,0,0.30) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.20), transparent 36%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.3em', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)', maxWidth: '1120px', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { marginTop: '2rem', maxWidth: '800px', color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600 };
const tagRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' };
const tag: CSSProperties = { border: '1px solid rgba(255,255,255,0.18)', padding: '0.82rem 1rem', fontFamily: 'var(--font-display)', fontSize: '0.74rem', letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.88)' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.78 };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const architectureSection: CSSProperties = { background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.82rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)' };
