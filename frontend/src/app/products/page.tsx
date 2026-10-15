import { PublicUiText } from '@/components/PublicUiText';
import Link from '@/components/LocalizedLink';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Families | ELIMFILTERS',
  alternates: { canonical: 'https://elimfilters.com/families/' },
  robots: { index: false, follow: true },
};

export default function ProductsLegacyEntry() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <meta httpEquiv="refresh" content="0;url=/families/" />
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}><PublicUiText textKey="publicUi.text5">{"Product Families"}</PublicUiText></h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.72)' }}>
          The ELIMFILTERS product portfolio is available under Product Families.
        </p>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/families/" style={{ color: '#FFF12D' }}>Continue to Product Families</Link>
        </p>
      </div>
    </main>
  );
}
