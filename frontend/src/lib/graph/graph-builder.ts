/**
 * Phase 2 — Knowledge Graph Core: Graph Builder
 *
 * Consumes all Foundation registries and builds the in-memory KnowledgeGraph.
 * Foundation registries are INPUTS — this module never modifies them.
 */

import { ENGINEERING_PRINCIPLES } from '@/lib/registry/engineering-principles';
import { TECHNOLOGY_ARCHITECTURES } from '@/lib/registry/technology-architectures';
import { PROTECTION_MEDIA_REGISTRY } from '@/lib/registry/protection-media-registry';
import { STANDARDS_REGISTRY } from '@/lib/registry/standards-registry';
import { FAILURE_MODES_REGISTRY } from '@/lib/registry/failure-modes-registry';
import { CONTAMINATION_REGISTRY } from '@/lib/registry/contamination-registry';
import { ENGINEERING_MEMORY } from '@/lib/registry/engineering-memory';
import { MATURITY } from '@/lib/registry/registry-types';

import type {
  GraphNode,
  GraphRelationship,
  KnowledgeGraph,
  NodeEntityType,
  NodeProvenance,
  RelationshipType,
  GovernanceStatus,
} from './graph-types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nodeId(entityId: string): string {
  return `NODE-${entityId}`;
}

function relId(sourceEntityId: string, type: RelationshipType, targetEntityId: string): string {
  return `REL-${sourceEntityId}-${type}-${targetEntityId}`;
}

function governanceStatus(entity: { maturity: number; deprecated?: boolean }): GovernanceStatus {
  if (entity.deprecated) return 'DEPRECATED';
  if (entity.maturity === MATURITY.SUPERSEDED) return 'SUPERSEDED';
  return 'ACTIVE';
}

function memoryEntriesFor(entityId: string): string[] {
  return Object.values(ENGINEERING_MEMORY)
    .filter((m) => m.entityId === entityId)
    .map((m) => m.memoryId);
}

function edrRefsFor(entityId: string): string[] {
  const refs = new Set<string>();
  Object.values(ENGINEERING_MEMORY)
    .filter((m) => m.entityId === entityId && m.edrRef)
    .forEach((m) => refs.add(m.edrRef!));
  return Array.from(refs);
}

function makeRel(
  sourceEntityId: string,
  type: RelationshipType,
  targetEntityId: string,
  derivedFrom: string,
  bidirectional = false,
  properties?: Record<string, unknown>,
): GraphRelationship {
  return {
    relationshipId: relId(sourceEntityId, type, targetEntityId),
    type,
    sourceNodeId: nodeId(sourceEntityId),
    targetNodeId: nodeId(targetEntityId),
    bidirectional,
    derivedFrom,
    properties,
  };
}

// ─── Node Builders ────────────────────────────────────────────────────────────

function buildEngineeringPrincipleNodes(): GraphNode[] {
  return Object.values(ENGINEERING_PRINCIPLES).map((ep) => {
    const isAlias = ep.definition.startsWith('Canonical alias');
    const provenance: NodeProvenance = {
      sourceRegistry: 'engineering-principles.ts',
      entityVersion: ep.versionHistory.at(-1)?.version ?? '1.0.0',
      createdDate: ep.createdDate,
      maturityLevel: String(ep.maturity),
      governanceStatus: isAlias ? 'ALIAS' : governanceStatus(ep as { maturity: number }),
      memoryEntryIds: memoryEntriesFor(ep.id),
      edrRefs: edrRefsFor(ep.id),
      isDeprecated: false,
      aliasFor: isAlias ? (ep.definition.match(/Canonical alias for (EP-\S+)\./)?.[1] ?? undefined) : undefined,
    };
    return {
      nodeId: nodeId(ep.id),
      entityType: 'ENGINEERING_PRINCIPLE' as NodeEntityType,
      entityId: ep.id,
      label: ep.name,
      provenance,
      properties: ep as unknown as Record<string, unknown>,
    };
  });
}

function buildTechnologyNodes(): GraphNode[] {
  return Object.values(TECHNOLOGY_ARCHITECTURES).map((tech) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'technology-architectures.ts',
      entityVersion: tech.versionHistory.at(-1)?.version ?? '1.0.0',
      createdDate: tech.createdDate,
      maturityLevel: String(tech.maturity),
      governanceStatus: governanceStatus(tech as { maturity: number }),
      memoryEntryIds: memoryEntriesFor(tech.id),
      edrRefs: edrRefsFor(tech.id),
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(tech.id),
      entityType: 'TECHNOLOGY_ARCHITECTURE' as NodeEntityType,
      entityId: tech.id,
      label: tech.technologyName,
      provenance,
      properties: tech as unknown as Record<string, unknown>,
    };
  });
}

function buildProtectionMediaNodes(): GraphNode[] {
  return Object.values(PROTECTION_MEDIA_REGISTRY).map((pm) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'protection-media-registry.ts',
      entityVersion: pm.versionHistory?.at(-1)?.version ?? '1.0.0',
      createdDate: pm.createdDate ?? '2026-07-01',
      maturityLevel: String(pm.maturity),
      governanceStatus: governanceStatus(pm as { maturity: number }),
      memoryEntryIds: memoryEntriesFor(pm.id),
      edrRefs: edrRefsFor(pm.id),
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(pm.id),
      entityType: 'PROTECTION_MEDIA' as NodeEntityType,
      entityId: pm.id,
      label: pm.name,
      provenance,
      properties: pm as unknown as Record<string, unknown>,
    };
  });
}

function buildStandardNodes(): GraphNode[] {
  return Object.values(STANDARDS_REGISTRY).map((std) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'standards-registry.ts',
      entityVersion: '1.0.0',
      createdDate: '2026-07-01',
      maturityLevel: String(MATURITY.PUBLISHED),
      governanceStatus: 'ACTIVE',
      memoryEntryIds: [],
      edrRefs: [],
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(std.id),
      entityType: 'STANDARD' as NodeEntityType,
      entityId: std.id,
      label: std.code,
      provenance,
      properties: std as unknown as Record<string, unknown>,
    };
  });
}

function buildFailureModeNodes(): GraphNode[] {
  return Object.values(FAILURE_MODES_REGISTRY).map((fm) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'failure-modes-registry.ts',
      entityVersion: fm.versionHistory.at(-1)?.version ?? '1.0.0',
      createdDate: fm.createdDate,
      maturityLevel: String(fm.maturity),
      governanceStatus: governanceStatus(fm as { maturity: number }),
      memoryEntryIds: [],
      edrRefs: [],
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(fm.id),
      entityType: 'FAILURE_MODE' as NodeEntityType,
      entityId: fm.id,
      label: fm.id,
      provenance,
      properties: fm as unknown as Record<string, unknown>,
    };
  });
}

function buildContaminationNodes(): GraphNode[] {
  return Object.values(CONTAMINATION_REGISTRY).map((cont) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'contamination-registry.ts',
      entityVersion: '1.0.0',
      createdDate: '2026-07-01',
      maturityLevel: String(MATURITY.PUBLISHED),
      governanceStatus: 'ACTIVE',
      memoryEntryIds: [],
      edrRefs: [],
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(cont.id),
      entityType: 'CONTAMINATION' as NodeEntityType,
      entityId: cont.id,
      label: cont.name,
      provenance,
      properties: cont as unknown as Record<string, unknown>,
    };
  });
}

function buildMemoryNodes(): GraphNode[] {
  return Object.values(ENGINEERING_MEMORY).map((mem) => {
    const provenance: NodeProvenance = {
      sourceRegistry: 'engineering-memory.ts',
      entityVersion: mem.entityVersion,
      createdDate: mem.archivedDate,
      maturityLevel: String(MATURITY.PUBLISHED),
      governanceStatus: 'ACTIVE',
      memoryEntryIds: [mem.memoryId],
      edrRefs: mem.edrRef ? [mem.edrRef] : [],
      isDeprecated: false,
    };
    return {
      nodeId: nodeId(mem.memoryId),
      entityType: 'ENGINEERING_MEMORY' as NodeEntityType,
      entityId: mem.memoryId,
      label: `Memory: ${mem.entityId} @ ${mem.entityVersion}`,
      provenance,
      properties: mem as unknown as Record<string, unknown>,
    };
  });
}

// ─── Relationship Builders ────────────────────────────────────────────────────

function buildPrincipleRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const ep of Object.values(ENGINEERING_PRINCIPLES)) {
    // IMPLEMENTS: Technology → EngineeringPrinciple (tech implements principle)
    for (const techId of ep.implementedByTechnologies) {
      if (!knownNodeIds.has(nodeId(techId))) continue;
      rels.push(makeRel(techId, 'IMPLEMENTS', ep.id, `${ep.id}.implementedByTechnologies`));
    }
    // ALIASES: EP-SEP-005 → EP-TRB-002
    const props = ep as unknown as Record<string, unknown>;
    if (props['aliasFor'] && typeof props['aliasFor'] === 'string') {
      if (knownNodeIds.has(nodeId(props['aliasFor'] as string))) {
        rels.push(makeRel(ep.id, 'ALIASES', props['aliasFor'] as string, `${ep.id}.aliasFor`));
      }
    }
    // Detect alias by definition content (EP-SEP-005 pattern)
    if (ep.definition.startsWith('Canonical alias for ')) {
      const aliasFor = ep.definition.match(/Canonical alias for (EP-\w+-\d+)/)?.[1];
      if (aliasFor && knownNodeIds.has(nodeId(aliasFor))) {
        const existing = rels.find(
          (r) => r.sourceNodeId === nodeId(ep.id) && r.type === 'ALIASES',
        );
        if (!existing) {
          rels.push(makeRel(ep.id, 'ALIASES', aliasFor, `${ep.id}.definition`));
        }
      }
    }
  }
  return rels;
}

function buildTechnologyRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const tech of Object.values(TECHNOLOGY_ARCHITECTURES)) {
    // IMPLEMENTS: Technology → EngineeringPrinciple
    for (const epId of tech.engineeringPrincipleIds) {
      if (!knownNodeIds.has(nodeId(epId))) continue;
      const existing = rels.find(
        (r) =>
          r.sourceNodeId === nodeId(tech.id) &&
          r.type === 'IMPLEMENTS' &&
          r.targetNodeId === nodeId(epId),
      );
      if (!existing) {
        rels.push(makeRel(tech.id, 'IMPLEMENTS', epId, `${tech.id}.engineeringPrincipleIds`));
      }
    }
    // USES: Technology → ProtectionMedia (derived from pm.employedByTechnologyIds, built in buildProtectionMediaRelationships)
  }
  return rels;
}

function buildProtectionMediaRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const pm of Object.values(PROTECTION_MEDIA_REGISTRY)) {
    // REALIZES: ProtectionMedia → EngineeringPrinciple
    for (const epId of pm.implementsPrincipleIds) {
      if (!knownNodeIds.has(nodeId(epId))) continue;
      rels.push(makeRel(pm.id, 'REALIZES', epId, `${pm.id}.implementsPrincipleIds`));
    }
    // PART_OF + USES (bidirectional): ProtectionMedia ↔ Technology
    for (const techId of pm.employedByTechnologyIds) {
      if (!knownNodeIds.has(nodeId(techId))) continue;
      rels.push(makeRel(pm.id, 'PART_OF', techId, `${pm.id}.employedByTechnologyIds`));
      rels.push(makeRel(techId, 'USES', pm.id, `${pm.id}.employedByTechnologyIds`));
    }
  }
  return rels;
}

function buildStandardRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const std of Object.values(STANDARDS_REGISTRY)) {
    const stdProps = std as unknown as Record<string, unknown>;
    // VALIDATES: Standard → Technology
    const techIds = stdProps['applicableTechnologyIds'] as string[] | undefined;
    if (techIds) {
      for (const techId of techIds) {
        if (!knownNodeIds.has(nodeId(techId))) continue;
        rels.push(makeRel(std.id, 'VALIDATES', techId, `${std.id}.applicableTechnologyIds`));
      }
    }
    // VALIDATES: Standard → EngineeringPrinciple
    const epIds = stdProps['applicableEngineeringPrincipleIds'] as string[] | undefined;
    if (epIds) {
      for (const epId of epIds) {
        if (!knownNodeIds.has(nodeId(epId))) continue;
        rels.push(
          makeRel(std.id, 'VALIDATES', epId, `${std.id}.applicableEngineeringPrincipleIds`),
        );
      }
    }
  }
  return rels;
}

function buildFailureModeRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const fm of Object.values(FAILURE_MODES_REGISTRY)) {
    // PREVENTS: Technology → FailureMode
    for (const techId of fm.controlledByTechnologyIds) {
      if (!knownNodeIds.has(nodeId(techId))) continue;
      rels.push(makeRel(techId, 'PREVENTS', fm.id, `${fm.id}.controlledByTechnologyIds`));
    }
    // RELATES_TO: FailureMode → ContaminationType (from contaminationTypeId field)
    const fmProps = fm as unknown as Record<string, unknown>;
    const contId = fmProps['contaminationTypeId'] as string | undefined;
    if (contId && knownNodeIds.has(nodeId(contId))) {
      rels.push(makeRel(fm.id, 'RELATES_TO', contId, `${fm.id}.contaminationTypeId`));
    }
  }
  return rels;
}

function buildContaminationRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const cont of Object.values(CONTAMINATION_REGISTRY)) {
    const contProps = cont as unknown as Record<string, unknown>;
    const fmIds = contProps['initiatedFailureModeIds'] as string[] | undefined;
    if (fmIds) {
      for (const fmId of fmIds) {
        if (!knownNodeIds.has(nodeId(fmId))) continue;
        rels.push(makeRel(cont.id, 'GENERATES', fmId, `${cont.id}.initiatedFailureModeIds`));
      }
    }
  }
  return rels;
}

function buildMemoryRelationships(knownNodeIds: Set<string>): GraphRelationship[] {
  const rels: GraphRelationship[] = [];
  for (const mem of Object.values(ENGINEERING_MEMORY)) {
    const targetNid = nodeId(mem.entityId);
    if (!knownNodeIds.has(targetNid)) continue;
    rels.push(makeRel(mem.entityId, 'HAS_MEMORY', mem.memoryId, `ENGINEERING_MEMORY[${mem.memoryId}]`));
  }
  return rels;
}

// ─── Adjacency Index Builders ─────────────────────────────────────────────────

function buildAdjacency(
  rels: GraphRelationship[],
): { adjacency: Map<string, string[]>; reverseAdjacency: Map<string, string[]> } {
  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  for (const rel of rels) {
    const fwd = adjacency.get(rel.sourceNodeId) ?? [];
    fwd.push(rel.relationshipId);
    adjacency.set(rel.sourceNodeId, fwd);

    const rev = reverseAdjacency.get(rel.targetNodeId) ?? [];
    rev.push(rel.relationshipId);
    reverseAdjacency.set(rel.targetNodeId, rev);
  }

  return { adjacency, reverseAdjacency };
}

// ─── Primary Export ───────────────────────────────────────────────────────────

let _cachedGraph: KnowledgeGraph | null = null;

export function buildKnowledgeGraph(): KnowledgeGraph {
  if (_cachedGraph) return _cachedGraph;

  // Build all nodes
  const allNodes: GraphNode[] = [
    ...buildEngineeringPrincipleNodes(),
    ...buildTechnologyNodes(),
    ...buildProtectionMediaNodes(),
    ...buildStandardNodes(),
    ...buildFailureModeNodes(),
    ...buildContaminationNodes(),
    ...buildMemoryNodes(),
  ];

  const nodeMap = new Map<string, GraphNode>();
  const nodesByEntityId = new Map<string, string>();
  const nodesByEntityType = new Map<NodeEntityType, string[]>();

  for (const node of allNodes) {
    nodeMap.set(node.nodeId, node);
    nodesByEntityId.set(node.entityId, node.nodeId);
    const list = nodesByEntityType.get(node.entityType) ?? [];
    list.push(node.nodeId);
    nodesByEntityType.set(node.entityType, list);
  }

  const knownNodeIds = new Set(nodeMap.keys());

  // Build all relationships
  const allRels: GraphRelationship[] = [
    ...buildPrincipleRelationships(knownNodeIds),
    ...buildTechnologyRelationships(knownNodeIds),
    ...buildProtectionMediaRelationships(knownNodeIds),
    ...buildStandardRelationships(knownNodeIds),
    ...buildFailureModeRelationships(knownNodeIds),
    ...buildContaminationRelationships(knownNodeIds),
    ...buildMemoryRelationships(knownNodeIds),
  ];

  // Deduplicate relationships by id
  const relMap = new Map<string, GraphRelationship>();
  for (const rel of allRels) {
    if (!relMap.has(rel.relationshipId)) {
      relMap.set(rel.relationshipId, rel);
    }
  }

  const { adjacency, reverseAdjacency } = buildAdjacency(Array.from(relMap.values()));

  // Freeze read-only maps
  const graph: KnowledgeGraph = {
    version: '2.0.0',
    builtAt: new Date().toISOString(),
    nodes: nodeMap,
    relationships: relMap,
    nodesByEntityType,
    adjacency,
    reverseAdjacency,
    nodesByEntityId,
    totalNodes: nodeMap.size,
    totalRelationships: relMap.size,
  };

  _cachedGraph = graph;
  return graph;
}

/** Invalidate cached graph (for testing). */
export function invalidateGraphCache(): void {
  _cachedGraph = null;
}
