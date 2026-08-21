import { buildKnowledgeGraphSchema, type KnowledgeGraphSchema } from './knowledge-graph-schema';
import { getGeoContextByKindAndSlug } from './geo-context';
import {
  absoluteEntityUrl,
  canonicalEntityId,
  canonicalWebPageId,
  type SchemaEntityKind,
} from './canonical-entity-schema';

const BASE_URL = 'https://elimfilters.com';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

export interface RichResultsValidationResult {
  readonly duplicateIds: string[];
  readonly duplicateTypes: string[];
  readonly invalidUrls: string[];
  readonly missingMainEntity: string[];
  readonly invalidEntityPageLinks: string[];
  readonly isValid: boolean;
}

function labelForKind(kind: SchemaEntityKind): string {
  if (kind === 'technology') return 'Technologies';
  if (kind === 'system') return 'Protection Systems';
  if (kind === 'family') return 'Product Families';
  if (kind === 'industry') return 'Industries';
  if (kind === 'standard') return 'Standards';
  return 'Failure Modes';
}

function parentUrlForKind(kind: SchemaEntityKind): string {
  if (kind === 'technology') return `${BASE_URL}/technologies/`;
  if (kind === 'system') return `${BASE_URL}/systems/`;
  if (kind === 'family') return `${BASE_URL}/families/`;
  if (kind === 'industry') return `${BASE_URL}/industries/`;
  if (kind === 'standard') return `${BASE_URL}/knowledge-center/standards/`;
  return `${BASE_URL}/knowledge-center/engineering/contamination-control/`;
}

function buildBreadcrumbNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;
  const url = absoluteEntityUrl(context.entity.href);
  const entityId = canonicalEntityId(kind, slug, url);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${entityId}-breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ELIMFILTERS', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: labelForKind(kind), item: parentUrlForKind(kind) },
      { '@type': 'ListItem', position: 3, name: context.entity.name, item: url },
    ],
  };
}

function buildFaqNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context || context.canonicalAnswers.length === 0) return undefined;
  const url = absoluteEntityUrl(context.entity.href);
  const entityId = canonicalEntityId(kind, slug, url);
  return {
    '@type': 'FAQPage',
    '@id': `${entityId}-faq`,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: context.canonicalAnswers.map((entry, index) => ({
      '@type': 'Question',
      '@id': `${entityId}-question-${index + 1}`,
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

function buildWebPageNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;

  const url = absoluteEntityUrl(context.entity.href);
  const entityId = canonicalEntityId(kind, slug, url);
  const connected = [
    ...context.systems,
    ...context.technologies,
    ...context.families,
    ...context.standards,
    ...context.industries,
    ...context.failures,
  ];
  const mentions = Array.from(new Map<string, { '@id': string }>(
    connected.map((node): [string, { '@id': string }] => {
      const separator = node.id.indexOf(':');
      if (separator < 0 || node.kind === 'organization') {
        return [node.id, { '@id': ORGANIZATION_ID }];
      }
      const connectedKind = node.kind as SchemaEntityKind;
      const connectedSlug = node.id.slice(separator + 1);
      const connectedUrl = absoluteEntityUrl(node.href);
      return [node.id, { '@id': canonicalEntityId(connectedKind, connectedSlug, connectedUrl) }];
    }),
  ).values());

  return {
    '@type': 'WebPage',
    '@id': canonicalWebPageId(kind, slug, url),
    url,
    name: context.entity.name,
    description: context.definition,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': entityId },
    mentions: mentions.length ? mentions : undefined,
    breadcrumb: { '@id': `${entityId}-breadcrumb` },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildRichResultsGraph(kind: SchemaEntityKind, slug: string): KnowledgeGraphSchema {
  const baseGraph = buildKnowledgeGraphSchema({ kind, slug });
  const richNodes = [buildWebPageNode(kind, slug), buildBreadcrumbNode(kind, slug), buildFaqNode(kind, slug)]
    .filter((node): node is NonNullable<typeof node> => Boolean(node));
  const graph = [...baseGraph['@graph'], ...richNodes];
  const uniqueGraph = Array.from(
    new Map(graph.map((node, index) => [typeof node['@id'] === 'string' ? node['@id'] : `anonymous-${index}`, node])).values(),
  );
  return { '@context': 'https://schema.org', '@graph': uniqueGraph };
}

export function validateRichResultsGraph(kind: SchemaEntityKind, slug: string): RichResultsValidationResult {
  const graph = buildRichResultsGraph(kind, slug)['@graph'];
  const ids = graph.map((node) => node['@id']).filter((id): id is string => typeof id === 'string');
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const typeCounts = new Map<string, number>();
  graph.forEach((node) => {
    const type = node['@type'];
    if (typeof type === 'string') typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });
  const duplicateTypes = ['Organization', 'WebSite', 'BreadcrumbList', 'FAQPage'].filter(
    (type) => (typeCounts.get(type) || 0) > 1,
  );
  const invalidUrls = graph
    .flatMap((node) => [node['@id'], node.url])
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => value.startsWith('http') && !value.startsWith(BASE_URL));
  const missingMainEntity = graph
    .filter((node) => node['@type'] === 'FAQPage')
    .filter((node) => !Array.isArray(node.mainEntity) || node.mainEntity.length === 0)
    .map((node) => String(node['@id']));

  const context = getGeoContextByKindAndSlug(kind, slug);
  const invalidEntityPageLinks: string[] = [];
  if (context) {
    const url = absoluteEntityUrl(context.entity.href);
    const entityId = canonicalEntityId(kind, slug, url);
    const pageId = canonicalWebPageId(kind, slug, url);
    const entityNode = graph.find((node) => node['@id'] === entityId);
    const pageNode = graph.find((node) => node['@id'] === pageId);
    const entityPageRef = entityNode?.mainEntityOfPage as { '@id'?: unknown } | undefined;
    const pageAboutRef = pageNode?.about as { '@id'?: unknown } | undefined;
    if (entityPageRef?.['@id'] !== pageId || pageAboutRef?.['@id'] !== entityId) {
      invalidEntityPageLinks.push(entityId);
    }
  }

  return {
    duplicateIds: Array.from(new Set(duplicateIds)),
    duplicateTypes,
    invalidUrls: Array.from(new Set(invalidUrls)),
    missingMainEntity,
    invalidEntityPageLinks,
    isValid:
      duplicateIds.length === 0 &&
      duplicateTypes.length === 0 &&
      invalidUrls.length === 0 &&
      missingMainEntity.length === 0 &&
      invalidEntityPageLinks.length === 0,
  };
}
