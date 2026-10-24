import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_COMPARISON_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedComparison } from '@/lib/knowledge-center-data/i18n/articles';
import ComparisonContent from './ComparisonContent';
import ComparisonApplyCta from './ComparisonApplyCta';

type Params = { params: Promise<{ slug: string }> };
const isTranslated = (slug: string) => (TRANSLATED_COMPARISON_SLUGS as readonly string[]).includes(slug);

export function localizedComparisonParams() {
  return TRANSLATED_COMPARISON_SLUGS.map((slug) => ({ slug }));
}

export async function localizedComparisonMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { slug } = await params;
  if (!isTranslated(slug)) return {};
  const c = translatedComparison(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/comparisons/${slug}/`;
  const title = `${c.title} | ELIMFILTERS`;
  const description = c.subtitle || c.engineeringObjective;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/comparisons/${slug}`) },
    openGraph: { title, description, url, type: 'article', siteName: 'ELIMFILTERS', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedComparisonPage({ params }: Params, lang: 'es' | 'pt') {
  const { slug } = await params;
  if (!isTranslated(slug)) return notFound();
  return (
    <>
      <ComparisonContent comparison={translatedComparison(slug, lang)} />
      <ComparisonApplyCta />
    </>
  );
}
