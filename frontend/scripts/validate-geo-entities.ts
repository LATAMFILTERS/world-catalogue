import { ENTITY_NODES, validateEntityGraph, type EntityKind } from '../src/lib/entity-graph';
import {
  validateCanonicalEntitySchemas,
  type SchemaEntityKind,
} from '../src/lib/canonical-entity-schema';
import { validateKnowledgeGraphSchema } from '../src/lib/knowledge-graph-schema';
import { validateRichResultsGraph } from '../src/lib/rich-results-schema';

const schemaKinds = new Set<EntityKind>([
  'technology',
  'system',
  'family',
  'industry',
  'standard',
  'failure',
]);

const entities = ENTITY_NODES
  .filter((node) => schemaKinds.has(node.kind))
  .map((node) => ({
    kind: node.kind as SchemaEntityKind,
    slug: node.id.slice(node.id.indexOf(':') + 1),
  }));

const failures: string[] = [];

const entityGraph = validateEntityGraph();
if (!entityGraph.isValid) {
  if (entityGraph.duplicateNodeIds.length) failures.push(`duplicate entity nodes: ${entityGraph.duplicateNodeIds.join(', ')}`);
  if (entityGraph.orphanRelationEndpoints.length) failures.push(`orphan relation endpoints: ${entityGraph.orphanRelationEndpoints.join(', ')}`);
  if (entityGraph.duplicateRelations.length) failures.push(`duplicate entity relations: ${entityGraph.duplicateRelations.join(', ')}`);
  const publicIsolated = entityGraph.isolatedNodeIds.filter((id) => !id.startsWith('organization:'));
  if (publicIsolated.length) failures.push(`isolated public entities: ${publicIsolated.join(', ')}`);
}

const canonical = validateCanonicalEntitySchemas(entities);
if (!canonical.isValid) {
  if (canonical.missingSchemas.length) failures.push(`missing canonical schemas: ${canonical.missingSchemas.join(', ')}`);
  if (canonical.duplicateIds.length) failures.push(`duplicate canonical schema IDs: ${canonical.duplicateIds.join(', ')}`);
  if (canonical.invalidCanonicalUrls.length) failures.push(`invalid canonical entity/page links: ${canonical.invalidCanonicalUrls.join(', ')}`);
  if (canonical.invalidTechnologyEntities.length) failures.push(`non-canonical technology entities: ${canonical.invalidTechnologyEntities.join(', ')}`);
}

const knowledgeGraph = validateKnowledgeGraphSchema();
if (!knowledgeGraph.isValid) {
  if (knowledgeGraph.duplicateIds.length) failures.push(`knowledge graph duplicate IDs: ${knowledgeGraph.duplicateIds.join(', ')}`);
  if (knowledgeGraph.orphanReferences.length) failures.push(`knowledge graph orphan references: ${knowledgeGraph.orphanReferences.join(', ')}`);
  if (knowledgeGraph.missingRootNodes.length) failures.push(`knowledge graph missing roots: ${knowledgeGraph.missingRootNodes.join(', ')}`);
  if (knowledgeGraph.invalidCanonicalIds.length) failures.push(`knowledge graph invalid IDs: ${knowledgeGraph.invalidCanonicalIds.join(', ')}`);
}

for (const entity of entities) {
  const rich = validateRichResultsGraph(entity.kind, entity.slug);
  if (!rich.isValid) {
    const key = `${entity.kind}:${entity.slug}`;
    if (rich.duplicateIds.length) failures.push(`${key} duplicate rich-result IDs: ${rich.duplicateIds.join(', ')}`);
    if (rich.duplicateTypes.length) failures.push(`${key} duplicate root schema types: ${rich.duplicateTypes.join(', ')}`);
    if (rich.invalidUrls.length) failures.push(`${key} external/invalid schema URLs: ${rich.invalidUrls.join(', ')}`);
    if (rich.missingMainEntity.length) failures.push(`${key} FAQ without mainEntity: ${rich.missingMainEntity.join(', ')}`);
    if (rich.invalidEntityPageLinks.length) failures.push(`${key} unresolved entity→WebPage links: ${rich.invalidEntityPageLinks.join(', ')}`);
  }
}

if (failures.length) {
  console.error('[validate-geo-entities] FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`[validate-geo-entities] PASS — ${entities.length} canonical entities validated across entity graph, JSON-LD identity, WebPage linkage and rich-result graphs`);
