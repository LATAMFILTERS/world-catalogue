import type { Metadata } from 'next';
import { CategoryPage } from '@/components/CategoryPage';
import { TechDetailPage } from '@/components/TechDetailPage';
import { CANONICAL_TECHNOLOGY_LIST, getCanonicalTechnology } from '@/lib/canonical-technologies';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { getItemBySlug, type CatalogueItem } from '@/lib/catalogue';
import { TECH_PAGES } from './techPagesData';

interface Props {
  params: { slug: string };
}

const BASE_URL = 'https://elimfilters.com';

function resolveTechnology(slug: string): CatalogueItem | undefined {
  const catalogueItem = getItemBySlug('technologies', slug);
  const canonical = getCanonicalTechnology(slug);
  const engineering = getTechnologyEngineering(slug);

  if (catalogueItem && canonical && engineering) {
    return {
      ...catalogueItem,
      name: canonical.name.replace('™', ''),
      title: canonical.name,
      subtitle: canonical.role,
      description: engineering.definition,
      engineeringBody: engineering.engineeringPrinciple,
    };
  }

  if (catalogueItem) return catalogueItem;
  if (!canonical || !engineering) return undefined;

  return {
    name: canonical.name.replace('™', ''),
    file: '',
    title: canonical.name,
    subtitle: canonical.role,
    description: engineering.definition,
    features: [engineering.engineeringPrinciple, engineering.controlStrategy],
    benefits: [engineering.operationalImpact],
    techTags: [canonical.domain, canonical.name],
    stats: {},
    cta: 'Explore ELIMFILTERS protection systems',
    engineeringBody: engineering.engineeringPrinciple,
  };
}

export function generateStaticParams() {
  return CANONICAL_TECHNOLOGY_LIST.map((technology) => ({ slug: technology.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = resolveTechnology(params.slug);
  const engineering = getTechnologyEngineering(params.slug);
  if (!item || !engineering) return { title: 'Not Found' };

  const url = `${BASE_URL}/technologies/${params.slug}`;
  const title = `${item.title} | ELIMFILTERS Proprietary Technology`;
  return {
    title,
    description: engineering.definition,
    keywords: [
      item.title,
      `${item.title} filtration technology`,
      `${item.name.toLowerCase()} filter`,
      'ELIMFILTERS technology',
      'industrial filtration technology',
      'asset protection',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: engineering.definition,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
      images: [{
        url: 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: `${item.title} - ELIMFILTERS Technology`,
      }],
    },
    twitter: { card: 'summary_large_image', title, description: engineering.definition },
  };
}

function technologySchema(item: CatalogueItem, slug: string) {
  const engineering = getTechnologyEngineering(slug);
  if (!engineering) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${BASE_URL}/technologies/${slug}#article`,
    headline: item.title,
    name: item.title,
    description: engineering.definition,
    url: `${BASE_URL}/technologies/${slug}`,
    author: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    about: {
      '@type': 'DefinedTerm',
      name: item.title,
      description: engineering.definition,
      inDefinedTermSet: `${BASE_URL}/technologies`,
    },
    abstract: engineering.engineeringPrinciple,
    keywords: [
      item.title,
      'industrial filtration technology',
      'contamination control',
      'asset protection',
      'ELIMFILTERS',
    ],
    isPartOf: {
      '@type': 'WebSite',
      name: 'ELIMFILTERS World Catalogue',
      url: BASE_URL,
    },
  };
}

function faqSchema(item: CatalogueItem, slug: string) {
  const engineering = getTechnologyEngineering(slug);
  if (!engineering) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${item.title}?`,
        acceptedAnswer: { '@type': 'Answer', text: engineering.definition },
      },
      {
        '@type': 'Question',
        name: `How does ${item.title} work?`,
        acceptedAnswer: { '@type': 'Answer', text: engineering.engineeringPrinciple },
      },
      {
        '@type': 'Question',
        name: `What does ${item.title} protect?`,
        acceptedAnswer: { '@type': 'Answer', text: engineering.operationalImpact },
      },
    ],
  };
}

function breadcrumbSchema(item: CatalogueItem, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies` },
      { '@type': 'ListItem', position: 3, name: item.title, item: `${BASE_URL}/technologies/${slug}` },
    ],
  };
}

export default function TechnologyPage({ params }: Props) {
  const item = resolveTechnology(params.slug);
  if (!item) return null;

  const slug = params.slug;
  const articleSchema = technologySchema(item, slug);
  const questionsSchema = faqSchema(item, slug);
  const breadcrumbs = breadcrumbSchema(item, slug);

  const schemas = (
    <>
      {articleSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />}
      {questionsSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(questionsSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </>
  );

  const techData = TECH_PAGES[slug];
  if (techData) return <>{schemas}<TechDetailPage data={techData} /></>;

  return <>{schemas}<CategoryPage item={item} category="technologies" /></>;
}
