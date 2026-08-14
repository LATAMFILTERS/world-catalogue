import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/CategoryPage';
import { CANONICAL_TECHNOLOGY_LIST, getCanonicalTechnology } from '@/lib/canonical-technologies';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import type { CatalogueItem } from '@/lib/catalogue';

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

  // Canonical public technology routes must be built exclusively from the
  // governed technology and engineering registries. Legacy catalogue/detail
  // copy is intentionally excluded because it contains historical claims that
  // are not part of the current Claim Registry.
  if (!canonical || !engineering) return undefined;

  return {
    name: canonical.name.replace('™', ''),
    file: '',
    title: canonical.name,
    subtitle: canonical.role,
    description: engineering.definition,
    features: [
      engineering.engineeringPrinciple,
      engineering.controlStrategy,
    ],
    benefits: [engineering.operationalImpact],
    techTags: [],
    stats: {},
    cta: 'FIND MY PART',
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
  const engineering = getTechnologyEngineering(params.slug);
  if (!item || !engineering) notFound();

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

  return (
    <>
      {schemas}
      {semanticHeading}
      <CategoryPage
        item={item}
        category="technologies"
        geoData={{
          directAnswer: engineering.definition,
          ctaTitle: `Apply ${item.title} to the correct system`,
          ctaDescription: 'Use ELIMFILTERS Part Search to identify the correct filtration component for the equipment, application, and protected system.',
          operationalObjective: {
            headline: 'Engineering Objective',
            lines: [engineering.engineeringPrinciple, engineering.controlStrategy],
          },
          faq: [
            { q: `What is ${item.title}?`, a: engineering.definition },
            { q: `How does ${item.title} work?`, a: engineering.engineeringPrinciple },
            { q: `What does ${item.title} protect?`, a: engineering.operationalImpact },
          ],
        }}
      />
    </>
  );
}
