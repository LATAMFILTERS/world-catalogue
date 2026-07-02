/**
 * Phase 3 — Engineering Services: Provenance Service
 *
 * Exposes governance metadata, Engineering Memory, aliases,
 * deprecated entities, and full audit trails for all governed entities.
 */

import { getGraph } from './knowledge-service';
import {
  getNodeProvenance,
  getRelationshipProvenance,
  getMemoryForNode,
  getAuditTrail,
  getDeprecatedNodes,
  getAliasNodes,
} from '@/lib/graph/provenance';
import type { GraphNode, NodeEntityType } from '@/lib/graph/graph-types';
import type { EntityProvenance, RelationshipProvenance } from '@/lib/graph/provenance';

export type { EntityProvenance, RelationshipProvenance };

// ─── Entity Provenance ────────────────────────────────────────────────────────

/**
 * Get provenance for an entity by its entity ID (e.g. 'TECH-MACROCORE').
 */
export function getEntityProvenance(entityId: string): EntityProvenance | null {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return null;
  return getNodeProvenance(graph, nid);
}

/**
 * Get provenance for a relationship by its relationship ID.
 */
export function getRelProvenance(relationshipId: string): RelationshipProvenance | null {
  return getRelationshipProvenance(getGraph(), relationshipId);
}

// ─── Engineering Memory ───────────────────────────────────────────────────────

/**
 * Get all Engineering Memory nodes for a given entity.
 */
export function getMemoryFor(entityId: string): GraphNode[] {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return [];
  return getMemoryForNode(graph, nid);
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

/**
 * Get the full governance audit trail for an entity:
 * provenance + memory chain + EDR references.
 */
export function getFullAuditTrail(entityId: string): ReturnType<typeof getAuditTrail> {
  return getAuditTrail(getGraph(), entityId);
}

// ─── Deprecated Entities ─────────────────────────────────────────────────────

/**
 * List all deprecated nodes in the Knowledge Graph.
 */
export function listDeprecatedEntities(): GraphNode[] {
  return getDeprecatedNodes(getGraph());
}

// ─── Alias Entities ──────────────────────────────────────────────────────────

/**
 * List all alias nodes (e.g. EP-SEP-005 → EP-TRB-002).
 */
export function listAliasEntities(): GraphNode[] {
  return getAliasNodes(getGraph());
}

// ─── Version History ─────────────────────────────────────────────────────────

export interface VersionHistoryEntry {
  readonly version: string;
  readonly publishedDate: string;
  readonly approvedBy: string;
  readonly changeNote: string;
  readonly edrRef?: string;
}

/**
 * Get the version history for a governed entity.
 */
export function getVersionHistory(entityId: string): VersionHistoryEntry[] {
  const graph = getGraph();
  const nid = graph.nodesByEntityId.get(entityId);
  if (!nid) return [];
  const node = graph.nodes.get(nid);
  if (!node) return [];
  const p = node.properties as Record<string, unknown>;
  const vh = p['versionHistory'];
  if (!Array.isArray(vh)) return [];
  return vh as VersionHistoryEntry[];
}

// ─── Governance Summary ───────────────────────────────────────────────────────

export interface GovernanceSummary {
  readonly totalEntities: number;
  readonly activeEntities: number;
  readonly deprecatedEntities: number;
  readonly aliasEntities: number;
  readonly supersededEntities: number;
  readonly entitiesWithMemory: number;
  readonly entitiesWithEDRRefs: number;
}

/**
 * Produce a governance health summary for the entire Knowledge Graph.
 */
export function getGovernanceSummary(): GovernanceSummary {
  const graph = getGraph();
  const nodes = Array.from(graph.nodes.values());

  let active = 0, deprecated = 0, alias = 0, superseded = 0, withMemory = 0, withEDR = 0;

  for (const node of nodes) {
    switch (node.provenance.governanceStatus) {
      case 'ACTIVE': active++; break;
      case 'DEPRECATED': deprecated++; break;
      case 'ALIAS': alias++; break;
      case 'SUPERSEDED': superseded++; break;
    }
    if (node.provenance.memoryEntryIds.length > 0) withMemory++;
    if (node.provenance.edrRefs.length > 0) withEDR++;
  }

  return {
    totalEntities: nodes.length,
    activeEntities: active,
    deprecatedEntities: deprecated,
    aliasEntities: alias,
    supersededEntities: superseded,
    entitiesWithMemory: withMemory,
    entitiesWithEDRRefs: withEDR,
  };
}

/**
 * Get all nodes of a specific entity type with their provenance.
 */
export function listEntitiesWithProvenance(
  entityType: NodeEntityType,
): Array<{ node: GraphNode; provenance: EntityProvenance }> {
  const graph = getGraph();
  const nodeIds = graph.nodesByEntityType.get(entityType) ?? [];
  return nodeIds
    .map((nid) => {
      const node = graph.nodes.get(nid);
      const prov = node ? getNodeProvenance(graph, nid) : null;
      if (!node || !prov) return null;
      return { node, provenance: prov };
    })
    .filter((x): x is { node: GraphNode; provenance: EntityProvenance } => x !== null);
}
