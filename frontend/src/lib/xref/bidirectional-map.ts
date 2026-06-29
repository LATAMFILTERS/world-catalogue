/**
 * bidirectional-map.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Bidirectional Mapping Index.
 * Maintains O(1) two-way lookup indexes:
 *   OEM Part ID → ELIMFILTERS part numbers
 *   ELIMFILTERS part number → OEM Part IDs
 *   OEM Part ID → equivalent OEM Part IDs (cross-OEM)
 */

import type { BidirectionalIndex, OemEquivalenceGroup } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';

// ============================================================================
// INDEX BUILDER
// ============================================================================

export function buildBidirectionalIndex(): BidirectionalIndex {
  const oemToElim = new Map<string, Set<string>>();
  const elimToOem = new Map<string, Set<string>>();
  const oemEquivalences = new Map<string, Set<string>>();

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    const fromNode = XREF_GRAPH.getNode(edge.fromNodeId);
    const toNode   = XREF_GRAPH.getNode(edge.toNodeId);

    if (!fromNode || !toNode) continue;

    if (toNode.type === 'ELIMFILTERS') {
      // OEM → ELIMFILTERS
      if (!oemToElim.has(fromNode.id)) oemToElim.set(fromNode.id, new Set());
      oemToElim.get(fromNode.id)!.add(toNode.partNumber);

      // ELIMFILTERS → OEM (reverse)
      if (!elimToOem.has(toNode.partNumber)) elimToOem.set(toNode.partNumber, new Set());
      elimToOem.get(toNode.partNumber)!.add(fromNode.id);
    }
  }

  // Build equivalences: for each ELIMFILTERS part, all OEM parts pointing to it
  // are considered equivalent to each other
  for (const [elimPart, oemSet] of Array.from(elimToOem.entries())) {
    for (const oemPartId of Array.from(oemSet)) {
      if (!oemEquivalences.has(oemPartId)) oemEquivalences.set(oemPartId, new Set());
      const eq = oemEquivalences.get(oemPartId)!;
      for (const otherOemPartId of Array.from(oemSet)) {
        if (otherOemPartId !== oemPartId) eq.add(otherOemPartId);
      }
    }
  }

  return { oemToElim, elimToOem, oemEquivalences };
}

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/** OEM Part ID → ELIMFILTERS part numbers (may be multiple if ONE_TO_MANY conflict) */
export function lookupElimFromOem(
  index: BidirectionalIndex,
  oemPartId: string
): string[] {
  return Array.from(index.oemToElim.get(oemPartId) ?? []);
}

/** ELIMFILTERS part number → all OEM Part IDs */
export function lookupOemFromElim(
  index: BidirectionalIndex,
  elimPartNumber: string
): string[] {
  return Array.from(index.elimToOem.get(elimPartNumber) ?? []);
}

/** Get all OEM parts that are cross-OEM equivalents of this OEM part */
export function lookupEquivalents(
  index: BidirectionalIndex,
  oemPartId: string
): string[] {
  return Array.from(index.oemEquivalences.get(oemPartId) ?? []);
}

// ============================================================================
// STATS
// ============================================================================

export function getBidirectionalStats(index: BidirectionalIndex): {
  totalOemParts: number;
  totalElimParts: number;
  mappedOemParts: number;
  mappedElimParts: number;
  oemPartsWithMultipleElim: number;
  elimPartsWithMultipleOem: number;
} {
  const oemPartsWithMultipleElim = Array.from(index.oemToElim.values())
    .filter(s => s.size > 1).length;
  const elimPartsWithMultipleOem = Array.from(index.elimToOem.values())
    .filter(s => s.size > 1).length;

  return {
    totalOemParts: XREF_GRAPH.getNodesByType('OEM_PART').length,
    totalElimParts: XREF_GRAPH.getNodesByType('ELIMFILTERS').length,
    mappedOemParts: index.oemToElim.size,
    mappedElimParts: index.elimToOem.size,
    oemPartsWithMultipleElim,
    elimPartsWithMultipleOem,
  };
}
