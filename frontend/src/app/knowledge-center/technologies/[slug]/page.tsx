import type { Metadata } from 'next';
import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import TechContent from './TechContent';

export function generateStaticParams() {
  return KC_TECHNOLOGIES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === params.slug);
  if (!tech) return {};

  const url = `https://elimfilters.com/knowledge-center/technologies/${params.slug}`;
  return {
    title: `${tech.name} Filtration Technology`,
    description: tech.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: `${tech.name} Filtration Technology | ELIMFILTERS`,
      description: tech.tagline,
      url,
      type: 'article',
    },
  };
}

export default function TechPage({ params }: { params: { slug: string } }) {
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === params.slug);
  if (!tech) return notFound();
  return <TechContent tech={tech} />;
}
