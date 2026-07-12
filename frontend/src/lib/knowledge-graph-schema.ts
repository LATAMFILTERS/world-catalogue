import {
  buildCanonicalEntitySchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
  type CanonicalSchemaNode,
  type SchemaEntityKind,
} from './canonical-entity-schema';
import { ENTITY_NODES, getConnectedEntities } from './entity-graph';
import {
  EXPANDED_KNOWLEDGE_CONCEPTS,
  buildExpandedConceptSchema,
  getExpandedConceptsForEntity,
} from './knowledge-graph-expansion';

const BASE_URL = 'https://elimfilters.com';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const CONCEPT_SET_ID = `${BASE_URL}/#industrial-contamination-knowledge`;

export interface KnowledgeGraphSchema {
  readonly '@context': 'https://schema.org';
  readonly '@graph': readonly Record<string, unknown>[];
}

export interface KnowledgeGraphValidationResult {
  readonly duplicateIds: string[];
  readonly orphanReferences: string[];
  readonly missingRootNodes: string[];
  readonly invalidCanonicalIds: string[];
  readonly isValid: boolean;
}

function withoutContext(node: Record<string, unknown>): Record<string, unknown> {
  const { ['@context']: _context, ...rest } = node;
  return rest;
}

function entityKeyFromId(id: string): { kind: SchemaEntityKind; slug: string } | undefined {
  const separator = id.indexOf(':');
  if (separator < 0) return undefined;
  const kind = id.slice(0, separator) as SchemaEntityKind;
  if (!['technology', 'system', 'family', 'industry', 'standard', 'failure'].includes(kind)) return undefined;
  return { kind, slug: id.slice(separator + 1) };
}

function buildEntityNode(kind: SchemaEntityKind, slug: string): CanonicalSchemaNode | undefined {
  return buildCanonicalEntitySchema(kind, slug);
}

function buildConceptSetNode(): Record<string, unknown> {
  return {
    '@type': 'DefinedTermSet',
    '@id': CONCEPT_SET_ID,
    name: 'ELIMFILTERS Industrial Contamination Knowledge',
    description: 'Canonical engineering concepts covering contaminants, failure mechanisms, protection strategies, maintenance objectives, and lifecycle outcomes.',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildKnowledgeGraphSchema(
  focus?: { kind: SchemaEntityKind; slug: string },
): KnowledgeGraphSchema {
  const organization = buildOrganizationSchema();
  const website = buildWebsiteSchema();
  const entitySchemas: CanonicalSchemaNode[] = [];
  const conceptSchemas: Record<string, unknown>[] = [];

  if (focus) {
    const focusId = `${focus.kind}:${focus.slug}`;
    const focusSchema = buildEntityNode(focus.kind, focus.slug);
    if (focusSchema) entitySchemas.push(focusSchema);

    getConnectedEntities(focusId).forEach((node) => {
      const key = entityKeyFromId(node.id);
      if (!key) return;
      const schema = buildEntityNode(key.kind, key.slug);
      if (schema) entitySchemas.push(schema);
    });

    getExpandedConceptsForEntity(focusId).forEach((concept) => {
      conceptSchemas.push(buildExpandedConceptSchema(concept));
    });
  } else {
    ENTITY_NODES.forEach((node) => {
      const key = entityKeyFromId(node.id);
      if (!key) return;
      const schema = buildEntityNode(key.kind, key.slug);
      if (schema) entitySchemas.push(schema);
    });
    EXPANDED_KNOWLEDGE_CONCEPTS.forEach((concept) => {
      conceptSchemas.push(buildExpandedConceptSchema(concept));
    });
  }

  const uniqueEntities = Array.from(
    new Map(entitySchemas.map((schema) => [schema['@id'], schema])).values(),
  );
  const uniqueConcepts = Array.from(
    new Map(conceptSchemas.map((schema) => [String(schema['@id']), schema])).values(),
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      withoutContext(organization),
      withoutContext(website),
      buildConceptSetNode(),
      ...uniqueEntities.map((schema) => withoutContext(schema as unknown as Record<string, unknown>)),
      ...uniqueConcepts,
    ],
  };
}

function collectReferences(value: unknown, references: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, references));
    return;
  }
  if (!value || typeof value !== 'object') return;

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    if (key === '@id' && typeof child === 'string') references.push(child);
    else collectReferences(child, references);
  });
}

export function validateKnowledgeGraphSchema(): KnowledgeGraphValidationResult {
  const graph = buildKnowledgeGraphSchema();
  const ids = graph['@graph']
    .map((node) => node['@id'])
    .filter((id): id is string => typeof id === 'string');
  const idSet = new Set(ids);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const references: string[] = [];
  graph['@graph'].forEach((node) => collectReferences(node, references));

  const orphanReferences = references.filter((id) => {
    if (idSet.has(id)) return false;
    if (id.startsWith(`${BASE_URL}/`) && !id.includes('#entity')) return false;
    return id.startsWith(BASE_URL);
  });
  const missingRootNodes = [ORGANIZATION_ID, WEBSITE_ID, CONCEPT_SET_ID].filter((id) => !idSet.has(id));
  const invalidCanonicalIds = ids.filter((id) => !id.startsWith(BASE_URL));

  return {
    duplicateIds: Array.from(new Set(duplicateIds)),
    orphanReferences: Array.from(new Set(orphanReferences)),
    missingRootNodes,
    invalidCanonicalIds,
    isValid:
      duplicateIds.length === 0 &&
      orphanReferences.length === 0 &&
      missingRootNodes.length === 0 &&
      invalidCanonicalIds.length === 0,
  };
}
