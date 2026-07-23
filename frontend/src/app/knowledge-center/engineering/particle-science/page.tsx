import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/engineering/particle-counting/';

export const metadata: Metadata = {
  title: 'Particle Science and Counting | ELIMFILTERS',
  description: 'Engineering guidance on particle contamination, particle counting, and filtration performance.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/engineering/particle-counting/' },
};

export default function ParticleScienceLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Particle-science guidance has moved.</h1>
        <a href={DESTINATION}>Open current resource</a>
      </section>
    </main>
  );
}
