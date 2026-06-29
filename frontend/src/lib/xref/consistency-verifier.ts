/**
 * consistency-verifier.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Consistency Verification Engine.
 * Verifies graph chains are complete, no orphan nodes, no invalid directions.
 */

import type { ConsistencyReport, ConsistencyIssue } from './xref-types';
import { XREF_GRAPH } from './xref-resolver';

let issueCounter = 0;
function newIssueId(): string {
  return `CISSUE_${String(++issueCounter).padStart(6, '0')}`;
}

// ============================================================================
// INDIVIDUAL CHECKS
// ============================================================================

function checkOrphanNodes(): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const allEdges = XREF_GRAPH.getAllEdges();
  const connectedNodes = new Set<string>();

  for (const edge of allEdges) {
    connectedNodes.add(edge.fromNodeId);
    connectedNodes.add(edge.toNodeId);
  }

  for (const node of XREF_GRAPH.getAllNodes()) {
    if (!connectedNodes.has(node.id)) {
      issues.push({
        issueId: newIssueId(),
        nodeId: node.id,
        type: 'ORPHAN_NODE',
        severity: 'MEDIUM',
        description: `Node "${node.id}" has no edges — it is an orphan in the graph`,
      });
    }
  }

  return issues;
}

function checkBrokenEdges(): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const edge of XREF_GRAPH.getAllEdges()) {
    if (!XREF_GRAPH.hasNode(edge.fromNodeId)) {
      issues.push({
        issueId: newIssueId(),
        edgeId: edge.id,
        type: 'BROKEN_CHAIN',
        severity: 'CRITICAL',
        description: `Edge "${edge.id}" references non-existent fromNode "${edge.fromNodeId}"`,
      });
    }
    if (!XREF_GRAPH.hasNode(edge.toNodeId)) {
      issues.push({
        issueId: newIssueId(),
        edgeId: edge.id,
        type: 'BROKEN_CHAIN',
        severity: 'CRITICAL',
        description: `Edge "${edge.id}" references non-existent toNode "${edge.toNodeId}"`,
      });
    }
  }

  return issues;
}

function checkInvalidDirections(): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const edge of XREF_GRAPH.getAllEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    const to   = XREF_GRAPH.getNode(edge.toNodeId);
    if (!from || !to) continue;

    // ELIMFILTERS node should only appear as a destination, not a source
    // (unless it is ELIMFILTERS_TO_OEM direction)
    if (from.type === 'ELIMFILTERS' && edge.direction !== 'ELIMFILTERS_TO_OEM') {
      issues.push({
        issueId: newIssueId(),
        edgeId: edge.id,
        type: 'INVALID_DIRECTION',
        severity: 'HIGH',
        description: `Edge "${edge.id}" has an ELIMFILTERS node as source with invalid direction "${edge.direction}"`,
      });
    }
  }

  return issues;
}

function checkDutyMismatches(): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const edge of XREF_GRAPH.getAllEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    const to   = XREF_GRAPH.getNode(edge.toNodeId);
    if (!from || !to) continue;

    if (
      from.duty !== 'UNKNOWN' && to.duty !== 'UNKNOWN' &&
      from.duty !== to.duty
    ) {
      issues.push({
        issueId: newIssueId(),
        edgeId: edge.id,
        type: 'DUTY_MISMATCH',
        severity: 'HIGH',
        description: `Edge "${edge.id}" connects "${from.duty}" part to "${to.duty}" part — duty class mismatch`,
      });
    }
  }

  return issues;
}

function checkCategoryMismatches(): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const edge of XREF_GRAPH.getAllEdges()) {
    const from = XREF_GRAPH.getNode(edge.fromNodeId);
    const to   = XREF_GRAPH.getNode(edge.toNodeId);
    if (!from || !to) continue;

    if (from.category && to.category && from.category !== to.category) {
      issues.push({
        issueId: newIssueId(),
        edgeId: edge.id,
        type: 'CATEGORY_MISMATCH',
        severity: 'HIGH',
        description: `Edge "${edge.id}" connects "${from.category}" to "${to.category}" — category mismatch`,
      });
    }
  }

  return issues;
}

// ============================================================================
// MAIN VERIFIER
// ============================================================================

export function verifyConsistency(): ConsistencyReport {
  issueCounter = 0;
  const generatedAt = new Date().toISOString();
  const totalChecked = XREF_GRAPH.nodeCount + XREF_GRAPH.edgeCount;

  const issues: ConsistencyIssue[] = [
    ...checkOrphanNodes(),
    ...checkBrokenEdges(),
    ...checkInvalidDirections(),
    ...checkDutyMismatches(),
    ...checkCategoryMismatches(),
  ];

  const failed   = issues.filter(i => i.severity === 'CRITICAL').length;
  const warnings = issues.filter(i => i.severity !== 'CRITICAL').length;
  const passed   = totalChecked - issues.length;

  return {
    generatedAt,
    totalChecked,
    passed: Math.max(0, passed),
    failed,
    warnings,
    issues,
  };
}
