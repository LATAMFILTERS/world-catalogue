/**
 * Phase 3 — Engineering Services: Recommendation Service
 *
 * Graph-driven recommendations with full explainability.
 * Every recommendation traces its reasoning through the Knowledge Graph.
 *
 * No AI. No ML. Deterministic graph traversal only.
 */

import { getGraph } from './knowledge-service';
import {
  findProductsByPrinciple,
  findTechnologiesByFailureMode,
  findStandards,
  findTechnologiesByContamination,
  getNodeByEntityId,
  getRelationships,
} from '@/lib/graph/graph-api';
import type { GraphNode } from '@/lib/graph/graph-types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecommendationStep {
  readonly fromEntityId: string;
  readonly fromEntityType: string;
  readonly fromLabel: string;
  readonly relationshipType: string;
  readonly toEntityId: string;
  readonly toEntityType: string;
  readonly toLabel: string;
  readonly reasoning: string;
}

export interface Recommendation {
  readonly recommendationId: string;
  readonly queryEntityId: string;
  readonly queryEntityType: string;
  readonly targetEntityId: string;
  readonly targetEntityType: string;
  readonly targetLabel: string;
  readonly confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly steps: readonly RecommendationStep[];
  readonly explanation: string;
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

let _recCounter = 0;
function recId(): string {
  return `REC-${String(++_recCounter).padStart(5, '0')}`;
}

// ─── Step Builder ─────────────────────────────────────────────────────────────

function step(
  from: GraphNode,
  relType: string,
  to: GraphNode,
  reasoning: string,
): RecommendationStep {
  return {
    fromEntityId: from.entityId,
    fromEntityType: from.entityType,
    fromLabel: from.label,
    relationshipType: relType,
    toEntityId: to.entityId,
    toEntityType: to.entityType,
    toLabel: to.label,
    reasoning,
  };
}

// ─── Recommendation Functions ─────────────────────────────────────────────────

/**
 * Given an Engineering Principle, recommend Technologies that implement it,
 * then Protection Media those technologies use.
 *
 * Path: EngineeringPrinciple ← IMPLEMENTS — Technology → USES → ProtectionMedia
 */
export function recommendFromPrinciple(principleEntityId: string): Recommendation[] {
  const graph = getGraph();
  const principleNode = getNodeByEntityId(graph, principleEntityId);
  if (!principleNode || principleNode.entityType !== 'ENGINEERING_PRINCIPLE') return [];

  const { inbound } = getRelationships(graph, principleNode.nodeId);
  const techNodes = inbound
    .filter((r) => r.type === 'IMPLEMENTS')
    .map((r) => graph.nodes.get(r.sourceNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'TECHNOLOGY_ARCHITECTURE');

  const recs: Recommendation[] = [];

  for (const techNode of techNodes) {
    // Step 1: Principle → Technology
    const s1 = step(
      principleNode,
      'IMPLEMENTS',
      techNode,
      `${techNode.label} implements the engineering principle ${principleNode.label}.`,
    );

    // Step 2: Technology → Protection Media
    const { outbound: techOut } = getRelationships(graph, techNode.nodeId);
    const mediaNodes = techOut
      .filter((r) => r.type === 'USES')
      .map((r) => graph.nodes.get(r.targetNodeId))
      .filter((n): n is GraphNode => n !== undefined && n.entityType === 'PROTECTION_MEDIA');

    if (mediaNodes.length === 0) {
      recs.push({
        recommendationId: recId(),
        queryEntityId: principleEntityId,
        queryEntityType: 'ENGINEERING_PRINCIPLE',
        targetEntityId: techNode.entityId,
        targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
        targetLabel: techNode.label,
        confidence: 'HIGH',
        steps: [s1],
        explanation: `${techNode.label} directly implements ${principleNode.label}.`,
      });
    } else {
      for (const mediaNode of mediaNodes) {
        const s2 = step(
          techNode,
          'USES',
          mediaNode,
          `${techNode.label} employs ${mediaNode.label} as protection media.`,
        );
        recs.push({
          recommendationId: recId(),
          queryEntityId: principleEntityId,
          queryEntityType: 'ENGINEERING_PRINCIPLE',
          targetEntityId: mediaNode.entityId,
          targetEntityType: 'PROTECTION_MEDIA',
          targetLabel: mediaNode.label,
          confidence: 'HIGH',
          steps: [s1, s2],
          explanation: `${principleNode.label} is implemented by ${techNode.label}, which uses ${mediaNode.label}.`,
        });
      }
    }
  }

  return recs;
}

/**
 * Given a Failure Mode, recommend Technologies that prevent it,
 * then trace through to the Contamination that causes it.
 *
 * Path: FailureMode ← PREVENTS — Technology
 *       FailureMode ← RELATES_TO — Contamination
 */
export function recommendFromFailureMode(failureModeEntityId: string): Recommendation[] {
  const graph = getGraph();
  const fmNode = getNodeByEntityId(graph, failureModeEntityId);
  if (!fmNode || fmNode.entityType !== 'FAILURE_MODE') return [];

  const techNodes = findTechnologiesByFailureMode(graph, failureModeEntityId);
  const recs: Recommendation[] = [];

  // Technology recommendations
  for (const techNode of techNodes) {
    const s1 = step(
      techNode,
      'PREVENTS',
      fmNode,
      `${techNode.label} controls the failure mode: ${fmNode.label}.`,
    );
    // Find media used by this technology
    const { outbound: techOut } = getRelationships(graph, techNode.nodeId);
    const mediaNodes = techOut
      .filter((r) => r.type === 'USES')
      .map((r) => graph.nodes.get(r.targetNodeId))
      .filter((n): n is GraphNode => n !== undefined && n.entityType === 'PROTECTION_MEDIA');

    if (mediaNodes.length === 0) {
      recs.push({
        recommendationId: recId(),
        queryEntityId: failureModeEntityId,
        queryEntityType: 'FAILURE_MODE',
        targetEntityId: techNode.entityId,
        targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
        targetLabel: techNode.label,
        confidence: 'HIGH',
        steps: [s1],
        explanation: `To prevent ${fmNode.label}, apply ${techNode.label}.`,
      });
    } else {
      for (const mediaNode of mediaNodes) {
        const s2 = step(
          techNode,
          'USES',
          mediaNode,
          `${techNode.label} employs ${mediaNode.label}.`,
        );
        recs.push({
          recommendationId: recId(),
          queryEntityId: failureModeEntityId,
          queryEntityType: 'FAILURE_MODE',
          targetEntityId: mediaNode.entityId,
          targetEntityType: 'PROTECTION_MEDIA',
          targetLabel: mediaNode.label,
          confidence: 'HIGH',
          steps: [s1, s2],
          explanation: `To prevent ${fmNode.label}: apply ${techNode.label} using ${mediaNode.label}.`,
        });
      }
    }
  }

  // Contamination source recommendations
  const { inbound: fmIn } = getRelationships(graph, fmNode.nodeId);
  const contNodes = fmIn
    .filter((r) => r.type === 'GENERATES')
    .map((r) => graph.nodes.get(r.sourceNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'CONTAMINATION');

  for (const contNode of contNodes) {
    const s1 = step(
      contNode,
      'GENERATES',
      fmNode,
      `${contNode.label} is the contamination source generating this failure mode.`,
    );
    const techsForCont = findTechnologiesByContamination(graph, contNode.entityId);
    for (const techNode of techsForCont) {
      const s2 = step(
        techNode,
        'PREVENTS',
        fmNode,
        `${techNode.label} controls the contamination-driven failure.`,
      );
      recs.push({
        recommendationId: recId(),
        queryEntityId: failureModeEntityId,
        queryEntityType: 'FAILURE_MODE',
        targetEntityId: techNode.entityId,
        targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
        targetLabel: techNode.label,
        confidence: 'MEDIUM',
        steps: [s1, s2],
        explanation: `${contNode.label} generates ${fmNode.label}. ${techNode.label} controls this contamination pathway.`,
      });
    }
  }

  return recs;
}

/**
 * Given a Contamination type, recommend Technologies and Standards.
 *
 * Path: Contamination → GENERATES → FailureMode ← PREVENTS — Technology
 */
export function recommendFromContamination(contaminationEntityId: string): Recommendation[] {
  const graph = getGraph();
  const contNode = getNodeByEntityId(graph, contaminationEntityId);
  if (!contNode || contNode.entityType !== 'CONTAMINATION') return [];

  const techNodes = findTechnologiesByContamination(graph, contaminationEntityId);
  const recs: Recommendation[] = [];

  for (const techNode of techNodes) {
    const s1 = step(
      contNode,
      'GENERATES→PREVENTED_BY',
      techNode,
      `${techNode.label} controls contamination type ${contNode.label}.`,
    );

    // Recommend applicable standards for this technology
    const stdNodes = findStandards(graph, techNode.entityId);
    if (stdNodes.length === 0) {
      recs.push({
        recommendationId: recId(),
        queryEntityId: contaminationEntityId,
        queryEntityType: 'CONTAMINATION',
        targetEntityId: techNode.entityId,
        targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
        targetLabel: techNode.label,
        confidence: 'HIGH',
        steps: [s1],
        explanation: `For ${contNode.label} contamination, apply ${techNode.label}.`,
      });
    } else {
      for (const stdNode of stdNodes) {
        const s2 = step(
          stdNode,
          'VALIDATES',
          techNode,
          `${stdNode.label} validates ${techNode.label} performance in this domain.`,
        );
        recs.push({
          recommendationId: recId(),
          queryEntityId: contaminationEntityId,
          queryEntityType: 'CONTAMINATION',
          targetEntityId: stdNode.entityId,
          targetEntityType: 'STANDARD',
          targetLabel: stdNode.label,
          confidence: 'HIGH',
          steps: [s1, s2],
          explanation: `For ${contNode.label}: use ${techNode.label} validated by ${stdNode.label}.`,
        });
      }
    }
  }

  return recs;
}

/**
 * Given a Technology, recommend related Engineering Principles and Standards.
 */
export function recommendFromTechnology(technologyEntityId: string): Recommendation[] {
  const graph = getGraph();
  const techNode = getNodeByEntityId(graph, technologyEntityId);
  if (!techNode || techNode.entityType !== 'TECHNOLOGY_ARCHITECTURE') return [];

  const recs: Recommendation[] = [];
  const { outbound } = getRelationships(graph, techNode.nodeId);

  // Engineering Principles this tech implements
  const principleNodes = outbound
    .filter((r) => r.type === 'IMPLEMENTS')
    .map((r) => graph.nodes.get(r.targetNodeId))
    .filter((n): n is GraphNode => n !== undefined && n.entityType === 'ENGINEERING_PRINCIPLE');

  for (const epNode of principleNodes) {
    const s1 = step(
      techNode,
      'IMPLEMENTS',
      epNode,
      `${techNode.label} is grounded in the engineering principle: ${epNode.label}.`,
    );
    recs.push({
      recommendationId: recId(),
      queryEntityId: technologyEntityId,
      queryEntityType: 'TECHNOLOGY_ARCHITECTURE',
      targetEntityId: epNode.entityId,
      targetEntityType: 'ENGINEERING_PRINCIPLE',
      targetLabel: epNode.label,
      confidence: 'HIGH',
      steps: [s1],
      explanation: `${techNode.label} implements ${epNode.label}.`,
    });
  }

  // Standards that validate this tech
  const stdNodes = findStandards(graph, technologyEntityId);
  for (const stdNode of stdNodes) {
    const s1 = step(
      stdNode,
      'VALIDATES',
      techNode,
      `${stdNode.label} provides the test methodology validating ${techNode.label}.`,
    );
    recs.push({
      recommendationId: recId(),
      queryEntityId: technologyEntityId,
      queryEntityType: 'TECHNOLOGY_ARCHITECTURE',
      targetEntityId: stdNode.entityId,
      targetEntityType: 'STANDARD',
      targetLabel: stdNode.label,
      confidence: 'HIGH',
      steps: [s1],
      explanation: `${techNode.label} is validated by ${stdNode.label}.`,
    });
  }

  return recs;
}

/**
 * Reset recommendation counter (for test isolation).
 */
export function resetRecommendationCounter(): void {
  _recCounter = 0;
}
