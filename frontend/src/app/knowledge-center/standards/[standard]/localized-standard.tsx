import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_STANDARD_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedStandard } from '@/lib/knowledge-center-data/i18n/articles';
import StandardContent from './StandardContent';
import StandardApplyCta from './StandardApplyCta';

type Params = { params: Promise<{ standard: string }> };
const isTranslated = (slug: string) => (TRANSLATED_STANDARD_SLUGS as readonly string[]).includes(slug);

export function localizedStandardParams() {
  return TRANSLATED_STANDARD_SLUGS.map((standard) => ({ standard }));
}

export async function localizedStandardMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { standard } = await params;
  if (!isTranslated(standard)) return {};
  const std = translatedStandard(standard, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/standards/${standard}/`;
  const title = `${std.code}: ${std.title}`;
  return {
    title,
    description: std.metaDescription,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/standards/${standard}`) },
    openGraph: { title, description: std.metaDescription, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedStandardPage({ params }: Params, lang: 'es' | 'pt') {
  const { standard } = await params;
  if (!isTranslated(standard)) return notFound();
  return (
    <>
      <StandardContent std={translatedStandard(standard, lang)} />
      <StandardApplyCta />
    </>
  );
}
