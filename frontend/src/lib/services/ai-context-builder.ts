/**
 * Canonical AI Context Builder
 *
 * Public/assistant technical context is grounded exclusively in approved
 * records projected from elimfilters-vault/13-canonical-knowledge.
 * Candidate notes, HERMES evidence and Engineering Memory are never fallback sources.
 */
import {
  getCanonicalKnowledgeById,
  resolveCanonicalKnowledgeForEntities,
  type CanonicalKnowledgeRecord,
} from './canonical-knowledge-service';

let contextCounter = 0;
export function resetAIContextCounter(): void { contextCounter = 0; }
function nextPackageId(): string { contextCounter += 1; return `AIC-CANONICAL-`; }

export interface AIContextNode {
  id: string;
  entityType: 'CANONICAL_KNOWLEDGE';
  label: string;
  properties: CanonicalKnowledgeRecord;
  provenance: {
    sourceRegistry: '13-canonical-knowledge';
    version: 'approved';
    maturityLevel: 'CANONICAL';
    governanceStatus: 'ACTIVE';
    edrRefs: readonly [];
  };
}

export interface AIContextRelationship { from: string; to: string; relation: string; weight: number; }
export interface AIContextCitation { claim: string; sourceRegistry: '13-canonical-knowledge'; version: 'approved'; edrRefs: readonly []; }
export interface AIContextPackage {
  packageId: string;
  graphVersion: 'CANONICAL-1.0.0';
  queryEntityId: string;
  queryEntityType: 'CANONICAL_KNOWLEDGE' | 'UNKNOWN';
  nodes: AIContextNode[];
  relationships: AIContextRelationship[];
  engineeringMemory: readonly [];
  citations: AIContextCitation[];
  summary: string;
  generatedAt: string;
  authority: '13-canonical-knowledge';
  fallbackBlocked: true;
}

function toNode(record: CanonicalKnowledgeRecord): AIContextNode {
  return {
    id: record.id,
    entityType: 'CANONICAL_KNOWLEDGE',
    label: record.title,
    properties: record,
    provenance: { sourceRegistry: '13-canonical-knowledge', version: 'approved', maturityLevel: 'CANONICAL', governanceStatus: 'ACTIVE', edrRefs: [] },
  };
}

function citationFor(record: CanonicalKnowledgeRecord): AIContextCitation {
  return {
    claim: record.technicalRelationships[0] || record.diagnosticMethods[0] || record.title,
    sourceRegistry: '13-canonical-knowledge',
    version: 'approved',
    edrRefs: [],
  };
}

export function buildAIContext(entityId: string, _maxDepth = 2): AIContextPackage {
  const direct = getCanonicalKnowledgeById(entityId);
  const records = direct ? [direct] : resolveCanonicalKnowledgeForEntities([entityId], 12);
  return {
    packageId: nextPackageId(),
    graphVersion: 'CANONICAL-1.0.0',
    queryEntityId: entityId,
    queryEntityType: direct ? 'CANONICAL_KNOWLEDGE' : 'UNKNOWN',
    nodes: records.map(toNode),
    relationships: [],
    engineeringMemory: [],
    citations: records.map(citationFor),
    summary: records.length
      ? `Grounded exclusively in ${records.length} approved ELIMFILTERS canonical knowledge record${records.length === 1 ? '' : 's'}.`
      : 'No approved ELIMFILTERS canonical knowledge matched this entity. Private candidate and HERMES evidence fallback is disabled.',
    generatedAt: new Date().toISOString(),
    authority: '13-canonical-knowledge',
    fallbackBlocked: true,
  };
}

export function buildAIContextBatch(entityIds: string[], maxDepth = 2): AIContextPackage {
  const packages = entityIds.map(id => buildAIContext(id, maxDepth));
  const unique = new Map<string, AIContextNode>();
  for (const pkg of packages) for (const node of pkg.nodes) unique.set(node.id, node);
  const nodes = [...unique.values()];
  return {
    packageId: nextPackageId(),
    graphVersion: 'CANONICAL-1.0.0',
    queryEntityId: entityIds.join(','),
    queryEntityType: 'UNKNOWN',
    nodes,
    relationships: [],
    engineeringMemory: [],
    citations: nodes.map(node => citationFor(node.properties)),
    summary: nodes.length
      ? `Grounded exclusively in ${nodes.length} approved ELIMFILTERS canonical knowledge records.`
      : 'No approved ELIMFILTERS canonical knowledge matched these entities. Private fallback is disabled.',
    generatedAt: new Date().toISOString(),
    authority: '13-canonical-knowledge',
    fallbackBlocked: true,
  };
}
