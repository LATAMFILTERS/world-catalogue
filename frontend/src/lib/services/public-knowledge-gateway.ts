import type { GraphNode } from '@/lib/graph/graph-types';

const PRIVATE_KEYS = new Set([
  'source_evidence', 'validation_sources', 'source_claims', 'source_url',
  'source_publisher', 'source_id', 'source_hash', 'evidence_hash',
  'raw_source_text', 'source_text', 'article_text', 'provenance_map',
  'private_provenance', 'external_evidence',
]);

const SOURCE_SIGNATURES = [
  /\bFRAM\b/i,
  /fram\.com/i,
  /\bfram_ld_\d+\b/i,
];

export interface PublicKnowledgeValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function sanitizeKnowledgeValue<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeKnowledgeValue(item)) as T;

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (PRIVATE_KEYS.has(key)) continue;
    out[key] = sanitizeKnowledgeValue(item);
  }
  return out as T;
}

export function findPublicKnowledgeLeaks(value: unknown): string[] {
  const text = JSON.stringify(sanitizeKnowledgeValue(value));
  const errors: string[] = [];
  for (const pattern of SOURCE_SIGNATURES) {
    if (pattern.test(text)) errors.push(`private external knowledge signature: ${pattern}`);
  }
  return [...new Set(errors)];
}

export function isPublicGraphNode(node: GraphNode): boolean {
  return node.provenance.governanceStatus === 'ACTIVE' && findPublicKnowledgeLeaks(node).length === 0;
}

export function toPublicGraphNode(node: GraphNode): GraphNode {
  if (node.provenance.governanceStatus !== 'ACTIVE') {
    throw new Error(`Public knowledge blocked: ${node.entityId} is ${node.provenance.governanceStatus}`);
  }

  const publicNode: GraphNode = {
    ...node,
    properties: sanitizeKnowledgeValue(node.properties),
  };
  const errors = findPublicKnowledgeLeaks(publicNode);
  if (errors.length) {
    throw new Error(`Public knowledge blocked for ${node.entityId}: ${errors.join('; ')}`);
  }
  return publicNode;
}

export function validatePublicKnowledgeValue(value: unknown): PublicKnowledgeValidation {
  const errors = findPublicKnowledgeLeaks(value);
  return { valid: errors.length === 0, errors };
}

export const PUBLIC_KNOWLEDGE_GOVERNANCE = Object.freeze({
  hermesRole: 'EVIDENCE_EXTRACTION_ONLY',
  canonicalAuthority: 'NODAL_CENTER_APPROVED_KNOWLEDGE',
  skuAuthority: 'POSTGRESQL_ONLY',
  externalProvenancePublic: false,
  probableTechnologyPublic: false,
  candidateApplicationPublic: false,
});
