/**
 * Phase 3 — Engineering Services: Engineering Search Service
 *
 * Deterministic semantic search over the Knowledge Graph.
 * No AI. No embeddings. Graph traversal + field matching only.
 */

import { getGraph } from './knowledge-service';
import { toPublicGraphNode } from './public-knowledge-gateway';
import type { GraphNode, NodeEntityType } from '@/lib/graph/graph-types';

export type SearchEntityType = NodeEntityType | 'ALL';

export interface SearchResult {
  readonly nodeId: string;
  readonly entityId: string;
  readonly entityType: NodeEntityType;
  readonly label: string;
  readonly score: number;
  readonly matchedFields: readonly string[];
  readonly excerpt: string;
}

export interface SearchOptions {
  readonly entityTypes?: readonly SearchEntityType[];
  readonly maxResults?: number;
  readonly includeDeprecated?: boolean;
  readonly includeNonPublic?: boolean;
}

function extractSearchableText(node: GraphNode): Array<{ field: string; text: string; weight: number }> {
  const p = node.properties as Record<string, unknown>;
  const fields: Array<{ field: string; text: string; weight: number }> = [];

  function add(field: string, value: unknown, weight: number) {
    if (typeof value === 'string' && value.length > 0) fields.push({ field, text: value.toLowerCase(), weight });
  }

  add('id', p['id'], 100);
  add('code', p['code'], 90);
  add('name', p['name'], 85);
  add('technologyName', p['technologyName'], 85);
  add('commercialName', p['commercialName'], 80);

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
      add('entityId', p['entityId'], 30);
      add('archivedReason', p['archivedReason'], 15);
      break;
  }

  return fields;
}

function scoreMatch(query: string, fields: Array<{ field: string; text: string; weight: number }>) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { score: 0, matchedFields: [] as string[], excerpt: '' };

  let totalScore = 0;
  let matchedWeight = 0;
  const matchedFields: string[] = [];
  let firstExcerpt = '';

  for (const { field, text, weight } of fields) {
    let fieldScore = 0;
    let fieldMatched = false;
    for (const term of terms) {
      if (text === term) { fieldScore += weight; fieldMatched = true; }
      else if (text.startsWith(term)) { fieldScore += weight * 0.8; fieldMatched = true; }
      else if (text.includes(term)) { fieldScore += weight * 0.5; fieldMatched = true; }
    }
    if (fieldMatched) {
      totalScore += fieldScore;
      matchedWeight += weight;
      matchedFields.push(field);
      if (!firstExcerpt) {
        const idx = text.indexOf(terms[0]);
        firstExcerpt = text.slice(Math.max(0, idx - 20), Math.max(0, idx - 20) + 120);
      }
    }
  }

  const totalFieldWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const matchQuality = matchedWeight > 0 ? totalScore / matchedWeight : 0;
  const coverage = totalFieldWeight > 0 ? matchedWeight / totalFieldWeight : 0;
  let score = Math.min(100, Math.round(matchQuality * coverage * 100));
  const idField = fields.find((f) => f.field === 'id');
  if (idField && terms.length === 1 && idField.text === terms[0]) score = Math.max(score, 95);

  return { score, matchedFields: matchedFields.filter((v, i, a) => a.indexOf(v) === i), excerpt: firstExcerpt };
}

export function search(query: string, options: SearchOptions = {}): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const graph = getGraph();
  const maxResults = options.maxResults ?? 20;
  const includeDeprecated = options.includeDeprecated ?? false;
  const includeNonPublic = options.includeNonPublic ?? false;
  const entityTypes = options.entityTypes ?? ['ALL'];
  const filterAll = entityTypes.includes('ALL');
  const results: SearchResult[] = [];

  for (const rawNode of Array.from(graph.nodes.values())) {
    if (!filterAll && !entityTypes.includes(rawNode.entityType as SearchEntityType)) continue;
    if (!includeNonPublic && rawNode.provenance.governanceStatus !== 'ACTIVE') continue;
    if (!includeDeprecated && rawNode.provenance.isDeprecated) continue;

    const node = includeNonPublic ? rawNode : toPublicGraphNode(rawNode);
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

  results.sort((a, b) => b.score !== a.score ? b.score - a.score : a.entityId.localeCompare(b.entityId));
  return results.slice(0, maxResults);
}

export function searchByType(query: string, entityType: NodeEntityType, maxResults = 20): SearchResult[] {
  return search(query, { entityTypes: [entityType], maxResults });
}

export function findById(entityId: string, options: { includeNonPublic?: boolean } = {}): GraphNode | null {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return null;
  const node = graph.nodes.get(nid);
  if (!node) return null;
  if (options.includeNonPublic === true) return node;
  if (node.provenance.governanceStatus !== 'ACTIVE') return null;
  return toPublicGraphNode(node);
}
