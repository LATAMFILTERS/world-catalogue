'use client';

import { useEffect } from 'react';

export default function CooltechRedirect() {
  useEffect(() => {
    window.location.replace('/technologies/thermacore');
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/technologies/thermacore" />
      </noscript>
      <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.5)' }}>
        Redirecting to <a href="/technologies/thermacore" style={{ color: '#FFF12D' }}>THERMACORE™</a>…
      </p>
    </main>
  );
}
