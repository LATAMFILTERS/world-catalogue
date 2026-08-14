import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

const visuallyHiddenHeading = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

function technologyUrl(slug: string) {
  return `${BASE_URL}/technologies/${slug}/`;
}

function technologyEntityUrl(slug: string) {
  return `${technologyUrl(slug)}#technology`;
}

function resolveTechnology(slug: string): CatalogueItem | undefined {
  const canonical = getCanonicalTechnology(slug);
  const engineering = getTechnologyEngineering(slug);

  // Public technology routes are canonical-only. Legacy catalogue entries must
  // never recreate a retired technology page.
  if (!canonical || !engineering) return undefined;

  const catalogueItem = getItemBySlug('technologies', slug);
  if (catalogueItem) {
    return {
      ...catalogueItem,
      name: canonical.name.replace('™', ''),
      title: canonical.name,
      subtitle: canonical.role,
      description: engineering.definition,
      engineeringBody: engineering.engineeringPrinciple,
    };
  }

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
  if (!item || !engineering) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = technologyUrl(params.slug);
  const title = `${item.title} Proprietary Technology`;
  const socialTitle = `${item.title} | ELIMFILTERS Proprietary Technology`;
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
      title: socialTitle,
      description: engineering.definition,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{
        url: 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: `${item.title} - ELIMFILTERS Technology`,
      }],
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description: engineering.definition },
  };
}

function technologySchema(item: CatalogueItem, slug: string) {
  const engineering = getTechnologyEngineering(slug);
  if (!engineering) return null;
  const url = technologyUrl(slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: item.title,
    name: item.title,
    description: engineering.definition,
    url,
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
      '@id': technologyEntityUrl(slug),
      name: item.title,
      description: engineering.definition,
      url,
      inDefinedTermSet: `${BASE_URL}/technologies/`,
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
      '@id': `${BASE_URL}/#website`,
      name: 'ELIMFILTERS',
      url: `${BASE_URL}/`,
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies/` },
      { '@type': 'ListItem', position: 3, name: item.title, item: technologyUrl(slug) },
    ],
  };
}

export default function TechnologyPage({ params }: Props) {
  const item = resolveTechnology(params.slug);
  if (!item) notFound();

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

  const semanticHeading = <h1 style={visuallyHiddenHeading}>{item.title} Proprietary Filtration Technology</h1>;
  const techData = TECH_PAGES[slug];
  if (techData) return <>{schemas}{semanticHeading}<TechDetailPage data={techData} /></>;

  return <>{schemas}{semanticHeading}<CategoryPage item={item} category="technologies" /></>;
}
