import { PRODUCT_FAMILY_LIST } from './product-families-data';
import { PROTECTION_SYSTEM_LIST } from './protection-systems-data';

export type EntityKind = 'organization' | 'system' | 'family' | 'technology' | 'industry' | 'standard';

export interface EntityNode {
  readonly id: string;
  readonly kind: EntityKind;
  readonly name: string;
  readonly href: string;
}

export type EntityRelationType =
  | 'owns'
  | 'protects'
  | 'contains-family'
  | 'uses-technology'
  | 'validated-by'
  | 'applied-in'
  | 'belongs-to';

export interface EntityRelation {
  readonly from: string;
  readonly to: string;
  readonly type: EntityRelationType;
}

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));
export const normalizeStandardId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const STANDARD_ROUTES: Record<string, string> = {
  'iso-16889': '/knowledge-system/standards/iso-16889',
  'iso-4406': '/knowledge-system/standards/iso-4406',
  'iso-5011': '/knowledge-system/standards/iso-5011',
};

export function getStandardHref(standard: string): string {
  const id = normalizeStandardId(standard);
  return STANDARD_ROUTES[id] || `/knowledge-system/standards/${id}`;
}

const technologySlugs = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => [...system.primaryTechnologies, ...system.supportingTechnologies]),
  ...PRODUCT_FAMILY_LIST.map((family) => family.primaryTechnology),
]);
const industrySlugs = unique(PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedIndustries));
const standards = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedStandards),
  ...PRODUCT_FAMILY_LIST.flatMap((family) => family.applicableStandards),
]);

export const ENTITY_NODES: readonly EntityNode[] = [
  { id: 'organization:elimfilters', kind: 'organization', name: 'ELIMFILTERS', href: '/' },
  ...PROTECTION_SYSTEM_LIST.map((system) => ({ id: `system:${system.slug}`, kind: 'system' as const, name: system.name, href: `/systems/${system.slug}` })),
  ...PRODUCT_FAMILY_LIST.map((family) => ({ id: `family:${family.slug}`, kind: 'family' as const, name: family.name, href: `/families/${family.slug}` })),
  ...technologySlugs.map((slug) => ({ id: `technology:${slug}`, kind: 'technology' as const, name: slug.replace(/-/g, ' ').toUpperCase(), href: `/technologies/${slug}` })),
  ...industrySlugs.map((slug) => ({ id: `industry:${slug}`, kind: 'industry' as const, name: slug.replace(/-/g, ' '), href: `/industries/${slug}` })),
  ...standards.map((standard) => ({ id: `standard:${normalizeStandardId(standard)}`, kind: 'standard' as const, name: standard, href: getStandardHref(standard) })),
];

export const ENTITY_RELATIONS: readonly EntityRelation[] = [
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => [
    { from: 'organization:elimfilters', to: `system:${system.slug}`, type: 'owns' as const },
    ...system.productFamilies.map((family) => ({ from: `system:${system.slug}`, to: `family:${family}`, type: 'contains-family' as const })),
    ...[...system.primaryTechnologies, ...system.supportingTechnologies].map((technology) => ({ from: `system:${system.slug}`, to: `technology:${technology}`, type: 'uses-technology' as const })),
    ...system.relatedStandards.map((standard) => ({ from: `system:${system.slug}`, to: `standard:${normalizeStandardId(standard)}`, type: 'validated-by' as const })),
    ...system.relatedIndustries.map((industry) => ({ from: `system:${system.slug}`, to: `industry:${industry}`, type: 'applied-in' as const })),
  ]),
  ...PRODUCT_FAMILY_LIST.flatMap((family) => [
    { from: `family:${family.slug}`, to: `system:${family.protectionSystem}`, type: 'belongs-to' as const },
    { from: `family:${family.slug}`, to: `technology:${family.primaryTechnology}`, type: 'uses-technology' as const },
    ...family.applicableStandards.map((standard) => ({ from: `family:${family.slug}`, to: `standard:${normalizeStandardId(standard)}`, type: 'validated-by' as const })),
  ]),
];

const nodeById = new Map(ENTITY_NODES.map((node) => [node.id, node]));

export function getEntityNode(id: string): EntityNode | undefined {
  return nodeById.get(id);
}

export function getRelatedEntities(id: string, relationType?: EntityRelationType): EntityNode[] {
  return ENTITY_RELATIONS
    .filter((relation) => relation.from === id && (!relationType || relation.type === relationType))
    .map((relation) => nodeById.get(relation.to))
    .filter((node): node is EntityNode => Boolean(node));
}

export function getIncomingEntities(id: string, relationType?: EntityRelationType): EntityNode[] {
  return ENTITY_RELATIONS
    .filter((relation) => relation.to === id && (!relationType || relation.type === relationType))
    .map((relation) => nodeById.get(relation.from))
    .filter((node): node is EntityNode => Boolean(node));
}
