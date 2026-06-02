'use client';

import { useEffect } from 'react';

export default function AquaguardRedirect() {
  useEffect(() => {
    window.location.replace('/technologies/hydrocore');
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/technologies/hydrocore" />
      </noscript>
      <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.5)' }}>
        Redirecting to <a href="/technologies/hydrocore" style={{ color: '#FFF12D' }}>HYDROCORE™</a>…
      </p>
    </main>
  );
}
