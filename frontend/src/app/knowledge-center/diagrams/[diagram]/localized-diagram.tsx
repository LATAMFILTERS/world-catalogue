import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_DIAGRAM_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedDiagram } from '@/lib/knowledge-center-data/i18n/articles';
import DiagramContent from './DiagramContent';

type Params = { params: Promise<{ diagram: string }> };
const isTranslated = (slug: string) => (TRANSLATED_DIAGRAM_SLUGS as readonly string[]).includes(slug);
const SUFFIX = { es: 'Diagramas de ingeniería ELIMFILTERS', pt: 'Diagramas de engenharia ELIMFILTERS' } as const;

export function localizedDiagramParams() {
  return TRANSLATED_DIAGRAM_SLUGS.map((diagram) => ({ diagram }));
}

export async function localizedDiagramMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { diagram: slug } = await params;
  if (!isTranslated(slug)) return {};
  const diagram = translatedDiagram(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/diagrams/${slug}/`;
  const title = `${diagram.title} — ${SUFFIX[lang]}`;
  return {
    title,
    description: diagram.metaDescription,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/diagrams/${slug}`) },
    openGraph: { title, description: diagram.metaDescription, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedDiagramPage({ params }: Params, lang: 'es' | 'pt') {
  const { diagram: slug } = await params;
  if (!isTranslated(slug)) return notFound();
  return <DiagramContent diagram={translatedDiagram(slug, lang)} />;
}
