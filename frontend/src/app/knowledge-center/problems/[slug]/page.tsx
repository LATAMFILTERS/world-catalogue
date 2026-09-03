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
  const hasApprovedContent = Boolean(problem.metaDescription && problem.definition && problem.sections?.length);
  const isDustIngestionAlias = slug === 'silicon-dust-ingestion';
  const shouldIndex = isPublished && hasApprovedContent && !isDustIngestionAlias;
  const description = isDustIngestionAlias
    ? 'This graph alias consolidates into the complete ELIMFILTERS dust-ingestion engineering reference.'
    : problem.metaDescription || `${problem.name} engineering problem reference for contamination and filtration analysis.`;

  return {
    title: `${problem.name} — Filtration Failure Analysis | ELIMFILTERS`,
    description,
    alternates: {
      canonical: isDustIngestionAlias
        ? 'https://elimfilters.com/engineering/dust-ingestion/'
        : `https://elimfilters.com/knowledge-center/problems/${slug}/`,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    openGraph: {
      title: `${problem.name} — Filtration Failure Analysis | ELIMFILTERS`,
      description,
      url: isDustIngestionAlias
        ? 'https://elimfilters.com/engineering/dust-ingestion/'
        : `https://elimfilters.com/knowledge-center/problems/${slug}/`,
      type: 'article',
    },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = PROBLEM_STUBS_BY_SLUG[slug];
  if (!problem) return notFound();
  return <ProblemStubContent problem={problem} />;
}
