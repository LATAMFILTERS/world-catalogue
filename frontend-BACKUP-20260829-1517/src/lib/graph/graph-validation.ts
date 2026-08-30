/**
 * Phase 2 — Knowledge Graph Core: Graph Validation
 *
 * Extended validation over the KnowledgeGraph structure.
 * Supplements (never replaces) Foundation validation in validation.ts.
 *
 * Checks:
 *   GV-001: Orphan node detection — nodes with no relationships
 *   GV-002: Dangling relationship detection — relationship references unknown node
 *   GV-003: Alias integrity — ALIASES relationship must point to a live non-alias node
 *   GV-004: Memory coverage — every PUBLISHED entity must have ≥1 memory entry OR be tracked via HAS_MEMORY
 *   GV-005: IMPLEMENTS bidirectionality — tech→principle must have corresponding principle entry
 *   GV-006: GENERATES/RELATES_TO consistency — every GENERATES must have a RELATES_TO inverse or contaminationTypeId
 *   GV-007: Traversal integrity — every node must be reachable from at least one other node
 */

import type {
  KnowledgeGraph,
  GraphValidationIssue,
  GraphValidationReport,
} from './graph-types';
import { MATURITY } from '@/lib/registry/registry-types';

function issue(
  severity: GraphValidationIssue['severity'],
  code: string,
  message: string,
  affectedNodeId?: string,
  affectedRelationshipId?: string,
): GraphValidationIssue {
  return { severity, code, message, affectedNodeId, affectedRelationshipId };
}

// GV-001: Orphan node detection
function checkOrphanNodes(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  for (const [nid, node] of Array.from(graph.nodes)) {
    const hasOutbound = (graph.adjacency.get(nid)?.length ?? 0) > 0;
    const hasInbound = (graph.reverseAdjacency.get(nid)?.length ?? 0) > 0;
    if (!hasOutbound && !hasInbound) {
      issues.push(
        issue('WARNING', 'GV-001', `Orphan node: ${node.entityId} (${node.entityType}) has no relationships`, nid),
      );
    }
  }
  return issues;
}

// GV-002: Dangling relationships
function checkDanglingRelationships(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  for (const [rid, rel] of Array.from(graph.relationships)) {
    if (!graph.nodes.has(rel.sourceNodeId)) {
      issues.push(
        issue('ERROR', 'GV-002', `Dangling relationship: source ${rel.sourceNodeId} not found`, undefined, rid),
      );
    }
    if (!graph.nodes.has(rel.targetNodeId)) {
      issues.push(
        issue('ERROR', 'GV-002', `Dangling relationship: target ${rel.targetNodeId} not found`, undefined, rid),
      );
    }
  }
  return issues;
}

// GV-003: Alias integrity
function checkAliasIntegrity(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  for (const [rid, rel] of Array.from(graph.relationships)) {
    if (rel.type !== 'ALIASES') continue;
    const targetNode = graph.nodes.get(rel.targetNodeId);
    if (!targetNode) {
      issues.push(
        issue('ERROR', 'GV-003', `ALIASES relationship ${rid} points to unknown target ${rel.targetNodeId}`, undefined, rid),
      );
      continue;
    }
    if (targetNode.provenance.governanceStatus === 'ALIAS') {
      issues.push(
        issue('WARNING', 'GV-003', `ALIASES chain: ${rel.sourceNodeId} → ${rel.targetNodeId} which is itself an alias (double aliasing)`, rel.targetNodeId, rid),
      );
    }
  }
  return issues;
}

// GV-004: Memory coverage for PUBLISHED entities
function checkMemoryCoverage(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  // Only check non-memory entities that are PUBLISHED
  const memoryTypes = new Set(['ENGINEERING_MEMORY']);
  for (const node of Array.from(graph.nodes.values())) {
    if (memoryTypes.has(node.entityType)) continue;
    const maturity = Number(node.provenance.maturityLevel);
    if (maturity !== MATURITY.PUBLISHED) continue;
    const hasMemoryRel = (graph.adjacency.get(node.nodeId) ?? []).some((relId) => {
      const rel = graph.relationships.get(relId);
      return rel?.type === 'HAS_MEMORY';
    });
    const hasMemoryIds = node.provenance.memoryEntryIds.length > 0;
    if (!hasMemoryRel && !hasMemoryIds) {
      issues.push(
        issue('INFO', 'GV-004', `No Engineering Memory coverage for PUBLISHED entity: ${node.entityId} (${node.entityType})`, node.nodeId),
      );
    }
  }
  return issues;
}

// GV-005: IMPLEMENTS bidirectionality spot check
function checkImplementsBidirectionality(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  for (const rel of Array.from(graph.relationships.values())) {
    if (rel.type !== 'IMPLEMENTS') continue;
    // sourceNode is TECHNOLOGY, targetNode is ENGINEERING_PRINCIPLE
    const sourceNode = graph.nodes.get(rel.sourceNodeId);
    const targetNode = graph.nodes.get(rel.targetNodeId);
    if (!sourceNode || !targetNode) continue;
    if (sourceNode.entityType !== 'TECHNOLOGY_ARCHITECTURE') continue;
    if (targetNode.entityType !== 'ENGINEERING_PRINCIPLE') continue;

    // Check reverse: principle's implementedByTechnologies should include this tech
    const epProps = targetNode.properties as Record<string, unknown>;
    const implByTech = epProps['implementedByTechnologies'] as string[] | undefined;
    if (!implByTech) continue;
    if (!implByTech.includes(sourceNode.entityId)) {
      issues.push(
        issue('WARNING', 'GV-005',
          `IMPLEMENTS bidirectionality gap: ${sourceNode.entityId} implements ${targetNode.entityId} but principle.implementedByTechnologies does not include the tech`,
          targetNode.nodeId, rel.relationshipId),
      );
    }
  }
  return issues;
}

// GV-006: GENERATES / RELATES_TO consistency
function checkGeneratesRelatesTo(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];

  // Build set of (contNodeId, fmNodeId) pairs that have a GENERATES relationship
  const generatesSet = new Set<string>();
  const relatesToSet = new Set<string>();

  for (const rel of Array.from(graph.relationships.values())) {
    if (rel.type === 'GENERATES') {
      generatesSet.add(`${rel.sourceNodeId}|${rel.targetNodeId}`);
    }
    if (rel.type === 'RELATES_TO') {
      relatesToSet.add(`${rel.sourceNodeId}|${rel.targetNodeId}`);
    }
  }

  // Every GENERATES should have an inverse RELATES_TO
  for (const key of Array.from(generatesSet)) {
    const [contNodeId, fmNodeId] = key.split('|');
    const inverseKey = `${fmNodeId}|${contNodeId}`;
    if (!relatesToSet.has(inverseKey)) {
      const contNode = graph.nodes.get(contNodeId);
      const fmNode = graph.nodes.get(fmNodeId);
      issues.push(
        issue('INFO', 'GV-006',
          `GENERATES without RELATES_TO inverse: ${contNode?.entityId} → ${fmNode?.entityId}`,
          fmNodeId),
      );
    }
  }

  return issues;
}

// GV-007: Traversal connectivity — every non-memory node must have ≥1 neighbor
function checkTraversalConnectivity(graph: KnowledgeGraph): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  for (const node of Array.from(graph.nodes.values())) {
    if (node.entityType === 'ENGINEERING_MEMORY') continue;
    const out = graph.adjacency.get(node.nodeId)?.length ?? 0;
    const inn = graph.reverseAdjacency.get(node.nodeId)?.length ?? 0;
    if (out + inn === 0) {
      issues.push(
        issue('WARNING', 'GV-007',
          `Disconnected node: ${node.entityId} (${node.entityType}) is not reachable via any relationship`,
          node.nodeId),
      );
    }
  }
  return issues;
}

/**
 * Run all graph-level validations and return a report.
 */
export function validateGraph(graph: KnowledgeGraph): GraphValidationReport {
  const allIssues: GraphValidationIssue[] = [
    ...checkOrphanNodes(graph),
    ...checkDanglingRelationships(graph),
    ...checkAliasIntegrity(graph),
    ...checkMemoryCoverage(graph),
    ...checkImplementsBidirectionality(graph),
    ...checkGeneratesRelatesTo(graph),
    ...checkTraversalConnectivity(graph),
  ];

  const errorCount = allIssues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = allIssues.filter((i) => i.severity === 'WARNING').length;

  return {
    passed: errorCount === 0,
    nodeCount: graph.totalNodes,
    relationshipCount: graph.totalRelationships,
    issues: allIssues,
    errorCount,
    warningCount,
    timestamp: new Date().toISOString(),
  };
}
