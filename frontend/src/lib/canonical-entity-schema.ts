import { getGeoContextByKindAndSlug } from './geo-context';
import { isCanonicalTechnology } from './canonical-technologies';
import type { EntityKind, EntityNode } from './entity-graph';

export const BASE_URL = 'https://elimfilters.com';
export const ORGANIZATION_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

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
  readonly '@type': string;
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

export function absoluteEntityUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export function canonicalEntityId(kind: SchemaEntityKind, slug: string, url: string): string {
  if (kind === 'technology') return `${url}#technology`;
  return `${url}#${kind}-${slug}`;
}

export function canonicalWebPageId(kind: SchemaEntityKind, slug: string, url: string): string {
  return `${canonicalEntityId(kind, slug, url)}-page`;
}

function entitySlug(node: EntityNode): string {
  return node.id.slice(node.id.indexOf(':') + 1);
}

function reference(node: EntityNode): SchemaReference {
  const url = absoluteEntityUrl(node.href);
  if (node.kind === 'organization') {
    return { '@type': 'Organization', '@id': ORGANIZATION_ID, name: node.name, url };
  }
  const slug = entitySlug(node);
  const kind = node.kind as SchemaEntityKind;
  return {
    '@type': TYPE_BY_KIND[kind],
    '@id': canonicalEntityId(kind, slug, url),
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
    legalName: 'Kleo Technology LLC',
    alternateName: ['ELIMFILTERS', 'ELIMFILTERS Asset Protection Systems'],
    url: BASE_URL,
    email: 'info@elimfilters.com',
    telephone: '+1-281-965-9142',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support and commercial inquiries',
      telephone: '+1-281-965-9142',
      email: 'info@elimfilters.com',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Spanish'],
    },
    logo: `${BASE_URL}/assets/elimfilters-logo-transparent.png`,
    description: 'ELIMFILTERS is an industrial filtration engineering and asset-protection brand combining contamination-control technologies, technical knowledge, application intelligence, a 12,000+ product primary catalog and more than 1,000,000 cross-reference relationships.',
    brand: {
      '@type': 'Brand',
      name: 'ELIMFILTERS®',
    },
    knowsAbout: [
      'industrial filtration engineering',
      'contamination control',
      'asset protection systems',
      'application intelligence',
      'OEM and aftermarket cross-reference intelligence',
      'equipment and vehicle filtration applications',
      'engine air filtration',
      'fuel cleanliness',
      'lubrication protection',
      'hydraulic filtration',
      'cooling system protection',
      'pneumatic air-dryer filtration',
      'filtration standards and test methods',
      'failure analysis and reliability engineering',
    ],
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Primary catalog products', value: '12,192 unique SKUs', description: 'Database-audited 2026-08-31' },
      { '@type': 'PropertyValue', name: 'Cross-reference intelligence', value: '1,044,939 unique relationships', description: 'Database-audited across primary and LD catalog layers on 2026-08-31' },
      { '@type': 'PropertyValue', name: 'Equipment makes', value: '423 active makes', description: 'Curated equipment graph, database-audited 2026-08-31' },
      { '@type': 'PropertyValue', name: 'Equipment models', value: '37,751 models', description: 'Curated equipment graph, database-audited 2026-08-31' },
      { '@type': 'PropertyValue', name: 'Product-to-equipment links', value: '135,157 application links', description: 'Database-audited 2026-08-31' },
      { '@type': 'PropertyValue', name: 'LD vehicle configurations', value: '123,357 distinct configurations', description: 'Derived from 282,252 LD application records, database-audited 2026-08-31' },
    ],
    subjectOf: [
      { '@type': 'WebPage', name: 'ELIMFILTERS Knowledge Center', url: `${BASE_URL}/knowledge-center/` },
      { '@type': 'WebApplication', name: 'ELIMFILTERS Part Search', url: 'https://part-search.elimfilters.com' },
    ],
    sameAs: [
      'https://www.linkedin.com/company/133064152/',
      'https://www.facebook.com/elimfilters/',
      'https://www.instagram.com/elimfilters.global',
      'https://x.com/elimfilters',
      'https://www.youtube.com/@elimfilters9112',
      'https://www.amazon.com/stores/Elimfilters/page/B7619BD8-A04B-48A2-B275-FF4976181C55',
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

export function buildCanonicalEntitySchema(kind: SchemaEntityKind, slug: string): CanonicalSchemaNode | undefined {
  if (kind === 'technology' && !isCanonicalTechnology(slug)) return undefined;
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;

  const url = absoluteEntityUrl(context.entity.href);
  const connected = [
    ...context.systems,
    ...context.technologies,
    ...context.families,
    ...context.standards,
    ...context.industries,
    ...context.failures,
  ];
  const about = Array.from(new Map(connected.map((node) => [node.id, reference(node)])).values());
  const id = canonicalEntityId(kind, slug, url);
  const pageId = canonicalWebPageId(kind, slug, url);

  return {
    '@context': 'https://schema.org',
    '@type': TYPE_BY_KIND[kind],
    '@id': id,
    name: context.entity.name,
    url,
    description: context.definition,
    additionalType: ADDITIONAL_TYPE_BY_KIND[kind],
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageId },
    about: about.length ? about : undefined,
    subjectOf: context.retrievalPassages.map((passage, index) => ({
      '@type': 'CreativeWork',
      '@id': `${id}-passage-${index + 1}`,
      name: passage,
      url,
    })),
    knowsAbout: [context.engineeringPrinciple, context.controlStrategy, context.operationalImpact],
  };
}

export function validateCanonicalEntitySchemas(
  entities: ReadonlyArray<{ kind: SchemaEntityKind; slug: string }>,
): SchemaValidationResult {
  const schemas = entities.map(({ kind, slug }) => ({
    key: `${kind}:${slug}`,
    kind,
    slug,
    schema: buildCanonicalEntitySchema(kind, slug),
  }));
  const missingSchemas = schemas.filter(({ schema }) => !schema).map(({ key }) => key);
  const present = schemas.flatMap(({ schema, kind, slug }) => schema ? [{ schema, kind, slug }] : []);
  const ids = present.map(({ schema }) => schema['@id']);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const invalidCanonicalUrls = present
    .filter(({ schema, kind, slug }) =>
      !schema.url.startsWith(BASE_URL) ||
      schema.mainEntityOfPage['@id'] !== canonicalWebPageId(kind, slug, schema.url),
    )
    .map(({ schema }) => schema['@id']);
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
