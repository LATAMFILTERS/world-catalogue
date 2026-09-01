import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ERL_SECTIONS, getERLSection } from '@/lib/engineering-reference-data';
import SectionContent from './SectionContent';

interface Props {
  params: Promise<{ section: string }>;
}

const SEO_INTENT_OVERRIDES: Record<string, { title: string; description: string }> = {
  'fluid-cleanliness': {
    title: 'Fluid Cleanliness Engineering — ISO 4406 Application | ELIMFILTERS',
    description: 'Engineering application reference for fluid cleanliness: interpreting ISO 4406 codes, particle contamination targets, monitoring and system-level cleanliness decisions.',
  },
  'differential-pressure': {
    title: 'Differential Pressure Engineering — Filter ΔP Application | ELIMFILTERS',
    description: 'Engineering application reference for differential pressure across filtration systems, including restriction, loading, monitoring and service decisions.',
  },
  'depth-filtration': {
    title: 'Depth Filtration Engineering — Media Application | ELIMFILTERS',
    description: 'Engineering application reference for depth-filtration media behavior, particle capture through media thickness and application tradeoffs.',
  },
  'compressed-air-purity': {
    title: 'Compressed Air Purity Engineering — ISO 8573 Application | ELIMFILTERS',
    description: 'Engineering application reference for selecting and interpreting compressed-air purity targets under ISO 8573 without replacing the formal standards reference.',
  },
};

export async function generateStaticParams() {
  return ERL_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const section = getERLSection(sectionSlug);
  if (!section) return { title: 'Not Found' };
  const override = SEO_INTENT_OVERRIDES[section.slug];
  return {
    title: override?.title || `${section.title} | Engineering Reference | ELIMFILTERS`,
    description: override?.description || section.definition.slice(0, 155),
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/engineering-reference/${section.slug}/`,
    },
  };
}

export default async function SectionPage({ params }: Props) {
  const { section: sectionSlug } = await params;
  const section = getERLSection(sectionSlug);
  if (!section) notFound();

  const currentIndex = ERL_SECTIONS.findIndex((s) => s.slug === section.slug);
  const prev = currentIndex > 0 ? ERL_SECTIONS[currentIndex - 1] : null;
  const next = currentIndex < ERL_SECTIONS.length - 1 ? ERL_SECTIONS[currentIndex + 1] : null;

  return <SectionContent section={section} prev={prev} next={next} />;
}
