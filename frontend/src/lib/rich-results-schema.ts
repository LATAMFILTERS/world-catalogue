import { buildKnowledgeGraphSchema, type KnowledgeGraphSchema } from './knowledge-graph-schema';
import { getGeoContextByKindAndSlug } from './geo-context';
import type { SchemaEntityKind } from './canonical-entity-schema';

const BASE_URL = 'https://elimfilters.com';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

export interface RichResultsValidationResult {
  readonly duplicateIds: string[];
  readonly duplicateTypes: string[];
  readonly invalidUrls: string[];
  readonly missingMainEntity: string[];
  readonly isValid: boolean;
}

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
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
  if (kind === 'technology') return `${BASE_URL}/technologies`;
  if (kind === 'system') return `${BASE_URL}/systems`;
  if (kind === 'family') return `${BASE_URL}/families`;
  if (kind === 'industry') return `${BASE_URL}/industries`;
  if (kind === 'standard') return `${BASE_URL}/knowledge-system/standards`;
  return `${BASE_URL}/knowledge-system/contamination`;
}

function buildBreadcrumbNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;
  const url = absoluteUrl(context.entity.href);

  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ELIMFILTERS',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: labelForKind(kind),
        item: parentUrlForKind(kind),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: context.entity.name,
        item: url,
      },
    ],
  };
}

function buildFaqNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context || context.canonicalAnswers.length === 0) return undefined;
  const url = absoluteUrl(context.entity.href);

  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: context.canonicalAnswers.map((entry, index) => ({
      '@type': 'Question',
      '@id': `${url}#question-${index + 1}`,
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}

function buildWebPageNode(kind: SchemaEntityKind, slug: string) {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;
  const url = absoluteUrl(context.entity.href);

  return {
    '@type': 'WebPage',
    '@id': url,
    url,
    name: context.entity.name,
    description: context.definition,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': `${url}#entity` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildRichResultsGraph(
  kind: SchemaEntityKind,
  slug: string,
): KnowledgeGraphSchema {
  const baseGraph = buildKnowledgeGraphSchema({ kind, slug });
  const richNodes = [
    buildWebPageNode(kind, slug),
    buildBreadcrumbNode(kind, slug),
    buildFaqNode(kind, slug),
  ].filter((node): node is Record<string, unknown> => Boolean(node));

  const graph = [...baseGraph['@graph'], ...richNodes];
  const uniqueGraph = Array.from(
    new Map(
      graph.map((node, index) => [
        typeof node['@id'] === 'string' ? node['@id'] : `anonymous-${index}`,
        node,
      ]),
    ).values(),
  );

  return {
    '@context': 'https://schema.org',
    '@graph': uniqueGraph,
  };
}

export function validateRichResultsGraph(
  kind: SchemaEntityKind,
  slug: string,
): RichResultsValidationResult {
  const graph = buildRichResultsGraph(kind, slug)['@graph'];
  const ids = graph
    .map((node) => node['@id'])
    .filter((id): id is string => typeof id === 'string');
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  const typeCounts = new Map<string, number>();
  graph.forEach((node) => {
    const type = node['@type'];
    if (typeof type !== 'string') return;
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });
  const duplicateTypes = ['Organization', 'WebSite', 'BreadcrumbList', 'FAQPage']
    .filter((type) => (typeCounts.get(type) || 0) > 1);

  const invalidUrls = graph
    .flatMap((node) => [node['@id'], node.url])
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => value.startsWith('http') && !value.startsWith(BASE_URL));

  const missingMainEntity = graph
    .filter((node) => node['@type'] === 'FAQPage')
    .filter((node) => !Array.isArray(node.mainEntity) || node.mainEntity.length === 0)
    .map((node) => String(node['@id']));

  return {
    duplicateIds: Array.from(new Set(duplicateIds)),
    duplicateTypes,
    invalidUrls: Array.from(new Set(invalidUrls)),
    missingMainEntity,
    isValid:
      duplicateIds.length === 0 &&
      duplicateTypes.length === 0 &&
      invalidUrls.length === 0 &&
      missingMainEntity.length === 0,
  };
}
