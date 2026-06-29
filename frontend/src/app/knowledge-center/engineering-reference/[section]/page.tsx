import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ERL_SECTIONS, getERLSection } from '@/lib/engineering-reference-data';
import SectionContent from './SectionContent';

interface Props {
  params: { section: string };
}

export async function generateStaticParams() {
  return ERL_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = getERLSection(params.section);
  if (!section) return { title: 'Not Found' };
  return {
    title: `${section.title} | Engineering Reference | ELIMFILTERS`,
    description: section.definition.slice(0, 155),
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/engineering-reference/${section.slug}`,
    },
  };
}

export default function SectionPage({ params }: Props) {
  const section = getERLSection(params.section);
  if (!section) notFound();

  const currentIndex = ERL_SECTIONS.findIndex((s) => s.slug === section.slug);
  const prev = currentIndex > 0 ? ERL_SECTIONS[currentIndex - 1] : null;
  const next = currentIndex < ERL_SECTIONS.length - 1 ? ERL_SECTIONS[currentIndex + 1] : null;

  return <SectionContent section={section} prev={prev} next={next} />;
}
