import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProblemStubContent from './ProblemStubContent';
import { PROBLEM_STUBS, PROBLEM_STUBS_BY_SLUG } from '@/lib/knowledge-center';

export function generateStaticParams() {
  return PROBLEM_STUBS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = PROBLEM_STUBS_BY_SLUG[slug];
  if (!problem) return {};
  const isPublished = problem.status === 'published' || problem.status === 'engineering-approved';
  const isDustIngestionAlias = slug === 'silicon-dust-ingestion';
  return {
    title: `${problem.name} — Problem Graph | ELIMFILTERS`,
    description: isDustIngestionAlias
      ? 'This graph alias consolidates into the complete ELIMFILTERS dust-ingestion engineering reference.'
      : `${problem.id}: ${problem.name}. Engineering content for this Knowledge Graph entity is scheduled for Phase 3.`,
    alternates: {
      canonical: isDustIngestionAlias
        ? 'https://elimfilters.com/engineering/dust-ingestion/'
        : `https://elimfilters.com/knowledge-center/problems/${slug}/`,
    },
    robots: {
      index: isPublished && !isDustIngestionAlias,
      follow: true,
    },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = PROBLEM_STUBS_BY_SLUG[slug];
  if (!problem) return notFound();
  return <ProblemStubContent problem={problem} />;
}
