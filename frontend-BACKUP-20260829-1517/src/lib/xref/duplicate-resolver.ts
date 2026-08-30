/**
 * duplicate-resolver.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Duplicate Resolution Engine.
 * Finds and resolves duplicate nodes and edges in the graph.
 */

import type { DuplicateGroup } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';

let dupCounter = 0;
function newDupId(): string {
  return `DUP_${String(++dupCounter).padStart(6, '0')}`;
}

// ============================================================================
// DUPLICATE NODE DETECTION
// ============================================================================

export function findDuplicateNodes(): DuplicateGroup[] {
  dupCounter = 0;
  const groups: DuplicateGroup[] = [];

  // Group nodes by (oemId + normalizedPartNumber)
  const byKey = new Map<string, string[]>();
  for (const node of XREF_GRAPH.getAllNodes()) {
    const key = `${node.oemId}::${node.partNumberNormalized}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(node.id);
  }

  for (const [, nodeIds] of Array.from(byKey.entries())) {
    if (nodeIds.length < 2) continue;

    // Choose canonical: the one added earliest (first ID alphabetically as proxy)
    const canonical = nodeIds.sort()[0];
    groups.push({
      groupId: newDupId(),
      duplicateType: 'EXACT',
      nodeIds,
      canonical,
      reason: `${nodeIds.length} nodes share the same OEM + normalized part number`,
    });
  }

  return groups;
}

// ============================================================================
// DUPLICATE EDGE DETECTION
// ============================================================================

export function findDuplicateEdges(): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const byKey = new Map<string, string[]>();

  for (const edge of XREF_GRAPH.getAllEdges()) {
    const key = `${edge.fromNodeId}→${edge.toNodeId}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(edge.id);
  }

  for (const [, edgeIds] of Array.from(byKey.entries())) {
    if (edgeIds.length < 2) continue;

    // Canonical = highest confidence edge
    const withConf = edgeIds.map(id => ({
      id,
      conf: XREF_GRAPH.getEdge(id)?.confidenceScore ?? 0,
    }));
    const canonical = withConf.sort((a, b) => b.conf - a.conf)[0].id;

    groups.push({
      groupId: newDupId(),
      duplicateType: 'EXACT',
      nodeIds: edgeIds, // repurposing nodeIds for edge IDs
      canonical,
      reason: `${edgeIds.length} edges share the same from→to pair; keep highest confidence`,
    });
  }

  return groups;
}

// ============================================================================
// COMBINED RESOLVER
// ============================================================================

export function resolveAllDuplicates(): {
  nodeGroups: DuplicateGroup[];
  edgeGroups: DuplicateGroup[];
  totalDuplicates: number;
} {
  const nodeGroups = findDuplicateNodes();
  const edgeGroups = findDuplicateEdges();
  const totalDuplicates = nodeGroups.reduce((s, g) => s + g.nodeIds.length - 1, 0) +
                          edgeGroups.reduce((s, g) => s + g.nodeIds.length - 1, 0);
  return { nodeGroups, edgeGroups, totalDuplicates };
}
