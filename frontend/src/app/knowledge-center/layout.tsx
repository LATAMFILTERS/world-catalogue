import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/';
const TITLE = 'Industrial Filtration & Asset Protection Knowledge Center';
const DESCRIPTION = 'Engineering knowledge for industrial filtration, contamination control, standards, equipment reliability, fleet maintenance and asset protection decisions.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'industrial filtration knowledge',
    'filtration standards',
    'contamination control',
    'equipment reliability',
    'fleet maintenance',
    'asset protection',
    'technical filtration FAQ',
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${URL}#collection`,
  url: URL,
  name: 'ELIMFILTERS Technical Knowledge Center',
  description: DESCRIPTION,
  isPartOf: { '@id': 'https://elimfilters.com/#website' },
  publisher: { '@id': 'https://elimfilters.com/#organization' },
  about: [
    { '@type': 'Thing', name: 'Industrial filtration' },
    { '@type': 'Thing', name: 'Contamination control' },
    { '@type': 'Thing', name: 'Asset protection systems' },
    { '@type': 'Thing', name: 'Equipment reliability' },
    { '@type': 'Thing', name: 'Filtration standards and test methods' },
  ],
  hasPart: [
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/standards/#collection', url: 'https://elimfilters.com/knowledge-center/standards/', name: 'Industrial Standards' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/problems/#collection', url: 'https://elimfilters.com/knowledge-center/problems/', name: 'Contamination & Failure Modes' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/technologies/#collection', url: 'https://elimfilters.com/knowledge-center/technologies/', name: 'Protection Technologies' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/systems/#collection', url: 'https://elimfilters.com/knowledge-center/systems/', name: 'Asset Protection Systems' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/fleet-optimization/#collection', url: 'https://elimfilters.com/knowledge-center/fleet-optimization/', name: 'Fleet Optimization' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/glossary/#collection', url: 'https://elimfilters.com/knowledge-center/glossary/', name: 'Technical Glossary' },
    { '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/faq/#collection', url: 'https://elimfilters.com/knowledge-center/faq/', name: 'Technical FAQ' },
  ],
};

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      {children}
    </>
  );
}
