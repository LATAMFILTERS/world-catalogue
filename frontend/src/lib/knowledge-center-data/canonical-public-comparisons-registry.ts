import type { KCComparison, KCComparisonCategory } from './types';
import {
  KC_COMPARISONS as SEMANTIC_COMPARISONS,
} from './canonical-comparisons-registry';
import { isConsolidatedEngineeringTopic } from '../knowledge-center/canonical-article-ownership';

function isRetiredNfpaStandard(value: string): boolean {
  return /nfpa[\s-]*t2[.\s-]*14/i.test(value);
}

function isIso3724(value: string): boolean {
  return /iso[\s-]*3724/i.test(value);
}

function sanitizeRelations(comparison: KCComparison): KCComparison {
  const governingStandards = comparison.governingStandards
    .filter((standard) => !isRetiredNfpaStandard(standard))
    .filter((standard) => comparison.slug !== 'cellulose-vs-synthetic-media' || !isIso3724(standard));

  return {
    ...comparison,
    governingStandards,
    relatedStandards: comparison.relatedStandards.filter((standard) => !isRetiredNfpaStandard(standard)),
    relatedArticles: comparison.relatedArticles.filter((slug) => !isConsolidatedEngineeringTopic(slug)),
  };
}

/**
 * Final public Comparison registry.
 *
 * Semantic corrections happen in canonical-comparisons-registry.ts. This final
 * layer enforces graph/discovery hygiene across every comparison so retired
 * Standards, domain-mismatched governing references and consolidated Engineering
 * aliases cannot be reintroduced through lateral relationships.
 */
export const KC_COMPARISONS: KCComparison[] = SEMANTIC_COMPARISONS.map(sanitizeRelations);

export function getComparisonBySlug(slug: string): KCComparison | undefined {
  return KC_COMPARISONS.find((comparison) => comparison.slug === slug);
}

export function getComparisonsByCategory(category: KCComparisonCategory): KCComparison[] {
  return KC_COMPARISONS.filter((comparison) => comparison.category === category);
}
