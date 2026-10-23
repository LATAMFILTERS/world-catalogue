import type { Metadata } from 'next';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { getEngineeringTopicCanonicalOwner } from '@/lib/knowledge-center/canonical-article-ownership';
import { notFound } from 'next/navigation';
import ArticleContent from './ArticleContent';
import ArticleApplyCta from './ArticleApplyCta';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_ARTICLE_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';

const CTR_OVERRIDES: Record<string, { title: string; description: string }> = {
  'airflow-engineering': {
    title: 'Airflow Engineering: Restriction, Pressure Drop & Engine Impact | ELIMFILTERS®',
    description: 'Deep engineering analysis of air-filter restriction, pressure drop, volumetric efficiency and engine impact; use Engineering Reference for the structured application framework.',
  },
  'fluid-cleanliness': {
    title: 'Fluid Cleanliness: ISO 4406 Targets, Particle Counting & Oil Analysis | ELIMFILTERS®',
    description: 'Deep technical analysis of ISO 4406 target codes, particle counting and oil-analysis interpretation; use Engineering Reference for the structured cleanliness-management framework.',
  },
  'compressed-air-quality-verification': {
    title: 'Compressed Air Quality Verification | ELIMFILTERS®',
    description: 'How compressed-air quality is verified using contamination, moisture and purity measurements for industrial air systems and maintenance decisions.',
  },
  'cooling-system-contamination': {
    title: 'Cooling System Contamination: Causes & Control | ELIMFILTERS®',
    description: 'Technical guide to cooling-system contamination, deposit formation, fluid condition and protection decisions for industrial and heavy-duty equipment.',
  },
  'hpcr-fuel-system-cleanliness': {
    title: 'HPCR Fuel System Cleanliness & Contamination Control | ELIMFILTERS®',
    description: 'Technical guidance for high-pressure common-rail fuel cleanliness, particle and water contamination control, and application-level protection decisions.',
  },
  'filter-housing-design': {
    title: 'Filter Housing Design: Flow, Sealing & Application | ELIMFILTERS®',
    description: 'Engineering reference for filter housing design, including flow path, sealing, restriction, structural considerations and application suitability.',
  },
};

const CTR_1_METADATA: Record<string, { title: string; description: string }> = {
  'iso-4548-lube-filter-test-methods': {
    title: "ISO 4548 Oil Filter Tests: Efficiency, Bypass & Burst",
    description: "Compare oil filters using ISO 4548 results. Understand Part 12 efficiency, bypass-valve pressure, cold-start performance and burst strength.",
  },
};

export function generateStaticParams() {
  return ENGINEERING_ARTICLES.map((a) => ({ topic: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === topic);
  if (!article) return {};

  const url = `https://elimfilters.com/knowledge-center/engineering/${topic}/`;
  const canonicalOwnerUrl = getEngineeringTopicCanonicalOwner(topic);
  const override = CTR_OVERRIDES[topic];
  const title = override?.title ?? article.title;
  const description = override?.description ?? article.metaDescription;

  return {
    title: CTR_1_METADATA[topic]?.title ?? title,
    description: CTR_1_METADATA[topic]?.description ?? description,
    keywords: article.keywords,
    alternates: {
      canonical: canonicalOwnerUrl ?? url,
      ...((TRANSLATED_ARTICLE_SLUGS as readonly string[]).includes(topic) ? { languages: languageAlternates(`/knowledge-center/engineering/${topic}`) } : {}),
    },
    robots: canonicalOwnerUrl ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonicalOwnerUrl ?? url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function EngineeringArticlePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === topic);
  if (!article) return notFound();

  return (
    <>
      <ArticleContent article={article} />

      <ArticleApplyCta />
    </>
  );
}
