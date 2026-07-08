import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENGINEERING_DIAGRAMS, getDiagramBySlug } from '@/lib/knowledge-center-data';
import DiagramContent from './DiagramContent';

interface Props {
  params: { diagram: string };
}

export async function generateStaticParams() {
  return ENGINEERING_DIAGRAMS.map((d) => ({ diagram: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const diagram = getDiagramBySlug(params.diagram);
  if (!diagram) return {};
  return {
    title: `${diagram.title} — ELIMFILTERS Engineering Diagrams`,
    description: diagram.metaDescription,
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/diagrams/${diagram.slug}`,
    },
  };
}

export default function DiagramPage({ params }: Props) {
  const diagram = getDiagramBySlug(params.diagram);
  if (!diagram) notFound();
  return <DiagramContent diagram={diagram} />;
}
