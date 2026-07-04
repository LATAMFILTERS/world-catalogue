import type { Metadata } from 'next';
import ClientNav from './ClientNav';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center',
  },
};

// KC-00 Governance: Organization schema with @id entity anchor.
// Injected once here so all knowledge-center child pages inherit it.
// This enables AI systems to identify ELIMFILTERS as a citable entity
// with a stable canonical identifier across all Knowledge Center content.
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://elimfilters.com/#organization',
  'name': 'ELIMFILTERS',
  'url': 'https://elimfilters.com',
  'sameAs': ['https://elimfilters.com'],
  'knowsAbout': [
    'Industrial filtration engineering',
    'Contamination control systems',
    'ISO 16889 Beta ratio testing',
    'ISO 4406 fluid cleanliness codes',
    'ISO 5011 air filtration performance testing',
    'ISO 8573 compressed air purity standards',
    'Hydraulic system contamination control',
    'Engine air intake filtration',
    'Diesel fuel filtration systems',
    'Cabin air filtration ISO 11155',
    'Asset protection through contamination control',
    'Industrial equipment reliability engineering',
  ],
} as const;

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />
      <ClientNav />
      {children}
    </div>
  );
}
