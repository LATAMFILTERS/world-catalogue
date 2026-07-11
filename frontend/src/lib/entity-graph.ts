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

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));
export const normalizeStandardId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const TECHNOLOGY_NAMES: Record<string, string> = {
  macrocore: 'MACROCORE™',
  intekcore: 'INTEKCORE™',
  microkappa: 'MICROKAPPA™',
  drycore: 'DRYCORE™',
  syntepore: 'SYNTEPORE™',
  aquaguard: 'AQUAGUARD™',
  syntrax: 'SYNTRAX™',
  nanoforce: 'NANOFORCE™',
  thermacore: 'THERMACORE™',
};

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

const technologySlugs = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => [...system.primaryTechnologies, ...system.supportingTechnologies]),
  ...PRODUCT_FAMILY_LIST.map((family) => family.primaryTechnology),
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [...failure.technologies]),
]);
const industrySlugs = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedIndustries),
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [...failure.industries]),
]);
const standards = unique([
  ...PROTECTION_SYSTEM_LIST.flatMap((system) => system.relatedStandards),
  ...PRODUCT_FAMILY_LIST.flatMap((family) => family.applicableStandards),
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [...failure.standards]),
]);

export const ENTITY_NODES: readonly EntityNode[] = [
  { id: 'organization:elimfilters', kind: 'organization', name: 'ELIMFILTERS®', href: '/' },
  ...PROTECTION_SYSTEM_LIST.map((system) => ({ id: `system:${system.slug}`, kind: 'system' as const, name: system.name, href: `/systems/${system.slug}` })),
  ...PRODUCT_FAMILY_LIST.map((family) => ({ id: `family:${family.slug}`, kind: 'family' as const, name: family.name, href: `/families/${family.slug}` })),
  ...technologySlugs.map((slug) => ({ id: `technology:${slug}`, kind: 'technology' as const, name: TECHNOLOGY_NAMES[slug] || slug.replace(/-/g, ' ').toUpperCase(), href: `/technologies/${slug}` })),
  ...industrySlugs.map((slug) => ({ id: `industry:${slug}`, kind: 'industry' as const, name: INDUSTRY_NAMES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()), href: `/industries/${slug}` })),
  ...standards.map((standard) => ({ id: `standard:${normalizeStandardId(standard)}`, kind: 'standard' as const, name: standard, href: getStandardHref(standard) })),
  ...Object.values(FAILURE_KNOWLEDGE).map((failure) => ({ id: `failure:${failure.key}`, kind: 'failure' as const, name: failure.name, href: `/knowledge-system/contamination/${failure.key}` })),
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
  ...Object.values(FAILURE_KNOWLEDGE).flatMap((failure) => [
    ...failure.systems.map((slug) => ({ from: `system:${slug}`, to: `failure:${failure.key}`, type: 'controls-failure' as const })),
    ...failure.technologies.map((slug) => ({ from: `technology:${slug}`, to: `failure:${failure.key}`, type: 'mitigates-failure' as const })),
    ...failure.families.map((slug) => ({ from: `family:${slug}`, to: `failure:${failure.key}`, type: 'controls-failure' as const })),
    ...failure.standards.map((slug) => ({ from: `standard:${slug}`, to: `failure:${failure.key}`, type: 'addresses-failure' as const })),
    ...failure.industries.map((slug) => ({ from: `industry:${slug}`, to: `failure:${failure.key}`, type: 'exposed-to-failure' as const })),
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
