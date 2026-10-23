import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_SYSTEM_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedSystem } from '@/lib/knowledge-center-data/i18n/articles';
import SystemContent from './SystemContent';

type Params = { params: Promise<{ slug: string }> };
const isTranslated = (slug: string) => (TRANSLATED_SYSTEM_SLUGS as readonly string[]).includes(slug);
const SUFFIX = { es: 'Sistema', pt: 'Sistema' } as const;

export function localizedSystemParams() {
  return TRANSLATED_SYSTEM_SLUGS.map((slug) => ({ slug }));
}

export async function localizedSystemMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { slug } = await params;
  if (!isTranslated(slug)) return {};
  const { system } = translatedSystem(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/systems/${slug}/`;
  const title = `${SUFFIX[lang]}: ${system.title}`;
  return {
    title,
    description: system.description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/systems/${slug}`) },
    openGraph: { title: `${title} | ELIMFILTERS`, description: system.description, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedSystemPage({ params }: Params, lang: 'es' | 'pt') {
  const { slug } = await params;
  if (!isTranslated(slug)) return notFound();
  const { system, detail } = translatedSystem(slug, lang);
  return <SystemContent system={system} detail={detail} />;
}
