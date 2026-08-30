/**
 * oem-equivalence.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * OEM Equivalence Engine.
 * Detects and groups OEM parts that resolve to the same ELIMFILTERS product.
 * These are "cross-OEM equivalences" — e.g. Donaldson P181052 ≡ Fleetguard AF25139.
 */

import type { OemEquivalenceGroup } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';

let groupCounter = 0;
function newGroupId(): string {
  return `OEQG_${String(++groupCounter).padStart(6, '0')}`;
}

// ============================================================================
// EQUIVALENCE GROUP BUILDER
// ============================================================================

export function buildEquivalenceGroups(): OemEquivalenceGroup[] {
  groupCounter = 0;
  const groups: OemEquivalenceGroup[] = [];

  // Index: ELIMFILTERS part number → list of OEM parts pointing to it
  const elimToOemParts = new Map<string, string[]>();
  const elimEdgeConfidence = new Map<string, number[]>();

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    const toNode = XREF_GRAPH.getNode(edge.toNodeId);
    if (!toNode || toNode.type !== 'ELIMFILTERS') continue;

    const elimPart = toNode.partNumber;
    if (!elimToOemParts.has(elimPart)) {
      elimToOemParts.set(elimPart, []);
      elimEdgeConfidence.set(elimPart, []);
    }
    elimToOemParts.get(elimPart)!.push(edge.fromNodeId);
    elimEdgeConfidence.get(elimPart)!.push(edge.confidenceScore);
  }

  // Only create groups where 2+ OEM parts map to the same ELIMFILTERS part
  for (const [elimPart, oemPartIds] of Array.from(elimToOemParts.entries())) {
    if (oemPartIds.length < 2) continue;

    const confidences = elimEdgeConfidence.get(elimPart) ?? [];
    const avgConfidence = confidences.length
      ? Math.round(confidences.reduce((s, c) => s + c, 0) / confidences.length)
      : 0;

    const oems = Array.from(new Set(
      oemPartIds.map(id => XREF_GRAPH.getNode(id)?.oemId ?? 'unknown')
    ));

    groups.push({
      groupId: newGroupId(),
      elimPartNumber: elimPart,
      equivalentOemParts: oemPartIds,
      groupConfidence: avgConfidence,
      oems,
    });
  }

  return groups.sort((a, b) => b.equivalentOemParts.length - a.equivalentOemParts.length);
}

// ============================================================================
// LOOKUP: Are two OEM parts equivalent?
// ============================================================================

export function areEquivalent(
  groups: OemEquivalenceGroup[],
  oemPartIdA: string,
  oemPartIdB: string
): boolean {
  return groups.some(
    g => g.equivalentOemParts.includes(oemPartIdA) && g.equivalentOemParts.includes(oemPartIdB)
  );
}

// ============================================================================
// STATS
// ============================================================================

export function getEquivalenceStats(groups: OemEquivalenceGroup[]): {
  totalGroups: number;
  totalEquivalentParts: number;
  maxGroupSize: number;
  averageGroupSize: number;
  topOems: string[];
} {
  if (groups.length === 0) {
    return { totalGroups: 0, totalEquivalentParts: 0, maxGroupSize: 0, averageGroupSize: 0, topOems: [] };
  }

  const totalEquivalentParts = groups.reduce((s, g) => s + g.equivalentOemParts.length, 0);
  const maxGroupSize = Math.max(...groups.map(g => g.equivalentOemParts.length));
  const averageGroupSize = Math.round(totalEquivalentParts / groups.length);

  const oemCount = new Map<string, number>();
  for (const g of groups) {
    for (const oem of g.oems) {
      oemCount.set(oem, (oemCount.get(oem) ?? 0) + 1);
    }
  }
  const topOems = Array.from(oemCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([oem]) => oem);

  return { totalGroups: groups.length, totalEquivalentParts, maxGroupSize, averageGroupSize, topOems };
}
