/**
 * Phase 2 — Knowledge Graph Core: Type Definitions
 *
 * Constitutional graph model over Foundation registries.
 * The graph consumes the Foundation; it never owns engineering knowledge.
 */

// ─── Node Entity Types ───────────────────────────────────────────────────────

export type NodeEntityType =
  | 'ENGINEERING_PRINCIPLE'
  | 'TECHNOLOGY_ARCHITECTURE'
  | 'PROTECTION_MEDIA'
  | 'FAILURE_MODE'
  | 'CONTAMINATION'
  | 'STANDARD'
  | 'ENGINEERING_MEMORY';

// ─── Relationship Types ───────────────────────────────────────────────────────

export type RelationshipType =
  | 'IMPLEMENTS'        // EngineeringPrinciple ← Technology (tech implements principle)
  | 'REALIZES'          // ProtectionMedia → EngineeringPrinciple (media realizes principle)
  | 'USES'              // Technology → ProtectionMedia (tech uses media)
  | 'VALIDATES'         // Standard → Technology | EngineeringPrinciple
  | 'PREVENTS'          // Technology → FailureMode
  | 'GOVERNS'           // Standard → FailureMode | ContaminationType
  | 'GENERATES'         // ContaminationType → FailureMode
  | 'RELATES_TO'        // FailureMode → ContaminationType (inverse of GENERATES)
  | 'SUPERSEDES'        // EngineeringPrinciple v2 → v1
  | 'ALIASES'           // EP-SEP-005 → EP-TRB-002
  | 'HAS_MEMORY'        // any entity → EngineeringMemory entry
  | 'HAS_VERSION'       // entity → version snapshot
  | 'PART_OF';          // ProtectionMedia → Technology (composition)

// ─── Governance Status ───────────────────────────────────────────────────────

export type GovernanceStatus =
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'SUPERSEDED'
  | 'ALIAS';

// ─── Provenance ───────────────────────────────────────────────────────────────

export interface NodeProvenance {
  readonly sourceRegistry: string;         // e.g. 'engineering-principles.ts'
  readonly entityVersion: string;          // e.g. '1.0.0'
  readonly createdDate: string;
  readonly maturityLevel: string;          // MATURITY constant value
  readonly governanceStatus: GovernanceStatus;
  readonly memoryEntryIds: readonly string[];  // MEM-* ids referencing this entity
  readonly edrRefs: readonly string[];         // EDR-* governance decisions
  readonly isDeprecated: boolean;
  readonly deprecatedReason?: string;
  readonly aliasFor?: string;              // if this node is an alias
  readonly supersededBy?: string;         // if superseded
}

// ─── Graph Node ───────────────────────────────────────────────────────────────

export interface GraphNode {
  readonly nodeId: string;                 // NODE-{entityId}
  readonly entityType: NodeEntityType;
  readonly entityId: string;               // original registry id
  readonly label: string;                  // human-readable name
  readonly provenance: NodeProvenance;
  readonly properties: Record<string, unknown>;  // all registry fields
}

// ─── Graph Relationship ───────────────────────────────────────────────────────

export interface GraphRelationship {
  readonly relationshipId: string;          // REL-{sourceId}-{type}-{targetId}
  readonly type: RelationshipType;
  readonly sourceNodeId: string;            // NODE-{entityId}
  readonly targetNodeId: string;            // NODE-{entityId}
  readonly bidirectional: boolean;
  readonly derivedFrom: string;             // registry field that declared this relationship
  readonly properties?: Record<string, unknown>;
}

// ─── Citation Object ──────────────────────────────────────────────────────────

export interface CitationObject {
  readonly citationId: string;
  readonly claim: string;
  readonly sourceNodeId: string;
  readonly sourceEntityType: NodeEntityType;
  readonly sourceEntityId: string;
  readonly sourceRegistry: string;
  readonly sourceVersion: string;
  readonly supportingRelationshipIds: readonly string[];
  readonly memoryEntryIds: readonly string[];
  readonly edrRefs: readonly string[];
  readonly citedAt: string;                 // ISO date
  readonly traceability: 'FULL' | 'PARTIAL' | 'NONE';
}

// ─── Traversal ───────────────────────────────────────────────────────────────

export interface TraversalStep {
  readonly fromNodeId: string;
  readonly relationship: GraphRelationship;
  readonly toNodeId: string;
  readonly depth: number;
}

export interface TraversalPath {
  readonly pathId: string;
  readonly startNodeId: string;
  readonly endNodeId: string;
  readonly steps: readonly TraversalStep[];
  readonly totalDepth: number;
  readonly relationshipTypes: readonly RelationshipType[];
}

export interface TraversalOptions {
  readonly maxDepth?: number;               // default 6
  readonly relationshipTypes?: readonly RelationshipType[];  // filter; empty = all
  readonly direction?: 'OUTBOUND' | 'INBOUND' | 'BOTH';
  readonly includeDeprecated?: boolean;     // default false
}

export interface TraversalResult {
  readonly startNodeId: string;
  readonly visitedNodes: readonly GraphNode[];
  readonly paths: readonly TraversalPath[];
  readonly relationships: readonly GraphRelationship[];
  readonly depthReached: number;
}

// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export interface KnowledgeGraph {
  readonly version: string;
  readonly builtAt: string;
  readonly nodes: ReadonlyMap<string, GraphNode>;           // nodeId → GraphNode
  readonly relationships: ReadonlyMap<string, GraphRelationship>;  // relationshipId → GraphRelationship
  readonly nodesByEntityType: ReadonlyMap<NodeEntityType, readonly string[]>;  // type → nodeIds
  readonly adjacency: ReadonlyMap<string, readonly string[]>;   // nodeId → outbound relationshipIds
  readonly reverseAdjacency: ReadonlyMap<string, readonly string[]>;  // nodeId → inbound relationshipIds
  readonly nodesByEntityId: ReadonlyMap<string, string>;    // entityId → nodeId
  readonly totalNodes: number;
  readonly totalRelationships: number;
}

// ─── Graph Validation ────────────────────────────────────────────────────────

export interface GraphValidationIssue {
  readonly severity: 'ERROR' | 'WARNING' | 'INFO';
  readonly code: string;
  readonly message: string;
  readonly affectedNodeId?: string;
  readonly affectedRelationshipId?: string;
}

export interface GraphValidationReport {
  readonly passed: boolean;
  readonly nodeCount: number;
  readonly relationshipCount: number;
  readonly issues: readonly GraphValidationIssue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly timestamp: string;
}
