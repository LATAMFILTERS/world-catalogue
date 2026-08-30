/**
 * gap-detector.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Gap Detection Engine.
 * Automatically generates an engineering work queue of missing mappings,
 * low-confidence links, and unverified chains.
 */

import type { GapReport, GapItem, GapCategory } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';
import { CONFIDENCE_THRESHOLDS } from './confidence-engine';

let gapCounter = 0;
function newGapId(): string {
  return `GAP_${String(++gapCounter).padStart(6, '0')}`;
}

function gap(
  category: GapCategory,
  priority: GapItem['priority'],
  description: string,
  affectedNodes: string[],
  suggestedAction: string,
  estimatedImpact: string
): GapItem {
  return {
    gapId: newGapId(),
    category,
    priority,
    description,
    affectedNodes,
    suggestedAction,
    estimatedImpact,
  };
}

// ============================================================================
// GAP DETECTORS
// ============================================================================

function detectUnmappedOemParts(): GapItem[] {
  const items: GapItem[] = [];

  for (const node of XREF_GRAPH.getNodesByType('OEM_PART')) {
    const outEdges = XREF_GRAPH.getEdgesFrom(node.id);
    const hasElimMapping = outEdges.some(e => {
      const to = XREF_GRAPH.getNode(e.toNodeId);
      return to?.type === 'ELIMFILTERS';
    });

    if (!hasElimMapping) {
      items.push(gap(
        'MISSING_OEM_MAPPING',
        'HIGH',
        `OEM part "${node.id}" (${node.oemId}: ${node.partNumber}) has no ELIMFILTERS cross reference`,
        [node.id],
        `Research ELIMFILTERS equivalence for ${node.oemId} ${node.partNumber}`,
        `Adds 1 validated cross reference to the network`
      ));
    }
  }

  return items;
}

function detectLowConfidenceMappings(): GapItem[] {
  const items: GapItem[] = [];

  for (const edge of XREF_GRAPH.getActiveEdges()) {
    if (edge.confidenceScore < CONFIDENCE_THRESHOLDS.APPROVAL_MINIMUM) {
      items.push(gap(
        'LOW_CONFIDENCE_MAPPING',
        'HIGH',
        `Edge "${edge.id}" has confidence ${edge.confidenceScore}/100 — below approval threshold (${CONFIDENCE_THRESHOLDS.APPROVAL_MINIMUM})`,
        [edge.fromNodeId, edge.toNodeId],
        `Engineering review required to validate or reject this mapping`,
        `Removes unvalidated data from the cross-reference network`
      ));
    } else if (edge.confidenceScore < CONFIDENCE_THRESHOLDS.VERIFIED_DIMENSIONS) {
      items.push(gap(
        'LOW_CONFIDENCE_MAPPING',
        'MEDIUM',
        `Edge "${edge.id}" has confidence ${edge.confidenceScore}/100 — only cross-reference verified, no dimension check`,
        [edge.fromNodeId, edge.toNodeId],
        `Perform dimensional validation to increase confidence to 90+`,
        `Upgrades mapping from CROSS_REF_ONLY to VERIFIED_DIMENSIONS`
      ));
    }
  }

  return items;
}

function detectUnverifiedElimParts(): GapItem[] {
  const items: GapItem[] = [];

  for (const node of XREF_GRAPH.getNodesByType('ELIMFILTERS')) {
    const inEdges = XREF_GRAPH.getEdgesTo(node.id);

    if (inEdges.length === 0) {
      items.push(gap(
        'MISSING_OEM_MAPPING',
        'MEDIUM',
        `ELIMFILTERS part "${node.partNumber}" has no OEM cross references`,
        [node.id],
        `Map this ELIMFILTERS part to at least one OEM equivalent`,
        `Makes this part discoverable via OEM catalog searches`
      ));
    }

    const hasVerified = inEdges.some(e => e.confidenceScore >= CONFIDENCE_THRESHOLDS.VERIFIED_DIMENSIONS);
    if (inEdges.length > 0 && !hasVerified) {
      items.push(gap(
        'UNVERIFIED_CHAIN',
        'MEDIUM',
        `ELIMFILTERS part "${node.partNumber}" has ${inEdges.length} mapping(s) but none are dimensionally verified`,
        [node.id, ...inEdges.map(e => e.fromNodeId)],
        `Perform dimensional verification on at least one cross reference`,
        `Achieves VERIFIED_DIMENSIONS confidence level`
      ));
    }
  }

  return items;
}

// ============================================================================
// MAIN GAP DETECTOR
// ============================================================================

export function detectGaps(): GapReport {
  gapCounter = 0;
  const workQueue: GapItem[] = [
    ...detectUnmappedOemParts(),
    ...detectLowConfidenceMappings(),
    ...detectUnverifiedElimParts(),
  ];

  // Sort: CRITICAL > HIGH > MEDIUM > LOW
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  workQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const criticalGaps = workQueue.filter(g => g.priority === 'CRITICAL').length;

  return {
    generatedAt: new Date().toISOString(),
    totalGaps: workQueue.length,
    criticalGaps,
    workQueue,
  };
}
