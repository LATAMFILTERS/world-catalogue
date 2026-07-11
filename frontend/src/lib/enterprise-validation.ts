import { validateAICitationRecords } from './ai-citation-layer';
import { validateCanonicalEntitySchemas, type SchemaEntityKind } from './canonical-entity-schema';
import { validateEntityAuthority } from './entity-authority';
import { ENTITY_NODES, validateEntityGraph } from './entity-graph';
import { validateSeoGeoProfiles } from './enterprise-seo-geo';
import { validateGeoContext } from './geo-context';
import { validateKnowledgeGraphSchema } from './knowledge-graph-schema';
import { validateRichResultsGraph } from './rich-results-schema';
import { validateTopicalAuthority } from './topical-authority';

export interface EnterpriseValidationIssue {
  readonly layer:
    | 'entity-graph'
    | 'geo'
    | 'entity-schema'
    | 'knowledge-graph'
    | 'ai-citation'
    | 'rich-results'
    | 'seo-geo'
    | 'topical-authority'
    | 'entity-authority';
  readonly code: string;
  readonly values: readonly string[];
}

export interface EnterpriseValidationReport {
  readonly checkedEntities: number;
  readonly issues: readonly EnterpriseValidationIssue[];
  readonly isValid: boolean;
}

const schemaEntities = ENTITY_NODES
  .filter((node) => node.kind !== 'organization')
  .map((node) => {
    const separator = node.id.indexOf(':');
    return {
      kind: node.kind as SchemaEntityKind,
      slug: node.id.slice(separator + 1),
    };
  });

function addIssue(
  issues: EnterpriseValidationIssue[],
  layer: EnterpriseValidationIssue['layer'],
  code: string,
  values: readonly string[],
) {
  if (values.length > 0) issues.push({ layer, code, values: Array.from(new Set(values)) });
}

export function validateEnterpriseArchitecture(): EnterpriseValidationReport {
  const issues: EnterpriseValidationIssue[] = [];

  const entityGraph = validateEntityGraph();
  addIssue(issues, 'entity-graph', 'duplicate-node-ids', entityGraph.duplicateNodeIds);
  addIssue(issues, 'entity-graph', 'orphan-relation-endpoints', entityGraph.orphanRelationEndpoints);
  addIssue(issues, 'entity-graph', 'duplicate-relations', entityGraph.duplicateRelations);
  addIssue(issues, 'entity-graph', 'isolated-node-ids', entityGraph.isolatedNodeIds);

  const geo = validateGeoContext();
  addIssue(issues, 'geo', 'missing-contexts', geo.missingContexts);
  addIssue(issues, 'geo', 'duplicate-passages', geo.duplicatePassages);
  addIssue(issues, 'geo', 'invalid-technology-entities', geo.invalidTechnologyEntities);
  addIssue(issues, 'geo', 'contradictory-technology-domains', geo.contradictoryTechnologyDomains);

  const entitySchemas = validateCanonicalEntitySchemas(schemaEntities);
  addIssue(issues, 'entity-schema', 'missing-schemas', entitySchemas.missingSchemas);
  addIssue(issues, 'entity-schema', 'duplicate-ids', entitySchemas.duplicateIds);
  addIssue(issues, 'entity-schema', 'invalid-canonical-urls', entitySchemas.invalidCanonicalUrls);
  addIssue(issues, 'entity-schema', 'invalid-technology-entities', entitySchemas.invalidTechnologyEntities);

  const knowledgeGraph = validateKnowledgeGraphSchema();
  addIssue(issues, 'knowledge-graph', 'duplicate-ids', knowledgeGraph.duplicateIds);
  addIssue(issues, 'knowledge-graph', 'orphan-references', knowledgeGraph.orphanReferences);
  addIssue(issues, 'knowledge-graph', 'missing-root-nodes', knowledgeGraph.missingRootNodes);
  addIssue(issues, 'knowledge-graph', 'invalid-canonical-ids', knowledgeGraph.invalidCanonicalIds);

  const citations = validateAICitationRecords(schemaEntities);
  addIssue(issues, 'ai-citation', 'duplicate-citation-ids', citations.duplicateCitationIds);
  addIssue(issues, 'ai-citation', 'duplicate-aliases', citations.duplicateAliases);
  addIssue(issues, 'ai-citation', 'missing-definitions', citations.missingDefinitions);
  addIssue(issues, 'ai-citation', 'missing-answers', citations.missingAnswers);
  addIssue(issues, 'ai-citation', 'invalid-technology-entities', citations.invalidTechnologyEntities);
  addIssue(issues, 'ai-citation', 'invalid-canonical-urls', citations.invalidCanonicalUrls);

  const seoGeo = validateSeoGeoProfiles(schemaEntities);
  addIssue(issues, 'seo-geo', 'missing-profiles', seoGeo.missingProfiles);
  addIssue(issues, 'seo-geo', 'invalid-canonical-urls', seoGeo.invalidCanonicalUrls);
  addIssue(issues, 'seo-geo', 'invalid-technology-entities', seoGeo.invalidTechnologyEntities);
  addIssue(issues, 'seo-geo', 'duplicate-titles', seoGeo.duplicateTitles);
  addIssue(issues, 'seo-geo', 'duplicate-descriptions', seoGeo.duplicateDescriptions);

  const topical = validateTopicalAuthority();
  addIssue(issues, 'topical-authority', 'missing-clusters', topical.missingClusters);
  addIssue(issues, 'topical-authority', 'empty-clusters', topical.emptyClusters);
  addIssue(issues, 'topical-authority', 'duplicate-links', topical.duplicateLinks);
  addIssue(issues, 'topical-authority', 'self-links', topical.selfLinks);

  const authority = validateEntityAuthority();
  addIssue(issues, 'entity-authority', 'missing-scores', authority.missingScores);
  addIssue(issues, 'entity-authority', 'out-of-range-scores', authority.outOfRangeScores);

  schemaEntities.forEach(({ kind, slug }) => {
    const richResults = validateRichResultsGraph(kind, slug);
    const prefix = `${kind}:${slug}`;
    addIssue(issues, 'rich-results', `${prefix}:duplicate-ids`, richResults.duplicateIds);
    addIssue(issues, 'rich-results', `${prefix}:duplicate-types`, richResults.duplicateTypes);
    addIssue(issues, 'rich-results', `${prefix}:invalid-urls`, richResults.invalidUrls);
    addIssue(issues, 'rich-results', `${prefix}:missing-main-entity`, richResults.missingMainEntity);
  });

  return {
    checkedEntities: schemaEntities.length,
    issues,
    isValid: issues.length === 0,
  };
}

export function assertEnterpriseArchitecture(): void {
  const report = validateEnterpriseArchitecture();
  if (report.isValid) return;

  const summary = report.issues
    .map((issue) => `${issue.layer}/${issue.code}: ${issue.values.join(', ')}`)
    .join('\n');

  throw new Error(`ELIMFILTERS enterprise architecture validation failed:\n${summary}`);
}
