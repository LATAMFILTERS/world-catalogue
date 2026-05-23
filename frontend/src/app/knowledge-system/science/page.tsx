'use client';

import Link from 'next/link';

export default function SciencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.18em', marginBottom: '1rem' }}>
          // KNOWLEDGE SYSTEM · FILTRATION SCIENCE
        </p>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Filtration Science
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
          Content coming soon.
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
          Filtration science underpins every decision in{' '}
          <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration system design</Link>
          {' '}—from particle capture physics to fluid dynamics. The mechanisms documented here connect directly to contamination failure modes such as{' '}
          <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>particle wear in engines</Link>.
        </p>
        <Link href="/knowledge-system" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', textDecoration: 'none', letterSpacing: '0.1em' }}>
          ← KNOWLEDGE SYSTEM
        </Link>
      </div>
    </main>
  );
}
