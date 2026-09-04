import { CANONICAL_TECHNOLOGY_LIST } from './canonical-technologies';
import {
  CANONICAL_ENTITY_RELATIONS,
  getCanonicalIncomingRelations,
  getCanonicalOutgoingRelations,
  normalizeStandardId,
  type EntityRelation,
  type EntityRelationType,
} from './canonical-relationships';
import { FAILURE_KNOWLEDGE } from './failure-knowledge';
import { PRODUCT_FAMILY_LIST } from './product-families-data';
import { PROTECTION_SYSTEM_LIST } from './protection-systems-data';

export type EntityKind =
  | 'organization'
  | 'system'
  | 'family'
  | 'technology'
  | 'industry'
  | 'standard'
  | 'failure';

export interface EntityNode {
  readonly id: string;
  readonly kind: EntityKind;
  readonly name: string;
  readonly href: string;
}

export interface EntityConnection {
  readonly source: EntityNode;
  readonly target: EntityNode;
  readonly relation: EntityRelationType;
  readonly direction: 'outgoing' | 'incoming';
}

export type { EntityRelation, EntityRelationType };
export { normalizeStandardId };

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

/**
 * Canonical corporate industry registry for the entity graph.
 * Industry existence must not depend on whether a current system/failure edge happens to reference it.
 */
const INDUSTRY_NAMES: Record<string, string> = {
  agriculture: 'Agriculture',
  automotive: 'Automotive & Light Duty',
  'bus-coach': 'Bus & Coach',
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  marine: 'Marine',
  mining: 'Mining',
  'oil-gas': 'Oil & Gas',
  'power-generation': 'Power Generation',
  railway: 'Railway',
  'trucks-fleets': 'Commercial Truck Fleets',
  'waste-municipal': 'Waste & Municipal Fleets',
};

export function getStandardHref(standard: string): string {
  return `/knowledge-center/standards/${normalizeStandardId(standard)}/`;
}

const industrySlugs = Object.keys(INDUSTRY_NAMES);

const standardNameById = new Map<string, string>();
[
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedStandards),
  ...PRODUCT_FAMILY_LIST.flatMap((family) => family.applicableStandards),
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [...failure.standards]),
].forEach((standard) => {
  const id = normalizeStandardId(standard);
  if (!standardNameById.has(id) || /[A-Z]/.test(standard)) {
    standardNameById.set(id, standard);
  }
});

const standardNodes = Array.from(standardNameById.entries()).map(([id, name]) => ({
  id: `standard:${id}`,
  kind: 'standard' as const,
  name,
  href: `/knowledge-center/standards/${id}/`,
}));

export const ENTITY_NODES: readonly EntityNode[] = [
  { id: 'organization:elimfilters', kind: 'organization', name: 'ELIMFILTERS®', href: '/' },
  ...PROTECTION_SYSTEM_LIST.map((system) => ({
    id: `system:${system.slug}`,
    kind: 'system' as const,
    name: system.name,
    href: `/systems/${system.slug}/`,
  })),
  ...PRODUCT_FAMILY_LIST.map((family) => ({
    id: `family:${family.slug}`,
    kind: 'family' as const,
    name: family.name,
    href: `/families/${family.slug}/`,
  })),
  ...CANONICAL_TECHNOLOGY_LIST.map((technology) => ({
    id: `technology:${technology.slug}`,
    kind: 'technology' as const,
    name: technology.name,
    href: `/technologies/${technology.slug}/`,
  })),
  ...industrySlugs.map((slug) => ({
    id: `industry:${slug}`,
    kind: 'industry' as const,
    name: INDUSTRY_NAMES[slug],
    href: `/industries/${slug}/`,
  })),
  ...standardNodes,
  ...Object.values(FAILURE_KNOWLEDGE).map((failure) => ({
    id: `failure:${failure.key}`,
    kind: 'failure' as const,
    name: failure.name,
    href: failure.href,
  })),
];

export const ENTITY_RELATIONS: readonly EntityRelation[] = CANONICAL_ENTITY_RELATIONS;

const nodeById = new Map(ENTITY_NODES.map((node) => [node.id, node]));

export function getEntityNode(id: string): EntityNode | undefined {
  return nodeById.get(id);
}

export function getRelatedEntities(id: string, relationType?: EntityRelationType): EntityNode[] {
  return getCanonicalOutgoingRelations(id, relationType)
    .map((relation) => nodeById.get(relation.to))
    .filter((node): node is EntityNode => Boolean(node));
}

export function getIncomingEntities(id: string, relationType?: EntityRelationType): EntityNode[] {
  return getCanonicalIncomingRelations(id, relationType)
    .map((relation) => nodeById.get(relation.from))
    .filter((node): node is EntityNode => Boolean(node));
}

export function getEntityConnections(
  id: string,
  options: {
    relationType?: EntityRelationType;
    targetKind?: EntityKind;
  } = {},
): EntityConnection[] {
  const sourceNode = nodeById.get(id);
  if (!sourceNode) return [];

  const outgoing = getCanonicalOutgoingRelations(id, options.relationType)
    .map((relation) => {
      const target = nodeById.get(relation.to);
      return target
        ? { source: sourceNode, target, relation: relation.type, direction: 'outgoing' as const }
        : null;
    });

  const incoming = getCanonicalIncomingRelations(id, options.relationType)
    .map((relation) => {
      const source = nodeById.get(relation.from);
      return source
        ? { source: sourceNode, target: source, relation: relation.type, direction: 'incoming' as const }
        : null;
    });

  return [...outgoing, ...incoming]
    .filter((connection): connection is EntityConnection => Boolean(connection))
    .filter((connection) => !options.targetKind || connection.target.kind === options.targetKind)
    .filter((connection, index, all) =>
      all.findIndex((candidate) =>
        candidate.target.id === connection.target.id &&
        candidate.relation === connection.relation &&
        candidate.direction === connection.direction,
      ) === index,
    );
}

export function getConnectedEntities(
  id: string,
  options: {
    relationType?: EntityRelationType;
    targetKind?: EntityKind;
  } = {},
): EntityNode[] {
  return getEntityConnections(id, options)
    .map((connection) => connection.target)
    .filter((node, index, all) => all.findIndex((candidate) => candidate.id === node.id) === index);
}

export interface EntityGraphValidation {
  readonly duplicateNodeIds: string[];
  readonly orphanRelationEndpoints: string[];
  readonly duplicateRelations: string[];
  readonly isolatedNodeIds: string[];
  readonly isValid: boolean;
}

export function validateEntityGraph(): EntityGraphValidation {
  const nodeIds = ENTITY_NODES.map((node) => node.id);
  const duplicateNodeIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
  const nodeIdSet = new Set(nodeIds);
  const orphanRelationEndpoints = unique(
    ENTITY_RELATIONS.flatMap((relation) => [relation.from, relation.to]).filter((id) => !nodeIdSet.has(id)),
  );
  const relationKeys = ENTITY_RELATIONS.map((relation) => `${relation.from}|${relation.type}|${relation.to}`);
  const duplicateRelations = relationKeys.filter((key, index) => relationKeys.indexOf(key) !== index);
  const connectedNodeIds = new Set(ENTITY_RELATIONS.flatMap((relation) => [relation.from, relation.to]));
  const isolatedNodeIds = nodeIds.filter((id) => !connectedNodeIds.has(id));

  return {
    duplicateNodeIds: unique(duplicateNodeIds),
    orphanRelationEndpoints,
    duplicateRelations: unique(duplicateRelations),
    isolatedNodeIds,
    isValid:
      duplicateNodeIds.length === 0 &&
      orphanRelationEndpoints.length === 0 &&
      duplicateRelations.length === 0 &&
      isolatedNodeIds.length === 0,
  };
}
