import type { KCArticle } from './types';
import { ENGINEERING_ARTICLES as LEGACY_ENGINEERING_ARTICLES } from './articles-registry';

/**
 * Engineering articles allowed to participate in the current public Knowledge Center.
 * Historical article records remain preserved in articles-registry.ts for audit history.
 */
export const RETIRED_ENGINEERING_ARTICLE_SLUGS = new Set([
  'nfpa-t2-14-hydraulic-cleanliness',
]);

export const ENGINEERING_ARTICLES: KCArticle[] = LEGACY_ENGINEERING_ARTICLES.filter(
  (article) => !RETIRED_ENGINEERING_ARTICLE_SLUGS.has(article.slug),
);
