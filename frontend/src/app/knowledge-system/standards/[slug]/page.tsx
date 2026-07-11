import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ENTITY_NODES, getEntityNode } from '@/lib/entity-graph';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

const BASE_URL = 'https://elimfilters.com';
const LEGACY_CATCH_ALL_STANDARDS = new Set(['iso-16889', 'iso-4406', 'iso-5011']);

const PURPOSES: Record<string, string> = {
  'iso-16889': 'Multi-pass test method for evaluating hydraulic filter element efficiency, Beta ratio, contaminant capacity, and differential-pressure behavior.',
  'iso-4406': 'Cleanliness coding system for expressing solid-particle concentration in hydraulic and lubricating fluids.',
  'iso-5011': 'Test framework for inlet air-cleaning equipment used with internal-combustion engines and compressors.',
  'sae-j1539': 'Performance test practice for engine air-cleaner elements and intake filtration components.',
  'iso-11155': 'Test framework for passenger-compartment air filters used in road vehicles.',
  'iso-8573-1': 'Compressed-air purity classification covering particles, water, and oil contamination.',
  'iso-16332': 'Laboratory method for evaluating fuel-water separation performance in diesel fuel filtration systems.',
  'iso-12937': 'Coulometric Karl Fischer method for determining water content in petroleum products.',
  'astm-d6304': 'Karl Fischer titration methods for determining water in petroleum products, lubricating oils, and additives.',
  'astm-d6210': 'Performance specification for fully formulated glycol-base heavy-duty engine coolants.',
  'din-51524': 'Classification and minimum requirements for hydraulic fluids used in industrial and mobile systems.',
  'nfpa-t2-14': 'Hydraulic-fluid power guidance associated with contamination control and component cleanliness practices.',
  'eu-dir-2019-130': 'European worker-protection requirements addressing occupational exposure to carcinogens and mutagens.',
};

export function generateStaticParams() {
  return ENTITY_NODES
    .filter((node) => node.kind === 'standard')
    .map((node) => node.id.replace('standard:', ''))
    .filter((slug) => !LEGACY_CATCH_ALL_STANDARDS.has(slug))
    .map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const standard = getEntityNode(`standard:${params.slug}`);
  if (!standard) return { title: 'Standard Not Found' };
  const title = `${standard.name} | ELIMFILTERS Knowledge System`;
  const description = PURPOSES[params.slug] || 'Engineering standard connected to industrial contamination control and asset protection.';
  return { title, description, alternates: { canonical: `${BASE_URL}/knowledge-system/standards/${params.slug}/` } };
}

export default function StandardPage({ params }: { params: { slug: string } }) {
  const standard = getEntityNode(`standard:${params.slug}`);
  if (!standard) notFound();
  const purpose = PURPOSES[params.slug] || 'This standard provides a recognized engineering reference for contamination control, system validation, or protected-asset performance.';

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4rem) 4rem' }}>
        <Link href="/knowledge-system/standards/" style={{ color: '#FFF12D', fontFamily: 'var(--font-display)', textDecoration: 'none', fontWeight: 700 }}>BACK TO STANDARDS</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.9, textTransform: 'uppercase', margin: '2rem 0 1.5rem' }}>{standard.name}</h1>
        <p style={{ maxWidth: 820, fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.78)' }}>{purpose}</p>
      </section>
      <ServerKnowledgeConnections kind="standard" slug={params.slug} />
    </main>
  );
}
