/**
 * conflict-detector.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Conflict Detection Engine.
 * Automatically scans the graph for every class of mapping conflict.
 */

import type { XrefConflict, ConflictType } from './xref-types';
import { XREF_GRAPH, buildElimNodeId } from './xref-resolver';

let conflictCounter = 0;
function newConflictId(): string {
  return `CONFLICT_${String(++conflictCounter).padStart(6, '0')}`;
}

// ============================================================================
// INDIVIDUAL DETECTORS
// ============================================================================

/** ONE_TO_MANY: One OEM part maps to multiple active ELIMFILTERS parts */
function detectOneToMany(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const oemNodes = XREF_GRAPH.getNodesByType('OEM_PART');

  for (const node of oemNodes) {
    const outEdges = XREF_GRAPH.getEdgesFrom(node.id);
    const elimTargets = outEdges
      .filter(e => {
        const target = XREF_GRAPH.getNode(e.toNodeId);
        return target?.type === 'ELIMFILTERS';
      })
      .map(e => e.toNodeId);

    if (elimTargets.length > 1) {
      conflicts.push({
        conflictId: newConflictId(),
        type: 'ONE_TO_MANY',
        severity: 'HIGH',
        involvedNodes: [node.id, ...elimTargets],
        involvedEdges: outEdges.filter(e => elimTargets.includes(e.toNodeId)).map(e => e.id),
        description: `OEM part "${node.id}" maps to ${elimTargets.length} ELIMFILTERS parts: ${elimTargets.join(', ')}`,
        detectedAt: new Date().toISOString(),
        resolution: 'KEEP_HIGHEST_CONFIDENCE',
      });
    }
  }
  return conflicts;
}

/** DUTY_CONFLICT: Same OEM part node marked as both HD and LD */
function detectDutyConflicts(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const allNodes = XREF_GRAPH.getAllNodes();
  const byNormalized = new Map<string, typeof allNodes>();

  for (const node of allNodes) {
    const key = `${node.oemId}::${node.partNumberNormalized}`;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key)!.push(node);
  }

  for (const [, group] of byNormalized) {
    const duties = new Set(group.map(n => n.duty).filter(d => d !== 'UNKNOWN'));
    if (duties.size > 1) {
      conflicts.push({
        conflictId: newConflictId(),
        type: 'DUTY_CONFLICT',
        severity: 'CRITICAL',
        involvedNodes: group.map(n => n.id),
        involvedEdges: [],
        description: `Part "${group[0].oemId}::${group[0].partNumberNormalized}" has conflicting duty classes: ${[...duties].join(', ')}`,
        detectedAt: new Date().toISOString(),
        resolution: 'MANUAL_REQUIRED',
      });
    }
  }
  return conflicts;
}

/** CATEGORY_CONFLICT: Same OEM part in multiple incompatible categories */
function detectCategoryConflicts(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const allNodes = XREF_GRAPH.getAllNodes();
  const byNormalized = new Map<string, typeof allNodes>();

  for (const node of allNodes) {
    const key = `${node.oemId}::${node.partNumberNormalized}`;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key)!.push(node);
  }

  for (const [, group] of byNormalized) {
    const categories = new Set(group.map(n => n.category).filter(Boolean));
    if (categories.size > 1) {
      conflicts.push({
        conflictId: newConflictId(),
        type: 'CATEGORY_CONFLICT',
        severity: 'HIGH',
        involvedNodes: group.map(n => n.id),
        involvedEdges: [],
        description: `Part "${group[0].oemId}::${group[0].partNumberNormalized}" assigned to conflicting categories: ${[...categories].join(', ')}`,
        detectedAt: new Date().toISOString(),
        resolution: 'MANUAL_REQUIRED',
      });
    }
  }
  return conflicts;
}

/** DUPLICATE_MAPPING: Exact same (fromNodeId, toNodeId) edge registered more than once */
function detectDuplicateMappings(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const edges = XREF_GRAPH.getAllEdges();
  const seen = new Map<string, string[]>();

  for (const edge of edges) {
    const key = `${edge.fromNodeId}→${edge.toNodeId}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(edge.id);
  }

  for (const [key, edgeIds] of seen) {
    if (edgeIds.length > 1) {
      const [from, to] = key.split('→');
      conflicts.push({
        conflictId: newConflictId(),
        type: 'DUPLICATE_MAPPING',
        severity: 'MEDIUM',
        involvedNodes: [from, to],
        involvedEdges: edgeIds,
        description: `Edge "${key}" is registered ${edgeIds.length} times`,
        detectedAt: new Date().toISOString(),
        resolution: 'KEEP_HIGHEST_CONFIDENCE',
      });
    }
  }
  return conflicts;
}

/** BROKEN_CHAIN: An edge references a node ID that doesn't exist */
function detectBrokenChains(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const edges = XREF_GRAPH.getAllEdges();

  for (const edge of edges) {
    const fromMissing = !XREF_GRAPH.hasNode(edge.fromNodeId);
    const toMissing = !XREF_GRAPH.hasNode(edge.toNodeId);

    if (fromMissing || toMissing) {
      conflicts.push({
        conflictId: newConflictId(),
        type: 'BROKEN_CHAIN',
        severity: 'CRITICAL',
        involvedNodes: [edge.fromNodeId, edge.toNodeId].filter(
          id => !XREF_GRAPH.hasNode(id)
        ),
        involvedEdges: [edge.id],
        description: `Edge "${edge.id}" references missing node(s):${fromMissing ? ' from=' + edge.fromNodeId : ''}${toMissing ? ' to=' + edge.toNodeId : ''}`,
        detectedAt: new Date().toISOString(),
        resolution: 'REJECT_ALL',
      });
    }
  }
  return conflicts;
}

/** CIRCULAR_REFERENCE: A → B → ... → A detected via DFS */
function detectCircularReferences(): XrefConflict[] {
  const conflicts: XrefConflict[] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (stack.has(nodeId)) {
      // Cycle found
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart);
      conflicts.push({
        conflictId: newConflictId(),
        type: 'CIRCULAR_REFERENCE',
        severity: 'CRITICAL',
        involvedNodes: cycle,
        involvedEdges: [],
        description: `Circular reference detected: ${cycle.join(' → ')} → ${nodeId}`,
        detectedAt: new Date().toISOString(),
        resolution: 'MANUAL_REQUIRED',
      });
      return;
    }
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    stack.add(nodeId);

    const outEdges = XREF_GRAPH.getEdgesFrom(nodeId);
    for (const edge of outEdges) {
      dfs(edge.toNodeId, [...path, nodeId]);
    }

    stack.delete(nodeId);
  }

  for (const node of XREF_GRAPH.getAllNodes()) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return conflicts;
}

// ============================================================================
// MAIN CONFLICT DETECTOR
// ============================================================================

export function detectAllConflicts(): XrefConflict[] {
  conflictCounter = 0;
  return [
    ...detectOneToMany(),
    ...detectDutyConflicts(),
    ...detectCategoryConflicts(),
    ...detectDuplicateMappings(),
    ...detectBrokenChains(),
    ...detectCircularReferences(),
  ];
}
