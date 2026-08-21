'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const DESTINATION = '/commercial-lines/duratech/';

export default function LegacyCommercialLineRedirect() {
  useEffect(() => {
    window.location.replace(DESTINATION);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 680, textAlign: 'center' }}>
        <p style={{ fontFamily: 'monospace', color: '#FFF12D', letterSpacing: '0.12em' }}>CANONICAL URL MIGRATION</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', margin: '1rem 0' }}>This resource has moved.</h1>
        <p style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
          Continue to the current ELIMFILTERS integrated maintenance and asset-protection solution page.
        </p>
        <Link href={DESTINATION} style={{ display: 'inline-block', marginTop: '1rem', background: '#FFF12D', color: '#000', padding: '0.9rem 1.2rem', textDecoration: 'none', fontWeight: 700 }}>
          CONTINUE
        </Link>
      </div>
    </main>
  );
}
