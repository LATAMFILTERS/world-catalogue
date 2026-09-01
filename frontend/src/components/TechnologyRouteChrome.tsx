'use client';

import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

const ARTICLE_IMAGES: Record<string, string> = {
  macrocore: '/images/mecanica-air.avif',
  microkappa: '/images/cabin-hero.avif',
  drycore: '/images/airdryer-hero.avif',
  intekcore: '/images/intekcor-hero.avif',
  syntapore: '/images/hero-syntapore.avif',
  hydrocore: '/images/fuellseparator-hero.avif',
  syntrax: '/images/syntrax.avif',
  nanoforce: '/images/nanoforce-mecanico.avif',
  thermacore: '/images/THERMACORE-CAMION.avif',
};

export default function TechnologyRouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = (pathname || '').replace(/\/+$/, '') || '/';
  const isTechnologyHub = normalized === '/technologies';
  const slug = !isTechnologyHub && normalized.startsWith('/technologies/')
    ? normalized.slice('/technologies/'.length).split('/')[0]
    : '';
  const image = ARTICLE_IMAGES[slug];
  const articleEnrichment = image ? {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `https://elimfilters.com/technologies/${slug}/#article`,
    image: `https://elimfilters.com${image}`,
    dateModified: '2026-08-31',
  } : null;

  return (
    <>
      {!isTechnologyHub && <PageHeader currentPage="Technologies" />}
      {articleEnrichment && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleEnrichment) }}
        />
      )}
      {children}
    </>
  );
}
