import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/engineering/contamination-control/';

export const metadata: Metadata = {
  title: 'Particle Science and Contamination Control',
  description: 'Engineering guidance on particle contamination, wear mechanisms, cleanliness control, and filtration performance.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/engineering/contamination-control/' },
};

export default function ParticleScienceLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Particle Science and Contamination Control</h1>
        <a href={DESTINATION}>Open current resource</a>
      </section>
    </main>
  );
}
