import type { Metadata } from 'next';

const DESTINATION = '/systems/fuel-cleanliness/';

export const metadata: Metadata = {
  title: 'Fuel Cleanliness Protection | ELIMFILTERS',
  description: 'Fuel cleanliness protection systems and technologies for diesel equipment.',
  alternates: { canonical: 'https://elimfilters.com/systems/fuel-cleanliness/' },
};

export default function FuelCleanlinessLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Fuel cleanliness protection has moved.</h1>
        <a href={DESTINATION}>Open current system page</a>
      </section>
    </main>
  );
}
