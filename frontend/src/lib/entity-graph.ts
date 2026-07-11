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

export type { EntityRelation, EntityRelationType };
export { normalizeStandardId };

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

const INDUSTRY_NAMES: Record<string, string> = {
  agriculture: 'Agriculture',
  automotive: 'Automotive',
  'bus-coach': 'Bus & Coach',
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  marine: 'Marine',
  mining: 'Mining',
  'oil-gas': 'Oil & Gas',
  'power-generation': 'Power Generation',
  railway: 'Railway',
  'trucks-fleets': 'Truck Fleets',
  'waste-municipal': 'Waste & Municipal',
};

export function getStandardHref(standard: string): string {
  return `/knowledge-system/standards/${normalizeStandardId(standard)}`;
}

const industrySlugs = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedIndustries),
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [...failure.industries]),
]);

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
  href: `/knowledge-system/standards/${id}`,
}));

export const ENTITY_NODES: readonly EntityNode[] = [
  { id: 'organization:elimfilters', kind: 'organization', name: 'ELIMFILTERS®', href: '/' },
  ...PROTECTION_SYSTEM_LIST.map((system) => ({
    id: `system:${system.slug}`,
    kind: 'system' as const,
    name: system.name,
    href: `/systems/${system.slug}`,
  })),
  ...PRODUCT_FAMILY_LIST.map((family) => ({
    id: `family:${family.slug}`,
    kind: 'family' as const,
    name: family.name,
    href: `/families/${family.slug}`,
  })),
  ...CANONICAL_TECHNOLOGY_LIST.map((technology) => ({
    id: `technology:${technology.slug}`,
    kind: 'technology' as const,
    name: technology.name,
    href: `/technologies/${technology.slug}`,
  })),
  ...industrySlugs.map((slug) => ({
    id: `industry:${slug}`,
    kind: 'industry' as const,
    name: INDUSTRY_NAMES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    href: `/industries/${slug}`,
  })),
  ...standardNodes,
  ...Object.values(FAILURE_KNOWLEDGE).map((failure) => ({
    id: `failure:${failure.key}`,
    kind: 'failure' as const,
    name: failure.name,
    href: `/knowledge-system/contamination/${failure.key}`,
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

export interface EntityGraphValidation {
  readonly duplicateNodeIds: string[];
  readonly orphanRelationEndpoints: string[];
  readonly duplicateRelations: string[];
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

  return {
    duplicateNodeIds: unique(duplicateNodeIds),
    orphanRelationEndpoints,
    duplicateRelations: unique(duplicateRelations),
    isValid:
      duplicateNodeIds.length === 0 &&
      orphanRelationEndpoints.length === 0 &&
      duplicateRelations.length === 0,
  };
}
