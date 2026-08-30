import type { TechnologySlug } from './canonical-technologies';

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

export const SYSTEM_RELATIONSHIPS = {
  'air-intake': {
    primaryTechnologies: ['macrocore'] as TechnologySlug[],
    supportingTechnologies: ['intekcore', 'microkappa', 'drycore'] as TechnologySlug[],
    productFamilies: ['primary-air', 'secondary-air', 'air-cleaner-housings', 'cabin-filters', 'air-dryer-filters'],
    // Standards are intentionally not modeled at system level: air-intake spans
    // sub-domains (engine intake, cabin air, pneumatic air-drying) with distinct,
    // non-interchangeable standards. A system-level list lets the entity graph
    // attribute any one standard to every technology sharing this system,
    // regardless of which sub-domain it actually applies to. Standards are
    // modeled per product family (FAMILY_RELATIONSHIPS below), each of which
    // maps to exactly one technology.
    standards: [] as string[],
    industries: ['mining', 'agriculture', 'construction', 'trucks-fleets', 'power-generation', 'marine', 'oil-gas', 'railway', 'bus-coach', 'manufacturing', 'waste-municipal'],
    relatedSystems: ['fuel-cleanliness', 'lubrication', 'cooling-system'],
  },
  'fuel-cleanliness': {
    primaryTechnologies: ['syntapore', 'hydrocore'] as TechnologySlug[],
    supportingTechnologies: [] as TechnologySlug[],
    productFamilies: ['primary-fuel', 'secondary-fuel', 'fuel-water-separators'],
    standards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    industries: ['mining', 'agriculture', 'power-generation', 'marine', 'oil-gas', 'construction', 'trucks-fleets'],
    relatedSystems: ['air-intake', 'lubrication'],
  },
  lubrication: {
    primaryTechnologies: ['syntrax'] as TechnologySlug[],
    supportingTechnologies: [] as TechnologySlug[],
    productFamilies: ['oil-filters'],
    standards: ['ISO 4406', 'ISO 16889'],
    industries: ['trucks-fleets', 'mining', 'agriculture', 'construction', 'power-generation', 'marine', 'bus-coach', 'railway'],
    relatedSystems: ['air-intake', 'fuel-cleanliness', 'cooling-system'],
  },
  hydraulic: {
    primaryTechnologies: ['nanoforce'] as TechnologySlug[],
    supportingTechnologies: [] as TechnologySlug[],
    productFamilies: ['hydraulic-filters'],
    standards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'DIN 51524'],
    industries: ['construction', 'mining', 'manufacturing', 'marine', 'agriculture'],
    relatedSystems: ['lubrication', 'fuel-cleanliness'],
  },
  'cooling-system': {
    primaryTechnologies: ['thermacore'] as TechnologySlug[],
    supportingTechnologies: [] as TechnologySlug[],
    productFamilies: ['coolant-filters'],
    standards: ['ASTM D6210'],
    industries: ['trucks-fleets', 'bus-coach', 'power-generation', 'mining', 'construction'],
    relatedSystems: ['lubrication', 'air-intake'],
  },
} as const;

export const FAMILY_RELATIONSHIPS = {
  'primary-air': { system: 'air-intake', technology: 'macrocore', standards: ['ISO 5011'] },
  'secondary-air': { system: 'air-intake', technology: 'macrocore', standards: ['ISO 5011'] },
  'air-cleaner-housings': { system: 'air-intake', technology: 'intekcore', standards: ['ISO 5011'] },
  'primary-fuel': { system: 'fuel-cleanliness', technology: 'syntapore', standards: ['ASTM D6304', 'ISO 12937'] },
  'secondary-fuel': { system: 'fuel-cleanliness', technology: 'syntapore', standards: ['ASTM D6304', 'ISO 12937'] },
  'fuel-water-separators': { system: 'fuel-cleanliness', technology: 'hydrocore', standards: ['ASTM D6304', 'ISO 12937'] },
  'oil-filters': { system: 'lubrication', technology: 'syntrax', standards: ['ISO 4406', 'ISO 16889'] },
  'hydraulic-filters': { system: 'hydraulic', technology: 'nanoforce', standards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'DIN 51524'] },
  'coolant-filters': { system: 'cooling-system', technology: 'thermacore', standards: ['ASTM D6210'] },
  'cabin-filters': { system: 'air-intake', technology: 'microkappa', standards: ['ISO 11155', 'EU Dir. 2019/130'] },
  'air-dryer-filters': { system: 'air-intake', technology: 'drycore', standards: ['ISO 8573-1'] },
} as const satisfies Record<string, { system: string; technology: TechnologySlug; standards: readonly string[] }>;

export const FAILURE_RELATIONSHIPS = {
  'hydraulic-system': {
    systems: ['hydraulic'], technologies: ['nanoforce'], families: ['hydraulic-filters'],
    standards: ['iso-4406', 'iso-16889', 'nfpa-t2-14', 'din-51524'],
    industries: ['construction', 'mining', 'manufacturing', 'marine', 'agriculture'],
  },
  'particle-wear': {
    systems: ['air-intake', 'lubrication', 'hydraulic', 'fuel-cleanliness'],
    technologies: ['macrocore', 'syntrax', 'nanoforce', 'syntapore'],
    families: ['primary-air', 'secondary-air', 'oil-filters', 'hydraulic-filters', 'primary-fuel', 'secondary-fuel'],
    standards: ['iso-5011', 'iso-4406', 'iso-16889'],
    industries: ['mining', 'construction', 'agriculture', 'trucks-fleets', 'power-generation', 'marine'],
  },
  'diesel-water': {
    systems: ['fuel-cleanliness'], technologies: ['syntapore', 'hydrocore'],
    families: ['primary-fuel', 'secondary-fuel', 'fuel-water-separators'],
    standards: ['astm-d6304', 'iso-12937', 'iso-16332'],
    industries: ['mining', 'agriculture', 'power-generation', 'marine', 'oil-gas', 'construction', 'trucks-fleets'],
  },
} as const;

const relationKey = (relation: EntityRelation) => `${relation.from}|${relation.type}|${relation.to}`;
const deduplicateRelations = (relations: EntityRelation[]) =>
  Array.from(new Map(relations.map((relation) => [relationKey(relation), relation])).values());

const systemRelations = Object.entries(SYSTEM_RELATIONSHIPS).flatMap(([slug, rel]) => [
  { from: 'organization:elimfilters', to: `system:${slug}`, type: 'owns' as const },
  ...rel.productFamilies.map((family) => ({ from: `system:${slug}`, to: `family:${family}`, type: 'contains-family' as const })),
  ...[...rel.primaryTechnologies, ...rel.supportingTechnologies].map((technology) => ({ from: `system:${slug}`, to: `technology:${technology}`, type: 'uses-technology' as const })),
  ...rel.standards.map((standard) => ({ from: `system:${slug}`, to: `standard:${normalizeStandardId(standard)}`, type: 'validated-by' as const })),
  ...rel.industries.map((industry) => ({ from: `system:${slug}`, to: `industry:${industry}`, type: 'applied-in' as const })),
]);

const familyRelations = Object.entries(FAMILY_RELATIONSHIPS).flatMap(([slug, rel]) => [
  { from: `family:${slug}`, to: `system:${rel.system}`, type: 'belongs-to' as const },
  { from: `family:${slug}`, to: `technology:${rel.technology}`, type: 'uses-technology' as const },
  ...rel.standards.map((standard) => ({ from: `family:${slug}`, to: `standard:${normalizeStandardId(standard)}`, type: 'validated-by' as const })),
]);

const failureRelations = Object.entries(FAILURE_RELATIONSHIPS).flatMap(([key, rel]) => [
  ...rel.systems.map((slug) => ({ from: `system:${slug}`, to: `failure:${key}`, type: 'controls-failure' as const })),
  ...rel.technologies.map((slug) => ({ from: `technology:${slug}`, to: `failure:${key}`, type: 'mitigates-failure' as const })),
  ...rel.families.map((slug) => ({ from: `family:${slug}`, to: `failure:${key}`, type: 'controls-failure' as const })),
  ...rel.standards.map((slug) => ({ from: `standard:${slug}`, to: `failure:${key}`, type: 'addresses-failure' as const })),
  ...rel.industries.map((slug) => ({ from: `industry:${slug}`, to: `failure:${key}`, type: 'exposed-to-failure' as const })),
]);

export const CANONICAL_ENTITY_RELATIONS: readonly EntityRelation[] = deduplicateRelations([
  ...systemRelations, ...familyRelations, ...failureRelations,
]);

export function getCanonicalOutgoingRelations(entityId: string, relationType?: EntityRelationType): EntityRelation[] {
  return CANONICAL_ENTITY_RELATIONS.filter((relation) => relation.from === entityId && (!relationType || relation.type === relationType));
}

export function getCanonicalIncomingRelations(entityId: string, relationType?: EntityRelationType): EntityRelation[] {
  return CANONICAL_ENTITY_RELATIONS.filter((relation) => relation.to === entityId && (!relationType || relation.type === relationType));
}
