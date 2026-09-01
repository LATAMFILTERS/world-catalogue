import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENGINEERING_DIAGRAMS, getDiagramBySlug } from '@/lib/knowledge-center-data';
import DiagramContent from './DiagramContent';

interface Props {
  params: Promise<{ diagram: string }>;
}

export async function generateStaticParams() {
  return ENGINEERING_DIAGRAMS.map((d) => ({ diagram: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { diagram: diagramSlug } = await params;
  const diagram = getDiagramBySlug(diagramSlug);
  if (!diagram) return {};
  const priorityTitles: Record<string, string> = {
    'iso-4406-cleanliness-scale': 'ISO 4406 Cleanliness Code Chart — Particle Count Scale | ELIMFILTERS',
    'iso-8573-purity-classes': 'ISO 8573-1 Purity Classes Chart — Compressed Air | ELIMFILTERS',
  };
  return {
    title: priorityTitles[diagram.slug] || `${diagram.title} — ELIMFILTERS Engineering Diagrams`,
    description: diagram.metaDescription,
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/diagrams/${diagram.slug}/`,
    },
  };
}

export default async function DiagramPage({ params }: Props) {
  const { diagram: diagramSlug } = await params;
  const diagram = getDiagramBySlug(diagramSlug);
  if (!diagram) notFound();
  return <DiagramContent diagram={diagram} />;
}
