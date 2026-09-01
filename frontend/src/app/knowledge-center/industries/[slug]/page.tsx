import type { Metadata } from 'next';
import { KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import IndustryContent from './IndustryContent';

export function generateStaticParams() {
  return KC_INDUSTRIES.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = KC_INDUSTRIES.find((ind) => ind.slug === slug);
  if (!industry) return {};

  const url = `https://elimfilters.com/knowledge-center/industries/${slug}`;
  return {
    title: `${industry.title} Filtration Engineering`,
    description: industry.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${industry.title} Filtration Engineering | ELIMFILTERS`,
      description: industry.description,
      url,
      type: 'article',
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = KC_INDUSTRIES.find((ind) => ind.slug === slug);
  if (!industry) return notFound();
  const detail = KC_INDUSTRY_DETAILS[slug] ?? null;
  return <IndustryContent industry={industry} detail={detail} />;
}
