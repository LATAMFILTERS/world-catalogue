import { ANSWER_THE_PUBLIC_KEYWORD_NODES as RESEARCH_KEYWORD_NODES } from './keyword-intent-governance';

export type CanonicalKeywordOwnerKind =
  | 'standard'
  | 'comparison'
  | 'commercial'
  | 'engineering'
  | 'industry'
  | 'problem'
  | 'family'
  | 'system';

export interface CanonicalKeywordIntentNode {
  readonly keyword: string;
  readonly opportunity: 'high' | 'medium' | 'low';
  readonly volume?: number;
  readonly ownerKind: CanonicalKeywordOwnerKind;
  readonly ownerPath: string;
  readonly graphParents: readonly string[];
  readonly allowedSurfaces: readonly ('metadata' | 'body' | 'faq' | 'comparison' | 'product' | 'commercial')[];
  readonly publishingState: 'reinforce-existing' | 'owner-gap-review';
  readonly action: string;
}

const OWNER_OVERRIDES: Readonly<Record<string, Partial<CanonicalKeywordIntentNode>>> = {
  'diesel filter comparison': {
    ownerKind: 'comparison',
    ownerPath: '/knowledge-center/comparisons/single-stage-vs-multi-stage-fuel/',
    publishingState: 'reinforce-existing',
    action: 'Use the governed single-stage vs. multi-stage diesel fuel-filtration comparison as the single intent owner; product pages may support it without duplicating comparison metadata.',
  },
  'diesel fuel water contamination': {
    ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/water-ingress/',
    action: 'Use Water Ingress as the public problem owner for diesel-water contamination; keep diesel-water as an internal graph relation only.',
  },
  'fuel system contamination': {
    ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/fuel-contamination/',
    action: 'Use the published Fuel Contamination problem entity as owner and link to water-ingress and abrasive-wear mechanisms where relevant.',
  },
  'engine wear causes': {
    ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/abrasive-wear/',
    action: 'Use Abrasive Wear as the public failure-analysis owner; particle-wear remains an internal graph relationship, not a public problem slug.',
  },
  'industrial air filtration': {
    ownerKind: 'system',
    ownerPath: '/knowledge-center/systems/air-intake-protection/',
    action: 'Use Air Intake & Airflow Protection as the broad system owner; do not split cabin or compressed-air functions into standalone systems.',
  },
};

export const ANSWER_THE_PUBLIC_KEYWORD_NODES: readonly CanonicalKeywordIntentNode[] =
  RESEARCH_KEYWORD_NODES.map((node) => ({
    ...node,
    ...OWNER_OVERRIDES[node.keyword],
  })) as readonly CanonicalKeywordIntentNode[];

export function getKeywordIntentNode(keyword: string): CanonicalKeywordIntentNode | undefined {
  const normalized = keyword.trim().toLowerCase();
  return ANSWER_THE_PUBLIC_KEYWORD_NODES.find((node) => node.keyword === normalized);
}

export const KEYWORD_OWNER_GAPS = ANSWER_THE_PUBLIC_KEYWORD_NODES.filter(
  (node) => node.publishingState === 'owner-gap-review',
);

export const KEYWORD_INTENT_GOVERNANCE_RULES = {
  keywordIsNotPage: true,
  singleIntentOwner: true,
  noAutomaticIndexableRouteCreation: true,
  comparisonQueriesStayOutOfEngineeringMetadata: true,
  commercialQueriesStayOutOfTechnicalArticles: true,
  quantifiedOutcomeClaimsRequireEvidence: true,
} as const;
