import { KC_COMPARISONS, getComparisonBySlug } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ComparisonContent from './ComparisonContent';

export function generateStaticParams() {
  return KC_COMPARISONS.map(c => ({ slug: c.slug }));
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
