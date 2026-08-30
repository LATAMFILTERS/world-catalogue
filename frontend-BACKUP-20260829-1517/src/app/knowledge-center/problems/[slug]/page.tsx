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
  params: { slug: string };
}): Promise<Metadata> {
  const problem = PROBLEM_STUBS_BY_SLUG[params.slug];
  if (!problem) return {};
  const isPublished = problem.status === 'published' || problem.status === 'engineering-approved';
  return {
    title: `${problem.name} — Problem Graph | ELIMFILTERS`,
    description: `${problem.id}: ${problem.name}. Engineering content for this Knowledge Graph entity is scheduled for Phase 3.`,
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/problems/${params.slug}`,
    },
    robots: {
      index: isPublished,
      follow: true,
    },
  };
}

export default function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = PROBLEM_STUBS_BY_SLUG[params.slug];
  if (!problem) return notFound();
  return <ProblemStubContent problem={problem} />;
}
