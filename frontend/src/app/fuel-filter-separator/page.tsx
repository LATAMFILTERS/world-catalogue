import type { Metadata } from 'next';

const DESTINATION = '/technologies/hydrocore/';

export const metadata: Metadata = {
  title: 'Fuel/Water Separator Technology | ELIMFILTERS',
  description: 'This page has moved. Continue to the current ELIMFILTERS HYDROCORE™ fuel/water separation technology reference.',
  alternates: { canonical: `https://elimfilters.com${DESTINATION}` },
  robots: { index: false, follow: true },
};

export default function FuelFilterSeparatorRedirectPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1>This page has moved.</h1>
        <p>Continue to the current HYDROCORE™ fuel/water separation technology reference.</p>
        <a href={DESTINATION}>Open HYDROCORE™</a>
      </section>
    </main>
  );
}
