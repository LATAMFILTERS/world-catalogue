import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_INDUSTRY_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedIndustry } from '@/lib/knowledge-center-data/i18n/articles';
import IndustryContent from './IndustryContent';

type Params = { params: Promise<{ slug: string }> };
const isTranslated = (slug: string) => (TRANSLATED_INDUSTRY_SLUGS as readonly string[]).includes(slug);
const SUFFIX = { es: 'Ingeniería de filtración', pt: 'Engenharia de filtração' } as const;

export function localizedIndustryParams() {
  return TRANSLATED_INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function localizedIndustryMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { slug } = await params;
  if (!isTranslated(slug)) return {};
  const { industry } = translatedIndustry(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/industries/${slug}/`;
  const title = `${industry.title} — ${SUFFIX[lang]}`;
  return {
    title,
    description: industry.description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/industries/${slug}`) },
    openGraph: { title: `${title} | ELIMFILTERS`, description: industry.description, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedIndustryPage({ params }: Params, lang: 'es' | 'pt') {
  const { slug } = await params;
  if (!isTranslated(slug)) return notFound();
  const { industry, detail } = translatedIndustry(slug, lang);
  return <IndustryContent industry={industry} detail={detail} />;
}
