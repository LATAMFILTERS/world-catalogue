import { getGeoContextByKindAndSlug } from './geo-context';
import { isCanonicalTechnology } from './canonical-technologies';
import type { EntityKind, EntityNode } from './entity-graph';

const BASE_URL = 'https://elimfilters.com';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

export type SchemaEntityKind = Exclude<EntityKind, 'organization'>;

export interface CanonicalSchemaNode {
  readonly '@context': 'https://schema.org';
  readonly '@type': string;
  readonly '@id': string;
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly additionalType: string;
  readonly isPartOf: { readonly '@id': string };
  readonly provider: { readonly '@id': string };
  readonly mainEntityOfPage: { readonly '@type': 'WebPage'; readonly '@id': string };
  readonly about?: readonly SchemaReference[];
  readonly subjectOf?: readonly SchemaReference[];
  readonly knowsAbout?: readonly string[];
}

export interface SchemaReference {
  readonly '@type': 'Thing';
  readonly '@id': string;
  readonly name: string;
  readonly url: string;
}

export interface SchemaValidationResult {
  readonly missingSchemas: string[];
  readonly duplicateIds: string[];
  readonly invalidCanonicalUrls: string[];
  readonly invalidTechnologyEntities: string[];
  readonly isValid: boolean;
}

const TYPE_BY_KIND: Record<SchemaEntityKind, string> = {
  technology: 'DefinedTerm',
  system: 'DefinedTerm',
  family: 'ProductGroup',
  industry: 'DefinedTerm',
  standard: 'DefinedTerm',
  failure: 'DefinedTerm',
};

const ADDITIONAL_TYPE_BY_KIND: Record<SchemaEntityKind, string> = {
  technology: 'ELIMFILTERS Proprietary Filtration Technology',
  system: 'Asset Protection System',
  family: 'Industrial Filtration Product Family',
  industry: 'Industrial Operating Environment',
  standard: 'Engineering Standard',
  failure: 'Contamination Failure Mode',
};

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

function entitySlug(node: EntityNode): string {
  return node.id.slice(node.id.indexOf(':') + 1);
}

function schemaEntityId(kind: SchemaEntityKind, slug: string, url: string): string {
  if (kind === 'technology') return `${url}#technology`;
  return `${url}#${kind}-${slug}`;
}

function reference(node: EntityNode): SchemaReference {
  const url = absoluteUrl(node.href);
  const slug = entitySlug(node);
  const id = node.kind === 'organization'
    ? ORGANIZATION_ID
    : schemaEntityId(node.kind as SchemaEntityKind, slug, url);
  return {
    '@type': 'Thing',
    '@id': id,
    name: node.name,
    url,
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'ELIMFILTERS®',
    legalName: 'LATAMFILTERS',
    url: BASE_URL,
    logo: `${BASE_URL}/assets/logo-elimfilters.png`,
    description: 'ELIMFILTERS develops Total Asset Protection systems and proprietary contamination-control technologies for industrial equipment and fleets.',
    knowsAbout: [
      'industrial filtration',
      'contamination control',
      'asset protection systems',
      'engine air filtration',
      'fuel cleanliness',
      'lubrication protection',
      'hydraulic filtration',
      'cooling system protection',
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'ELIMFILTERS World Catalogue',
    url: BASE_URL,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'],
  };
}

export function buildCanonicalEntitySchema(
  kind: SchemaEntityKind,
  slug: string,
): CanonicalSchemaNode | undefined {
  if (kind === 'technology' && !isCanonicalTechnology(slug)) return undefined;

  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;

  const url = absoluteUrl(context.entity.href);
  const connected = [
    ...context.systems,
    ...context.technologies,
    ...context.families,
    ...context.standards,
    ...context.industries,
    ...context.failures,
  ];
  const about = Array.from(new Map(connected.map((node) => [node.id, reference(node)])).values());

  return {
    '@context': 'https://schema.org',
    '@type': TYPE_BY_KIND[kind],
    '@id': schemaEntityId(kind, slug, url),
    name: context.entity.name,
    url,
    description: context.definition,
    additionalType: ADDITIONAL_TYPE_BY_KIND[kind],
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: about.length ? about : undefined,
    subjectOf: context.retrievalPassages.map((passage, index) => ({
      '@type': 'Thing' as const,
      '@id': `${schemaEntityId(kind, slug, url)}-passage-${index + 1}`,
      name: passage,
      url,
    })),
    knowsAbout: [
      context.engineeringPrinciple,
      context.controlStrategy,
      context.operationalImpact,
    ],
  };
}

export function validateCanonicalEntitySchemas(
  entities: ReadonlyArray<{ kind: SchemaEntityKind; slug: string }>,
): SchemaValidationResult {
  const schemas = entities.map(({ kind, slug }) => ({ key: `${kind}:${slug}`, schema: buildCanonicalEntitySchema(kind, slug) }));
  const missingSchemas = schemas.filter(({ schema }) => !schema).map(({ key }) => key);
  const present = schemas.flatMap(({ schema }) => schema ? [schema] : []);
  const ids = present.map((schema) => schema['@id']);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const invalidCanonicalUrls = present
    .filter((schema) => !schema.url.startsWith(BASE_URL) || schema.mainEntityOfPage['@id'] !== schema.url)
    .map((schema) => schema['@id']);
  const invalidTechnologyEntities = entities
    .filter(({ kind, slug }) => kind === 'technology' && !isCanonicalTechnology(slug))
    .map(({ kind, slug }) => `${kind}:${slug}`);

  return {
    missingSchemas,
    duplicateIds: Array.from(new Set(duplicateIds)),
    invalidCanonicalUrls,
    invalidTechnologyEntities,
    isValid:
      missingSchemas.length === 0 &&
      duplicateIds.length === 0 &&
      invalidCanonicalUrls.length === 0 &&
      invalidTechnologyEntities.length === 0,
  };
}