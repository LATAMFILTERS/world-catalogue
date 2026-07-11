import { FAILURE_KNOWLEDGE } from './failure-knowledge';
import { PRODUCT_FAMILY_LIST } from './product-families-data';
import { PROTECTION_SYSTEM_LIST } from './protection-systems-data';

export type EntityRelationType =
  | 'owns'
  | 'contains-family'
  | 'uses-technology'
  | 'validated-by'
  | 'applied-in'
  | 'belongs-to'
  | 'controls-failure'
  | 'mitigates-failure'
  | 'addresses-failure'
  | 'exposed-to-failure';

export interface EntityRelation {
  readonly from: string;
  readonly to: string;
  readonly type: EntityRelationType;
}

export const normalizeStandardId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const relationKey = (relation: EntityRelation) =>
  `${relation.from}|${relation.type}|${relation.to}`;

function deduplicateRelations(relations: EntityRelation[]): EntityRelation[] {
  return Array.from(new Map(relations.map((relation) => [relationKey(relation), relation])).values());
}

const systemRelations: EntityRelation[] = PROTECTION_SYSTEM_LIST.flatMap((system) => [
  { from: 'organization:elimfilters', to: `system:${system.slug}`, type: 'owns' as const },
  ...system.productFamilies.map((family) => ({
    from: `system:${system.slug}`,
    to: `family:${family}`,
    type: 'contains-family' as const,
  })),
  ...[...system.primaryTechnologies, ...system.supportingTechnologies].map((technology) => ({
    from: `system:${system.slug}`,
    to: `technology:${technology}`,
    type: 'uses-technology' as const,
  })),
  ...system.relatedStandards.map((standard) => ({
    from: `system:${system.slug}`,
    to: `standard:${normalizeStandardId(standard)}`,
    type: 'validated-by' as const,
  })),
  ...system.relatedIndustries.map((industry) => ({
    from: `system:${system.slug}`,
    to: `industry:${industry}`,
    type: 'applied-in' as const,
  })),
]);

const familyRelations: EntityRelation[] = PRODUCT_FAMILY_LIST.flatMap((family) => [
  {
    from: `family:${family.slug}`,
    to: `system:${family.protectionSystem}`,
    type: 'belongs-to' as const,
  },
  {
    from: `family:${family.slug}`,
    to: `technology:${family.primaryTechnology}`,
    type: 'uses-technology' as const,
  },
  ...family.applicableStandards.map((standard) => ({
    from: `family:${family.slug}`,
    to: `standard:${normalizeStandardId(standard)}`,
    type: 'validated-by' as const,
  })),
]);

const failureRelations: EntityRelation[] = Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [
  ...failure.systems.map((slug) => ({
    from: `system:${slug}`,
    to: `failure:${failure.key}`,
    type: 'controls-failure' as const,
  })),
  ...failure.technologies.map((slug) => ({
    from: `technology:${slug}`,
    to: `failure:${failure.key}`,
    type: 'mitigates-failure' as const,
  })),
  ...failure.families.map((slug) => ({
    from: `family:${slug}`,
    to: `failure:${failure.key}`,
    type: 'controls-failure' as const,
  })),
  ...failure.standards.map((slug) => ({
    from: `standard:${slug}`,
    to: `failure:${failure.key}`,
    type: 'addresses-failure' as const,
  })),
  ...failure.industries.map((slug) => ({
    from: `industry:${slug}`,
    to: `failure:${failure.key}`,
    type: 'exposed-to-failure' as const,
  })),
]);

export const CANONICAL_ENTITY_RELATIONS: readonly EntityRelation[] = deduplicateRelations([
  ...systemRelations,
  ...familyRelations,
  ...failureRelations,
]);

export function getCanonicalOutgoingRelations(
  entityId: string,
  relationType?: EntityRelationType,
): EntityRelation[] {
  return CANONICAL_ENTITY_RELATIONS.filter(
    (relation) => relation.from === entityId && (!relationType || relation.type === relationType),
  );
}

export function getCanonicalIncomingRelations(
  entityId: string,
  relationType?: EntityRelationType,
): EntityRelation[] {
  return CANONICAL_ENTITY_RELATIONS.filter(
    (relation) => relation.to === entityId && (!relationType || relation.type === relationType),
  );
}
