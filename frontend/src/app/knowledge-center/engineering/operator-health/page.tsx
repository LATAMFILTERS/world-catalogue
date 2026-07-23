import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/systems/cabin-air-protection/';

export const metadata: Metadata = {
  title: 'Operator Health and Cabin Air Protection | ELIMFILTERS',
  description: 'Operator health guidance for controlling dust and airborne contaminants in heavy-equipment cabins.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/systems/cabin-air-protection/' },
};

export default function OperatorHealthLegacyPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>Operator-health guidance has moved.</h1>
        <a href={DESTINATION}>Open current resource</a>
      </section>
    </main>
  );
}
