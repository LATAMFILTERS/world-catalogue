import type { Metadata } from 'next';

const DESTINATION = '/knowledge-center/';

export const metadata: Metadata = {
  title: 'Knowledge Center | ELIMFILTERS',
  description: 'This page has moved. Continue to the ELIMFILTERS Knowledge Center.',
  alternates: { canonical: `https://elimfilters.com${DESTINATION}` },
  robots: { index: false, follow: true },
};

export default function KnowledgeSystemRedirectPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1>This page has moved.</h1>
        <p>Continue to the ELIMFILTERS Knowledge Center.</p>
        <a href={DESTINATION}>Open Knowledge Center</a>
      </section>
    </main>
  );
}
