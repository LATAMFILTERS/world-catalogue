import {
  ANSWER_THE_PUBLIC_KEYWORD_NODES,
  type CanonicalKeywordIntentNode,
} from './canonical-keyword-intent-governance';

export type KeywordDemandRelationType = 'owned-by' | 'supports-entity';

export interface KeywordDemandNode {
  readonly id: string;
  readonly keyword: string;
  readonly ownerPath: string;
  readonly ownerKind: CanonicalKeywordIntentNode['ownerKind'];
  readonly opportunity: CanonicalKeywordIntentNode['opportunity'];
  readonly volume?: number;
  readonly publishingState: CanonicalKeywordIntentNode['publishingState'];
  readonly publicEntity: false;
  readonly indexable: false;
}

export interface KeywordDemandRelation {
  readonly from: string;
  readonly to: string;
  readonly type: KeywordDemandRelationType;
}

function keywordNodeId(keyword: string): string {
  return `query:${keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export const KEYWORD_DEMAND_NODES: readonly KeywordDemandNode[] = ANSWER_THE_PUBLIC_KEYWORD_NODES.map((node) => ({
  id: keywordNodeId(node.keyword),
  keyword: node.keyword,
  ownerPath: node.ownerPath,
  ownerKind: node.ownerKind,
  opportunity: node.opportunity,
  ...(node.volume ? { volume: node.volume } : {}),
  publishingState: node.publishingState,
  publicEntity: false,
  indexable: false,
}));

export const KEYWORD_DEMAND_RELATIONS: readonly KeywordDemandRelation[] = ANSWER_THE_PUBLIC_KEYWORD_NODES.flatMap((node) => {
  const queryId = keywordNodeId(node.keyword);
  return [
    { from: queryId, to: `owner:${node.ownerPath}`, type: 'owned-by' as const },
    ...node.graphParents.map((parent) => ({ from: queryId, to: parent, type: 'supports-entity' as const })),
  ];
});

export function getKeywordDemandNode(keyword: string): KeywordDemandNode | undefined {
  const normalized = keyword.trim().toLowerCase();
  return KEYWORD_DEMAND_NODES.find((node) => node.keyword === normalized);
}

export function getKeywordDemandRelations(keyword: string): KeywordDemandRelation[] {
  const node = getKeywordDemandNode(keyword);
  if (!node) return [];
  return KEYWORD_DEMAND_RELATIONS.filter((relation) => relation.from === node.id);
}

/**
 * Demand nodes are deliberately isolated from the canonical public entity graph.
 * Consumers may use them for SEO planning, HERMES research prioritization and
 * editorial gap detection, but must not feed them into sitemap or route generation.
 */
export const KEYWORD_DEMAND_GRAPH_POLICY = {
  includeInCanonicalEntityNodes: false,
  includeInSitemap: false,
  createRoutesAutomatically: false,
  mayDriveEditorialReview: true,
  mayDriveHermesPrioritization: true,
} as const;
