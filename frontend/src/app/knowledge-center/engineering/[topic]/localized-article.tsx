import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_ARTICLE_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';
import { translatedArticle } from '@/lib/knowledge-center-data/i18n/articles';
import ArticleContent from './ArticleContent';
import ArticleApplyCta from './ArticleApplyCta';

type Params = { params: Promise<{ topic: string }> };
const isTranslated = (topic: string) => (TRANSLATED_ARTICLE_SLUGS as readonly string[]).includes(topic);

export function localizedArticleParams() {
  return TRANSLATED_ARTICLE_SLUGS.map((topic) => ({ topic }));
}

export async function localizedArticleMetadata({ params }: Params, lang: 'es' | 'pt'): Promise<Metadata> {
  const { topic } = await params;
  if (!isTranslated(topic)) return {};
  const article = translatedArticle(topic, lang);
  const url = `https://elimfilters.com/${lang}/knowledge-center/engineering/${topic}/`;
  const title = `${article.title} | ELIMFILTERS®`;
  return {
    title,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/engineering/${topic}`) },
    openGraph: { title, description: article.metaDescription, url, type: 'article', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
    twitter: { card: 'summary_large_image', title, description: article.metaDescription },
  };
}

export async function LocalizedArticlePage({ params }: Params, lang: 'es' | 'pt') {
  const { topic } = await params;
  if (!isTranslated(topic)) return notFound();
  return (
    <>
      <ArticleContent article={translatedArticle(topic, lang)} />
      <ArticleApplyCta />
    </>
  );
}
