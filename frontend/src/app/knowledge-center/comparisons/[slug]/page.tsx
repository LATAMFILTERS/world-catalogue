import type { Metadata } from 'next';
import { KC_COMPARISONS, getComparisonBySlug } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ComparisonContent from './ComparisonContent';

const BASE_URL = 'https://elimfilters.com';

export function generateStaticParams() {
  return KC_COMPARISONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return { title: 'Comparison Not Found' };

  const url = `${BASE_URL}/knowledge-center/comparisons/${slug}`;
  const description = comparison.subtitle || comparison.engineeringObjective;

  return {
    title: comparison.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${comparison.title} | ELIMFILTERS`,
      description,
      url,
      type: 'article',
      siteName: 'ELIMFILTERS',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${comparison.title} | ELIMFILTERS`,
      description,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  return <ComparisonContent comparison={comparison} />;
}
