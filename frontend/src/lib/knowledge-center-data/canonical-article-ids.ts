import { ARTICLE_IDS as LEGACY_ARTICLE_IDS } from './entity-ids';

const {
  ['nfpa-t2-14-hydraulic-cleanliness']: _retiredNfpaArticle,
  ...CURRENT_ARTICLE_IDS
} = LEGACY_ARTICLE_IDS;

/** Current public Engineering article IDs. Historical IDs remain reserved. */
export const ARTICLE_IDS = CURRENT_ARTICLE_IDS;

export function getArticleId(slug: string): string | undefined {
  return (ARTICLE_IDS as Record<string, string>)[slug];
}
