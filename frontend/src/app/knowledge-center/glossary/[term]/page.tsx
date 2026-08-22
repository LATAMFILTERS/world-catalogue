import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TERMINOLOGY_REGISTRY, getPublishedTerms, termIdToSlug, slugToTermId } from '@/lib/knowledge-center';
import GlossaryTermContent from './GlossaryTermContent';

const SEO_INTENT_OVERRIDES: Record<string, { title: string; description: string }> = {
  'iso-cleanliness-code': {
    title: 'ISO 4406 Cleanliness Code Explained — Glossary | ELIMFILTERS',
    description: 'Definition of the ISO 4406 cleanliness code and what its three-number particle contamination classification means in fluid cleanliness terminology.',
  },
  'differential-pressure': {
    title: 'Differential Pressure Definition — Filtration Glossary | ELIMFILTERS',
    description: 'Definition of differential pressure (ΔP) in filtration terminology, including what pressure difference across a filter element represents.',
  },
  'depth-filtration': {
    title: 'Depth Filtration Definition — Filter Media Glossary | ELIMFILTERS',
    description: 'Definition of depth filtration as a filter-media mechanism in which particles are captured through the thickness of the media structure.',
  },
  'compressed-air-purity': {
    title: 'Compressed Air Purity Definition — Filtration Glossary | ELIMFILTERS',
    description: 'Definition of compressed-air purity as a terminology concept; use the ISO 8573 reference for formal purity classes and limits.',
  },
};

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
  const override = SEO_INTENT_OVERRIDES[params.term];
  return {
    title: override?.title || `${entry.term} — Glossary | ELIMFILTERS`,
    description: override?.description || entry.definition.slice(0, 160),
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
