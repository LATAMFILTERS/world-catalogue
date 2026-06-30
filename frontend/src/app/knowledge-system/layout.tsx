import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge System — Industrial Filtration Reference',
  description: 'Technical reference library covering filtration standards (ISO 16889, ISO 4406, SAE J1539), contamination case studies, fleet optimization strategies, and ELIMFILTERS technology mapping.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system',
  },
  openGraph: {
    title: 'Knowledge System — Industrial Filtration Reference',
    description: 'Technical reference library covering filtration standards (ISO 16889, ISO 4406, SAE J1539), contamination case studies, fleet optimization strategies, and ELIMFILTERS technology mapping.',
    url: 'https://elimfilters.com/knowledge-system',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knowledge System — Industrial Filtration Reference',
    description: 'Technical reference library covering filtration standards (ISO 16889, ISO 4406, SAE J1539), contamination case studies, fleet optimization strategies, and ELIMFILTERS technology mapping.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://elimfilters.com/#organization',
  name: 'ELIMFILTERS',
  url: 'https://elimfilters.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://elimfilters.com/assets/logo-elimfilters.png',
    width: 200,
    height: 60,
  },
  description: 'Industrial filtration systems manufacturer specializing in contamination control for engines, hydraulic systems, fuel circuits, cabin air, and compressed air across heavy-duty, mining, agriculture, marine, and power generation sectors.',
  knowsAbout: [
    'Industrial filtration systems',
    'Contamination control engineering',
    'ISO 16889 beta ratio filtration',
    'ISO 4406 fluid cleanliness codes',
    'ISO 5011 air intake filtration',
    'ISO 16332 fuel/water separation',
    'Engine lube oil filtration',
    'Hydraulic system filtration',
    'Fuel water separation',
    'Cabin air health protection',
    'Compressed air drying',
    'Fleet maintenance optimization',
  ],
  sameAs: [
    'https://elimfilters.com',
  ],
};

export default function KnowledgeSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />
      {children}
    </>
  );
}
