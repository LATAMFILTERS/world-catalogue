import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_PROBLEM_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedProblem } from '@/lib/knowledge-center-data/i18n/articles';
import ProblemStubContent from './ProblemStubContent';

type Params = { params: Promise<{ slug: string }> };
const isTranslated = (slug: string) => (TRANSLATED_PROBLEM_SLUGS as readonly string[]).includes(slug);
const SUFFIX = { es: 'Análisis de fallas de filtración', pt: 'Análise de falhas de filtração' } as const;

export function localizedProblemParams() {
  return TRANSLATED_PROBLEM_SLUGS.map((slug) => ({ slug }));
}

export async function localizedProblemMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { slug } = await params;
  if (!isTranslated(slug)) return {};
  const problem = translatedProblem(slug, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/problems/${slug}/`;
  const title = `${problem.name} — ${SUFFIX[lang]} | ELIMFILTERS`;
  const description = problem.metaDescription ?? '';
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/problems/${slug}`) },
    openGraph: { title, description, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}

export async function LocalizedProblemPage({ params }: Params, lang: 'es' | 'pt') {
  const { slug } = await params;
  if (!isTranslated(slug)) return notFound();
  return <ProblemStubContent problem={translatedProblem(slug, lang)} />;
}
