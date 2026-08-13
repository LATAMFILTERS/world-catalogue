import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENGINEERING_DIAGRAMS, getDiagramBySlug } from '@/lib/knowledge-center-data';
import DiagramPublicContent from './DiagramPublicContent';

interface Props { params: { diagram: string } }

export async function generateStaticParams() {
  return ENGINEERING_DIAGRAMS.filter((diagram) => diagram.revisionMetadata.status === 'current').map((diagram) => ({ diagram: diagram.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const diagram = getDiagramBySlug(params.diagram);
  if (!diagram) return {};
  const current = diagram.revisionMetadata.status === 'current';
  return {
    title: `${diagram.title} — ELIMFILTERS Engineering Diagrams`,
    description: diagram.metaDescription,
    alternates: { canonical: `https://elimfilters.com/knowledge-center/diagrams/${diagram.slug}/` },
    robots: { index: current, follow: true },
  };
}

export default function DiagramPage({ params }: Props) {
  const diagram = getDiagramBySlug(params.diagram);
  if (!diagram) notFound();
  return <DiagramPublicContent diagram={diagram} />;
}
