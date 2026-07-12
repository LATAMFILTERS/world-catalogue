import {
  ENTITY_NODES,
  getConnectedEntities,
  getEntityNode,
  type EntityKind,
  type EntityNode,
} from './entity-graph';
import { getSemanticRecommendations } from './semantic-recommendations';

export type TopicalEntityKind = Exclude<EntityKind, 'organization'>;

export interface TopicClusterGroup {
  readonly kind: TopicalEntityKind;
  readonly label: string;
  readonly entities: readonly EntityNode[];
}

export interface TopicCluster {
  readonly entity: EntityNode;
  readonly hub: EntityNode;
  readonly groups: readonly TopicClusterGroup[];
  readonly recommended: readonly EntityNode[];
  readonly crawlLinks: readonly EntityNode[];
}

export interface TopicalAuthorityValidation {
  readonly missingClusters: string[];
  readonly emptyClusters: string[];
  readonly duplicateLinks: string[];
  readonly selfLinks: string[];
  readonly isValid: boolean;
}

const LABELS: Record<TopicalEntityKind, string> = {
  system: 'Protection Systems',
  technology: 'Technologies',
  family: 'Product Families',
  industry: 'Industries',
  standard: 'Standards',
  failure: 'Failure Modes',
};

const GROUP_ORDER: readonly TopicalEntityKind[] = [
  'system',
  'technology',
  'family',
  'standard',
  'failure',
  'industry',
];

function unique(nodes: readonly EntityNode[]): EntityNode[] {
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values());
}

function resolveHub(entity: EntityNode): EntityNode {
  if (entity.kind === 'system') return entity;
  const system = getConnectedEntities(entity.id, { targetKind: 'system' })[0];
  return system || entity;
}

export function buildTopicCluster(entityId: string): TopicCluster | undefined {
  const entity = getEntityNode(entityId);
  if (!entity || entity.kind === 'organization') return undefined;

  const direct = getConnectedEntities(entity.id);
  const groups = GROUP_ORDER
    .filter((kind) => kind !== entity.kind)
    .map((kind) => ({
      kind,
      label: LABELS[kind],
      entities: unique(direct.filter((node) => node.kind === kind)),
    }))
    .filter((group) => group.entities.length > 0);

  const directIds = new Set(direct.map((node) => node.id));
  const recommended = getSemanticRecommendations(entity.id, { limit: 16 })
    .map((entry) => entry.node)
    .filter((node) => node.id !== entity.id && !directIds.has(node.id))
    .slice(0, 8);

  return {
    entity,
    hub: resolveHub(entity),
    groups,
    recommended,
    crawlLinks: unique([...direct, ...recommended]),
  };
}

export function getTopicalLinks(entityId: string, limit = 18): EntityNode[] {
  const cluster = buildTopicCluster(entityId);
  return cluster ? cluster.crawlLinks.slice(0, limit) : [];
}

export function validateTopicalAuthority(): TopicalAuthorityValidation {
  const entities = ENTITY_NODES.filter((node) => node.kind !== 'organization');
  const clusters = entities.map((entity) => ({ entity, cluster: buildTopicCluster(entity.id) }));
  const missingClusters = clusters.filter(({ cluster }) => !cluster).map(({ entity }) => entity.id);
  const emptyClusters = clusters
    .filter(({ cluster }) => cluster && cluster.crawlLinks.length === 0)
    .map(({ entity }) => entity.id);
  const duplicateLinks: string[] = [];
  const selfLinks: string[] = [];

  clusters.forEach(({ entity, cluster }) => {
    if (!cluster) return;
    const ids = cluster.crawlLinks.map((node) => node.id);
    ids.filter((id, index) => ids.indexOf(id) !== index)
      .forEach((id) => duplicateLinks.push(`${entity.id}->${id}`));
    if (ids.includes(entity.id)) selfLinks.push(entity.id);
  });

  return {
    missingClusters,
    emptyClusters,
    duplicateLinks: Array.from(new Set(duplicateLinks)),
    selfLinks: Array.from(new Set(selfLinks)),
    isValid:
      missingClusters.length === 0 &&
      emptyClusters.length === 0 &&
      duplicateLinks.length === 0 &&
      selfLinks.length === 0,
  };
}
