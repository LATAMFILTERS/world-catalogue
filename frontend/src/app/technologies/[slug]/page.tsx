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
  const title = `${item.title} | ELIMFILTERS Proprietary Technology`;
  return {
    title,
    description: item.description,
    keywords: [
      item.title, `${item.title} filtration technology`, `${item.name.toLowerCase()} filter`,
      'ELIMFILTERS technology', 'industrial filtration technology', 'asset protection',
    ],
    alternates: {
      canonical: url,
      languages: { en: url, es: url, fr: url, it: url, nl: url, ru: url, zh: url, ja: url, ar: url, fa: url, pt: url },
    },
    openGraph: {
      title,
      description: item.description,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
      images: [{ url: '/assets/logo-elimfilters.png', width: 800, height: 400, alt: `${item.title} — ELIMFILTERS Technology` }],
    },
    twitter: { card: 'summary_large_image', title, description: item.description },
  };
}

function productSchema(item: ReturnType<typeof getItemBySlug>, slug: string) {
  if (!item) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    brand: { '@type': 'Brand', name: 'ELIMFILTERS' },
    description: item.description,
    url: `${BASE_URL}/technologies/${slug}`,
    category: 'Industrial Filtration Technology',
    manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS', url: BASE_URL },
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
        name: `What makes ${item.title} different from standard filters?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${item.title} is a proprietary ELIMFILTERS technology engineered for zero-bypass asset protection. Unlike standard OEM filters, it uses multi-layer filtration media formulated for extreme operating conditions, certified to ISO industry standards.`,
        },
      },
    ],
  };
}

export default function TechnologyPage({ params }: Props) {
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return null;

  const slug = params.slug;
  const pSchema = productSchema(item, slug);
  const fSchema = faqSchema(item);

  const schemas = (
    <>
      {pSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pSchema) }} />}
      {fSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(fSchema) }} />}
    </>
  );

  const techData = TECH_PAGES[slug];
  if (techData) {
    return <>{schemas}<TechDetailPage data={techData} /></>;
  }

  return <>{schemas}<CategoryPage item={item} category="technologies" /></>;
}
