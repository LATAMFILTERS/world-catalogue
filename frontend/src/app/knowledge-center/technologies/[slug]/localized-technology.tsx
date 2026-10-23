import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_TECHNOLOGY_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedTechnology } from '@/lib/knowledge-center-data/i18n/articles';
import TechContent from './TechContent';

type Params = { params: Promise<{ slug: string }> };
const isTranslated = (slug: string) => (TRANSLATED_TECHNOLOGY_SLUGS as readonly string[]).includes(slug);
const LABEL = { es: 'Tecnología de filtración', pt: 'Tecnologia de filtração' } as const;

export function localizedTechnologyParams() {
  return TRANSLATED_TECHNOLOGY_SLUGS.map((slug) => ({ slug }));
}

export async function localizedTechnologyMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { slug } = await params;
  if (!isTranslated(slug)) return {};
  const tech = translatedTechnology(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/technologies/${slug}/`;
  const title = `${tech.name} — ${LABEL[lang]}`;
  return {
    title,
    description: tech.tagline,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/technologies/${slug}`) },
    openGraph: { title: `${title} | ELIMFILTERS`, description: tech.tagline, url, type: 'article', siteName: 'ELIMFILTERS', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedTechnologyPage({ params }: Params, lang: 'es' | 'pt') {
  const { slug } = await params;
  if (!isTranslated(slug)) return notFound();
  return <TechContent tech={translatedTechnology(slug, lang)} />;
}
