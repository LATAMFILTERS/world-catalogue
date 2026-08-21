import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TERMINOLOGY_REGISTRY, getPublishedTerms, termIdToSlug, slugToTermId } from '@/lib/knowledge-center';
import GlossaryTermContent from './GlossaryTermContent';

export function generateStaticParams() {
  return getPublishedTerms().map((t) => ({ term: termIdToSlug(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: { term: string };
}): Promise<Metadata> {
  const id = slugToTermId(params.term);
  const entry = TERMINOLOGY_REGISTRY[id];
  if (!entry) return {};
  const isPublished = entry.status === 'published';
  const title = params.term === 'iso-cleanliness-code'
    ? 'ISO 4406 Cleanliness Code Explained — Glossary | ELIMFILTERS'
    : `${entry.term} — Glossary | ELIMFILTERS`;
  return {
    title,
    description: entry.definition.slice(0, 160),
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/glossary/${params.term}/`,
    },
    robots: {
      index: isPublished,
      follow: true,
    },
  };
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const id = slugToTermId(params.term);
  const entry = TERMINOLOGY_REGISTRY[id];
  if (!entry) return notFound();
  return <GlossaryTermContent entry={entry} slug={params.term} />;
}
