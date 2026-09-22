import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { IndustrialProcessLandingStablePage } from '@/components/IndustrialProcessLandingStablePage';
import { INDUSTRIAL_PROCESS_PLATFORMS, industrialProcessPlatformUrl } from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

export const metadata: Metadata = {
  title: 'Industrial & Process Filtration | ELIMFILTERS',
  description:
    'ELIMFILTERS Industrial & Process is the engineering entry point for high-value filtration, separation, fluid conditioning, gas conditioning, air treatment and industrial water projects.',
  alternates: { canonical: '/industrial-process/' },
  openGraph: {
    title: 'Industrial & Process Filtration | ELIMFILTERS',
    description:
      'Engineering-led filtration and process protection for industrial air, dust and fume, gas, fluids and water.',
    url: 'https://elimfilters.com/industrial-process/',
    type: 'website',
  },
};

const BASE_URL = 'https://elimfilters.com';

export default function IndustrialProcessPage() {
  const platformStandards = INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => ({
    platform,
    standards: platform.knowledgeCenterSlug ? (getCanonicalKnowledgeBySlug(platform.knowledgeCenterSlug)?.standards ?? []) : [],
  })).filter((item) => item.standards.length > 0);

  const url = `${BASE_URL}/industrial-process/`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: 'Industrial & Process Filtration | ELIMFILTERS',
    description:
      'ELIMFILTERS Industrial & Process is the engineering entry point for high-value filtration, separation, fluid conditioning, gas conditioning, air treatment and industrial water projects.',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Industrial & Process', item: url },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: INDUSTRIAL_PROCESS_PLATFORMS.length,
      itemListElement: INDUSTRIAL_PROCESS_PLATFORMS.map((platform, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${platform.name} — ${platform.descriptor}`,
        url: `${BASE_URL}${industrialProcessPlatformUrl(platform.slug)}`,
      })),
    },
  };

  return (
    <>
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <IndustrialProcessLandingStablePage platformStandards={platformStandards} />
    </>
  );
}
