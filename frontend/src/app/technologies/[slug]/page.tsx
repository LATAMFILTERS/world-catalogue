import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { TechDetailPage } from '@/components/TechDetailPage';
import { TECH_PAGES } from './techPagesData';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

const BASE_URL = 'https://elimfilters.com';

export function generateStaticParams() {
  return catalogue.technologies.map((item) => ({
    slug: getSlug(item.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return { title: 'Not Found' };
  const url = `${BASE_URL}/technologies/${params.slug}`;
  const title = `${item.title} | ELIMFILTERS® Proprietary Technology`;
  return {
    title,
    description: item.description.length > 160 ? item.description.slice(0, 157) + '…' : item.description,
    keywords: [
      item.title, `${item.title} filtration technology`, `${item.name.toLowerCase()} filter`,
      'ELIMFILTERS® technology', 'industrial filtration technology', 'asset protection',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: item.description.length > 160 ? item.description.slice(0, 157) + '…' : item.description,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS® World Catalogue',
      images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630, alt: `${item.title} — ELIMFILTERS® Technology` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@elimfilters',
      title,
      description: item.description.length > 160 ? item.description.slice(0, 157) + '…' : item.description,
    },
  };
}

function productSchema(item: ReturnType<typeof getItemBySlug>, slug: string) {
  if (!item) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    brand: { '@type': 'Brand', name: 'ELIMFILTERS®' },
    description: item.description,
    url: `${BASE_URL}/technologies/${slug}`,
    category: 'Industrial Filtration Technology',
    manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS®', url: BASE_URL },
  };
}

function faqSchema(item: ReturnType<typeof getItemBySlug>) {
  if (!item) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${item.title}?`,
        acceptedAnswer: { '@type': 'Answer', text: item.description },
      },
      {
        '@type': 'Question',
        name: `What industries use ${item.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${item.title} is used across heavy industry sectors including mining, agriculture, marine, construction, power generation, oil & gas, and transportation fleets where engine and equipment protection is critical.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the engineering architecture behind ${item.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${item.title} is a proprietary ELIMFILTERS® protection architecture engineered for specific contamination control targets in industrial operating environments. It uses a multi-layer protection construction validated against ISO industry standards (ISO 5011, ISO 16889, ISO 4406) for the contamination particle size ranges, operating pressures, and service intervals characteristic of the applications it protects.`,
        },
      },
    ],
  };
}

function breadcrumbSchema(item: ReturnType<typeof getItemBySlug>, slug: string) {
  if (!item) return null;
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
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return null;

  const slug = params.slug;
  const pSchema = productSchema(item, slug);
  const fSchema = faqSchema(item);
  const bSchema = breadcrumbSchema(item, slug);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: item.title,
    url: `${BASE_URL}/technologies/${slug}`,
    datePublished: '2025-01-01',
    dateModified: '2026-05-30',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: BASE_URL },
  };

  const schemas = (
    <>
      {pSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pSchema) }} />}
      {fSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(fSchema) }} />}
      {bSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
    </>
  );

  const techData = TECH_PAGES[slug];
  if (techData) {
    return <>{schemas}<TechDetailPage data={techData} /></>;
  }

  return <>{schemas}<CategoryPage item={item} category="technologies" /></>;
}
