import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/engineering/contamination-control/';

export const metadata: Metadata = {
  title: 'Particle Counting and ISO 11171',
  description: 'Engineering guidance on particle counting, ISO 11171 calibration, fluid cleanliness measurement, and contamination control.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/engineering/contamination-control/' },
};

export default function ParticleCountingLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Particle Counting and ISO 11171</h1>
        <a href={DESTINATION}>Open current resource</a>
      </section>
    </main>
  );
}
