import type { Metadata } from 'next';
import { KC_COMPARISONS, getComparisonBySlug } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ComparisonContent from './ComparisonContent';
import ComparisonApplyCta from './ComparisonApplyCta';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_COMPARISON_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';

const BASE_URL = 'https://elimfilters.com';

const SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'iso4406-vs-nas1638': {
    title: 'ISO 4406 vs NAS 1638: Fluid Cleanliness Codes | ELIMFILTERS',
    description: 'Compare ISO 4406 and NAS 1638 fluid cleanliness classification: particle-count structure, calibration basis, current use, limitations, and application context.',
  },
  'iso5011-vs-sae-j726': {
    title: 'ISO 5011 vs SAE J726: Air Cleaner Test Methods | ELIMFILTERS',
    description: 'Compare ISO 5011 and SAE J726 air-cleaner test methods, including dust capacity, restriction, efficiency, test conditions, and application context.',
  },
  'multipass-vs-single-pass-testing': {
    title: 'Multi-Pass vs Single-Pass Filter Testing | ELIMFILTERS',
    description: 'Compare multi-pass and single-pass filtration testing: what each method measures, how results differ, and when each test approach is relevant.',
  },
  'beta-ratio-vs-filtration-efficiency': {
    title: 'Beta Ratio vs Filtration Efficiency: What the Numbers Mean | ELIMFILTERS',
    description: 'Understand the relationship between beta ratio and filtration efficiency, how each metric is interpreted, and why test context matters.',
  },
};

export function generateStaticParams() {
  return KC_COMPARISONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return { title: 'Comparison Not Found' };

  const url = `${BASE_URL}/knowledge-center/comparisons/${slug}/`;
  const override = SEO_OVERRIDES[slug];
  const title = override?.title || comparison.title;
  const description = override?.description || comparison.subtitle || comparison.engineeringObjective;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...((TRANSLATED_COMPARISON_SLUGS as readonly string[]).includes(slug) ? { languages: languageAlternates(`/knowledge-center/comparisons/${slug}`) } : {}),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'ELIMFILTERS',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  return (
    <>
      <ComparisonContent comparison={comparison} />
      <ComparisonApplyCta />
    </>
  );
}
