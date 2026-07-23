import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/engineering/oil-analysis-methods/';

export const metadata: Metadata = {
  title: 'Lubrication Engineering Legacy Route',
  description: 'Legacy route for lubrication engineering. Continue to the current oil-analysis engineering resource.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/engineering/oil-analysis-methods/' },
  robots: { index: false, follow: true },
};

export default function LubricationEngineeringLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Lubrication Engineering and Oil Analysis</h1>
        <a href={DESTINATION}>Open current resource</a>
      </section>
    </main>
  );
}
