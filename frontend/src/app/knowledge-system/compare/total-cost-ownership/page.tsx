'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// R10: This page was merged into /knowledge-system/fleet/total-cost-ownership.
// The fleet page is the canonical TCO reference; the commodity-vs-system cost
// framing that lived here is now section 07 of that page.
export default function CompareTCORedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/knowledge-system/fleet/total-cost-ownership');
  }, [router]);

  return (
    <main style={{
      background: '#000', color: '#fff', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
          This page has moved to the Fleet Optimization section.
        </p>
        <Link
          href="/knowledge-system/fleet/total-cost-ownership"
          style={{ color: '#FFF12D', textDecoration: 'underline', fontFamily: 'Titillium Web, sans-serif', fontWeight: 700 }}
        >
          Total Cost of Ownership — Filtration Investment Analysis →
        </Link>
      </div>
    </main>
  );
}
