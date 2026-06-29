import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';
import { PEP_FAMILIES } from '@/lib/pep-data';
import TechCenterContent from './TechCenterContent';

interface Props {
  params: { tech: string };
}

export function generateStaticParams() {
  return KC_TECHNOLOGIES.map((t) => ({ tech: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === params.tech);
  if (!tech) return { title: 'Not Found' };
  return {
    title: `${tech.name} Technology Center | ELIMFILTERS`,
    description: tech.tagline,
    alternates: {
      canonical: `https://elimfilters.com/product-experience/technologies/${tech.slug}`,
    },
  };
}

export default function TechCenterPage({ params }: Props) {
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === params.tech);
  if (!tech) notFound();

  const relatedFamilies = PEP_FAMILIES.filter((f) => f.technologySlugs.includes(tech.slug));

  return <TechCenterContent tech={tech} relatedFamilies={relatedFamilies} />;
}
