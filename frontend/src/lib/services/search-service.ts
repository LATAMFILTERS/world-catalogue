/**
 * Phase 3 — Engineering Services: Engineering Search Service
 *
 * Deterministic semantic search over the Knowledge Graph.
 * No AI. No embeddings. Graph traversal + field matching only.
 *
 * Search is case-insensitive string matching against indexed fields.
 * Results are scored by match quality and ranked deterministically.
 */

import { getGraph } from './knowledge-service';
import type { GraphNode, NodeEntityType } from '@/lib/graph/graph-types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchEntityType = NodeEntityType | 'ALL';

export interface SearchResult {
  readonly nodeId: string;
  readonly entityId: string;
  readonly entityType: NodeEntityType;
  readonly label: string;
  readonly score: number;           // 0–100; higher = stronger match
  readonly matchedFields: readonly string[];
  readonly excerpt: string;         // first matched snippet
}

export interface SearchOptions {
  readonly entityTypes?: readonly SearchEntityType[];  // default: ['ALL']
  readonly maxResults?: number;                        // default: 20
  readonly includeDeprecated?: boolean;               // default: false
}

// ─── Field extractors by entity type ─────────────────────────────────────────

function extractSearchableText(node: GraphNode): Array<{ field: string; text: string; weight: number }> {
  const p = node.properties as Record<string, unknown>;
  const fields: Array<{ field: string; text: string; weight: number }> = [];

  function add(field: string, value: unknown, weight: number) {
    if (typeof value === 'string' && value.length > 0) {
      fields.push({ field, text: value.toLowerCase(), weight });
    }
  }

  // Common high-weight fields
  add('id', p['id'], 100);
  add('code', p['code'], 90);
  add('name', p['name'], 85);
  add('technologyName', p['technologyName'], 85);
  add('commercialName', p['commercialName'], 80);

  // Domain-specific
  switch (node.entityType) {
    case 'ENGINEERING_PRINCIPLE':
      add('definition', p['definition'], 60);
      add('phenomenonDescription', p['phenomenonDescription'], 50);
      add('scienceDomain', p['scienceDomain'], 70);
      break;
    case 'TECHNOLOGY_ARCHITECTURE':
      add('systemDomain', p['systemDomain'], 70);
      add('canonicalDefinition', p['canonicalDefinition'], 55);
      break;
    case 'PROTECTION_MEDIA':
      add('definition', p['definition'], 60);
      add('mediaFunction', p['mediaFunction'], 65);
      add('baseConstruction', p['baseConstruction'], 50);
      break;
    case 'STANDARD':
      add('title', p['title'], 75);
      add('scope', p['scope'], 55);
      add('issuingBody', p['issuingBody'], 60);
      break;
    case 'FAILURE_MODE':
      add('systemContext', p['systemContext'], 70);
      add('causeChain', p['causeChain'], 55);
      add('measurableConsequence', p['measurableConsequence'], 50);
      add('industrialImpact', p['industrialImpact'], 45);
      break;
    case 'CONTAMINATION':
      add('name', p['name'], 85);
      add('contaminantClass', p['contaminantClass'], 65);
      add('phaseState', p['phaseState'], 55);
      break;
    case 'ENGINEERING_MEMORY':
      add('entityId', p['entityId'], 30);   // Low weight: memory is secondary
      add('archivedReason', p['archivedReason'], 15);
      break;
  }

  return fields;
}

function scoreMatch(query: string, fields: Array<{ field: string; text: string; weight: number }>): {
  score: number;
  matchedFields: string[];
  excerpt: string;
} {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { score: 0, matchedFields: [], excerpt: '' };

  let totalScore = 0;
  let matchedWeight = 0;
  const matchedFields: string[] = [];
  let firstExcerpt = '';

  for (const { field, text, weight } of fields) {
    let fieldScore = 0;
    let fieldMatched = false;

    for (const term of terms) {
      if (text === term) {
        fieldScore += weight * 1.0;
        fieldMatched = true;
      } else if (text.startsWith(term)) {
        fieldScore += weight * 0.8;
        fieldMatched = true;
      } else if (text.includes(term)) {
        fieldScore += weight * 0.5;
        fieldMatched = true;
      }
    }

    if (fieldMatched) {
      totalScore += fieldScore;
      matchedWeight += weight;
      matchedFields.push(field);
      if (!firstExcerpt) {
        const idx = text.indexOf(terms[0]);
        const start = Math.max(0, idx - 20);
        firstExcerpt = text.slice(start, start + 120);
      }
    }
  }

  // Score formula:
  //   raw = (totalScore / matchedWeight) * matchQuality        (0–100)
  //   coverage = matchedWeight / totalFieldWeight               (penalizes sparse entities)
  //   score = raw * coverage
  // This ensures entities with many relevant fields outscore entities with few fields.
  const totalFieldWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const matchQuality = matchedWeight > 0 ? totalScore / matchedWeight : 0;
  const coverage = totalFieldWeight > 0 ? matchedWeight / totalFieldWeight : 0;
  let score = Math.min(100, Math.round(matchQuality * coverage * 100));

  // Identity bonus: if the 'id' field is an exact match, guarantee top ranking
  const idField = fields.find((f) => f.field === 'id');
  if (idField && terms.length === 1 && idField.text === terms[0]) {
    score = Math.max(score, 95);
  }

  return { score, matchedFields: matchedFields.filter((v, i, a) => a.indexOf(v) === i), excerpt: firstExcerpt };
}

// ─── Main Search Function ─────────────────────────────────────────────────────

/**
 * Search the Knowledge Graph for entities matching the query string.
 *
 * Deterministic: same query always returns same results in same order.
 */
export function search(query: string, options: SearchOptions = {}): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const graph = getGraph();
  const maxResults = options.maxResults ?? 20;
  const includeDeprecated = options.includeDeprecated ?? false;
  const entityTypes = options.entityTypes ?? ['ALL'];
  const filterAll = entityTypes.includes('ALL');

  const results: SearchResult[] = [];

  for (const node of Array.from(graph.nodes.values())) {
    if (!filterAll && !entityTypes.includes(node.entityType as SearchEntityType)) continue;
    if (!includeDeprecated && node.provenance.isDeprecated) continue;

    const fields = extractSearchableText(node);
    const { score, matchedFields, excerpt } = scoreMatch(query, fields);

    if (score > 0) {
      results.push({
        nodeId: node.nodeId,
        entityId: node.entityId,
        entityType: node.entityType,
        label: node.label,
        score,
        matchedFields,
        excerpt,
      });
    }
  }

  // Deterministic sort: score DESC, then entityId ASC (stable tiebreak)
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entityId.localeCompare(b.entityId);
  });

  return results.slice(0, maxResults);
}

/**
 * Search for entities of a specific type only.
 */
export function searchByType(
  query: string,
  entityType: NodeEntityType,
  maxResults = 20,
): SearchResult[] {
  return search(query, { entityTypes: [entityType], maxResults });
}

/**
 * Find entity by exact entity ID.
 */
export function findById(entityId: string): GraphNode | null {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return null;
  return graph.nodes.get(nid) ?? null;
}
