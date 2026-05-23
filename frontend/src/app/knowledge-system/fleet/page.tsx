'use client';

import Link from 'next/link';

export default function FleetPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.18em', marginBottom: '1rem' }}>
          // KNOWLEDGE SYSTEM · FLEET OPTIMIZATION
        </p>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Fleet Optimization
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem' }}>
          Content coming soon.
        </p>
        <Link href="/knowledge-system" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', textDecoration: 'none', letterSpacing: '0.1em' }}>
          ← KNOWLEDGE SYSTEM
        </Link>
      </div>
    </main>
  );
}
