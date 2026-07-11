import {
  getConnectedEntities,
  getEntityNode,
  type EntityKind,
  type EntityNode,
} from './entity-graph';

export interface SemanticRecommendation {
  readonly node: EntityNode;
  readonly score: number;
  readonly reason: 'direct-relationship' | 'shared-context';
}

const KIND_PRIORITY: Record<EntityKind, number> = {
  failure: 7,
  standard: 6,
  technology: 5,
  system: 4,
  family: 3,
  industry: 2,
  organization: 0,
};

function uniqueById(nodes: EntityNode[]): EntityNode[] {
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values());
}

export function getSemanticRecommendations(
  entityId: string,
  options: {
    limit?: number;
    includeKinds?: readonly EntityKind[];
  } = {},
): SemanticRecommendation[] {
  const source = getEntityNode(entityId);
  if (!source) return [];

  const limit = options.limit ?? 8;
  const includeKinds = options.includeKinds ?? [
    'system',
    'technology',
    'family',
    'standard',
    'industry',
    'failure',
  ];

  const direct = getConnectedEntities(entityId).filter((node) => node.kind !== 'organization');
  const directIds = new Set(direct.map((node) => node.id));

  const scored = new Map<string, SemanticRecommendation>();

  direct.forEach((node) => {
    if (!includeKinds.includes(node.kind)) return;
    scored.set(node.id, {
      node,
      score: 100 + KIND_PRIORITY[node.kind],
      reason: 'direct-relationship',
    });
  });

  uniqueById(direct.flatMap((node) => getConnectedEntities(node.id))).forEach((node) => {
    if (node.id === entityId || directIds.has(node.id) || node.kind === 'organization') return;
    if (!includeKinds.includes(node.kind)) return;

    const sharedContext = direct.filter((neighbor) =>
      getConnectedEntities(neighbor.id).some((candidate) => candidate.id === node.id),
    ).length;

    scored.set(node.id, {
      node,
      score: 40 + sharedContext * 10 + KIND_PRIORITY[node.kind],
      reason: 'shared-context',
    });
  });

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score || a.node.name.localeCompare(b.node.name))
    .slice(0, limit);
}
