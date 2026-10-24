import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_GLOSSARY_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedTerm } from '@/lib/knowledge-center-data/i18n/articles';
import GlossaryTermContent from './GlossaryTermContent';

type Params = { params: Promise<{ term: string }> };
const isTranslated = (slug: string) => (TRANSLATED_GLOSSARY_SLUGS as readonly string[]).includes(slug);
const SUFFIX = { es: 'Glosario', pt: 'Glossário' } as const;

export function localizedGlossaryParams() {
  return TRANSLATED_GLOSSARY_SLUGS.map((term) => ({ term }));
}

export async function localizedGlossaryMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { term } = await params;
  if (!isTranslated(term)) return {};
  const entry = translatedTerm(term, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/glossary/${term}/`;
  const title = `${entry.term} — ${SUFFIX[lang]} | ELIMFILTERS`;
  const description = entry.definition.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/glossary/${term}`) },
    robots: { index: entry.status === 'published', follow: true },
    openGraph: { title, description, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedGlossaryPage({ params }: Params, lang: 'es' | 'pt') {
  const { term } = await params;
  if (!isTranslated(term)) return notFound();
  return <GlossaryTermContent entry={translatedTerm(term, lang)} slug={term} />;
}
