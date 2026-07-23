import type { Metadata } from 'next';
import { ENTITY_NODES } from '@/lib/entity-graph';

const BASE_DESTINATION = '/knowledge-center/standards/';

export function generateStaticParams() {
  return ENTITY_NODES
    .filter((node) => node.kind === 'standard')
    .map((node) => node.id.replace('standard:', ''))
    .map((slug) => ({ slug }));
}

function standardLabel(slug: string) {
  return slug.toUpperCase().replace(/-/g, ' ');
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = `${BASE_DESTINATION}${params.slug}/`;
  const label = standardLabel(params.slug);
  return {
    title: `${label} Standard | ELIMFILTERS Knowledge Center`,
    description: `Legacy ELIMFILTERS Knowledge System route for the ${label} filtration standard. Continue to the current standards library page.`,
    alternates: { canonical: `https://elimfilters.com${destination}` },
  };
}

export default function LegacyKnowledgeSystemStandardRedirect({ params }: { params: { slug: string } }) {
  const destination = `${BASE_DESTINATION}${params.slug}/`;
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <p style={{ color: '#FFF12D', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>ELIMFILTERS Knowledge Center</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1, margin: '1rem 0' }}>This standard page has moved.</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>The legacy Knowledge System standards route now points to the updated Knowledge Center standards library.</p>
        <a href={destination} style={{ color: '#FFF12D', fontWeight: 700 }}>Continue to updated standard</a>
      </section>
    </main>
  );
}
