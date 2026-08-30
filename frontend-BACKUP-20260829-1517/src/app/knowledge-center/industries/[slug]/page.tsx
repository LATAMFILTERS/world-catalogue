import type { Metadata } from 'next';
import { KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import IndustryContent from './IndustryContent';

export function generateStaticParams() {
  return KC_INDUSTRIES.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const industry = KC_INDUSTRIES.find((ind) => ind.slug === params.slug);
  if (!industry) return {};

  const url = `https://elimfilters.com/knowledge-center/industries/${params.slug}`;
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

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const industry = KC_INDUSTRIES.find((ind) => ind.slug === params.slug);
  if (!industry) return notFound();
  const detail = KC_INDUSTRY_DETAILS[params.slug] ?? null;
  return <IndustryContent industry={industry} detail={detail} />;
}
