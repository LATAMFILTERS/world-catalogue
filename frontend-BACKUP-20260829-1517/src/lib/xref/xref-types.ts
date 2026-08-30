/**
 * xref-types.ts
 * ELIMFILTERS — Cross Reference Intelligence Engine v1.0
 *
 * Complete type contract for the cross-reference knowledge graph.
 * Every mapping, node, edge, score, conflict, and audit result
 * is strictly typed here.
 */

// ============================================================================
// GRAPH NODE TYPES
// ============================================================================

export type XrefNodeType =
  | 'OEM_PART'       // e.g. Donaldson P181052
  | 'ELIMFILTERS'    // e.g. EA13001
  | 'OEM';           // e.g. Donaldson (manufacturer node)

export interface XrefNode {
  /** Globally unique node ID — e.g. "donaldson::P181052" */
  id: string;
  type: XrefNodeType;
  /** The OEM identifier (e.g. "donaldson") */
  oemId: string;
  /** The part number or brand name */
  partNumber: string;
  /** Normalized uppercase part number for dedup */
  partNumberNormalized: string;
  /** HD / LD / unknown */
  duty: 'HD' | 'LD' | 'UNKNOWN';
  /** Filter category (air, fuel, lube, hydraulic, cabin, coolant, dryer) */
  category: string;
  /** Source of this node (import batch ID) */
  sourceId: string;
  /** ISO timestamp when added */
  addedAt: string;
}

// ============================================================================
// GRAPH EDGE — A SINGLE MAPPING BETWEEN TWO NODES
// ============================================================================

export type XrefEdgeDirection = 'OEM_TO_ELIMFILTERS' | 'ELIMFILTERS_TO_OEM' | 'OEM_TO_OEM';

export interface XrefEdge {
  /** Unique edge ID */
  id: string;
  fromNodeId: string;
  toNodeId: string;
  direction: XrefEdgeDirection;
  confidenceScore: number;          // 0–100
  confidenceLevel: ConfidenceLevel;
  validationSources: ValidationSource[];
  status: EdgeStatus;
  addedAt: string;
  /** Import batch that created this edge */
  sourceId: string;
  /** Engineering notes */
  notes?: string;
}

export type EdgeStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'SUPERSEDED';

export type ConfidenceLevel =
  | 'VERIFIED_MULTI_SOURCE'    // 100 — multiple independent sources
  | 'VERIFIED_OEM_ENGINEERING' // 95 — OEM + engineering match
  | 'VERIFIED_DIMENSIONS'      // 90 — verified dimensions + specs
  | 'DIMENSIONS_ONLY'          // 80 — dimensions only
  | 'CROSS_REF_ONLY'           // 70 — cross reference only
  | 'NEEDS_REVIEW';            // <70 — below threshold

export type ValidationSource =
  | 'OEM_CATALOG'
  | 'ENGINEERING_REVIEW'
  | 'DIMENSION_MATCH'
  | 'MULTI_OEM_AGREEMENT'
  | 'AI_SUGGESTED'
  | 'MANUAL_ENTRY';

// ============================================================================
// GRAPH PATH — A CHAIN OF NODES
// ============================================================================

export interface GraphPath {
  pathId: string;
  /** Ordered list of node IDs from source OEM to ELIMFILTERS */
  nodeChain: string[];
  /** Combined confidence across all edges in path */
  pathConfidence: number;
  /** Lowest confidence edge in the chain (weakest link) */
  weakestLink: number;
  hops: number;
  valid: boolean;
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

export interface ConfidenceInput {
  /** Sources that validated this mapping */
  sources: ValidationSource[];
  /** Do dimensions match exactly? */
  dimensionMatch: boolean;
  /** Do specifications match? */
  specMatch: boolean;
  /** Do multiple independent OEM catalogs agree? */
  multiOemAgreement: boolean;
  /** Has an engineer reviewed this? */
  engineeringReview: boolean;
  /** Number of agreeing independent sources */
  sourceCount: number;
}

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevel;
  approved: boolean; // score >= 70
  breakdown: ConfidenceBreakdown[];
}

export interface ConfidenceBreakdown {
  dimension: string;
  points: number;
  maxPoints: number;
  reason: string;
}

// ============================================================================
// CONFLICTS
// ============================================================================

export type ConflictType =
  | 'ONE_TO_MANY'          // One OEM part maps to multiple ELIMFILTERS parts
  | 'MANY_TO_ONE_CONFLICT' // Multiple OEMs → conflicting different ELIMFILTERS
  | 'DUTY_CONFLICT'        // Same part mapped as both HD and LD
  | 'CATEGORY_CONFLICT'    // Same part in different categories
  | 'TECHNOLOGY_CONFLICT'  // Incompatible technology assignments
  | 'DUPLICATE_MAPPING'    // Exact same edge registered twice
  | 'BROKEN_CHAIN'         // Path has a broken link (missing node)
  | 'CIRCULAR_REFERENCE';  // A → B → A loop detected

export interface XrefConflict {
  conflictId: string;
  type: ConflictType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  involvedNodes: string[];
  involvedEdges: string[];
  description: string;
  detectedAt: string;
  resolution?: ConflictResolution;
}

export type ConflictResolution =
  | 'KEEP_HIGHEST_CONFIDENCE'
  | 'KEEP_ALL_PENDING_REVIEW'
  | 'REJECT_ALL'
  | 'MANUAL_REQUIRED';

// ============================================================================
// BIDIRECTIONAL MAP
// ============================================================================

export interface BidirectionalIndex {
  /** OEM Part ID → set of ELIMFILTERS part numbers */
  oemToElim: Map<string, Set<string>>;
  /** ELIMFILTERS part number → set of OEM Part IDs */
  elimToOem: Map<string, Set<string>>;
  /** OEM Part ID → set of equivalent OEM Part IDs (cross-OEM) */
  oemEquivalences: Map<string, Set<string>>;
}

// ============================================================================
// OEM EQUIVALENCE
// ============================================================================

export interface OemEquivalenceGroup {
  groupId: string;
  /** The ELIMFILTERS part that links them all */
  elimPartNumber: string;
  /** All OEM parts that map to this ELIMFILTERS part */
  equivalentOemParts: string[];
  /** Average confidence across all edges in this group */
  groupConfidence: number;
  oems: string[];
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

export interface DuplicateGroup {
  groupId: string;
  duplicateType: 'EXACT' | 'NEAR_MATCH' | 'SUPERSEDED';
  nodeIds: string[];
  canonical: string; // which node to keep
  reason: string;
}

// ============================================================================
// COVERAGE ANALYSIS
// ============================================================================

export interface CoverageReport {
  generatedAt: string;
  totalOemParts: number;
  totalElimParts: number;
  totalEdges: number;
  totalActiveEdges: number;
  averageConfidence: number;
  byOem: CoverageByDimension[];
  byTechnology: CoverageByDimension[];
  byProtectionSystem: CoverageByDimension[];
  byDutyClass: CoverageByDimension[];
  byCategory: CoverageByDimension[];
}

export interface CoverageByDimension {
  dimension: string;
  key: string;
  oemParts: number;
  elimParts: number;
  mappings: number;
  coveragePercent: number;
  averageConfidence: number;
}

// ============================================================================
// GAP DETECTION
// ============================================================================

export interface GapReport {
  generatedAt: string;
  totalGaps: number;
  criticalGaps: number;
  workQueue: GapItem[];
}

export type GapCategory =
  | 'MISSING_OEM_MAPPING'
  | 'MISSING_ENGINE'
  | 'MISSING_APPLICATION'
  | 'MISSING_EQUIPMENT'
  | 'MISSING_TECHNOLOGY'
  | 'MISSING_STANDARD'
  | 'MISSING_PRODUCT'
  | 'LOW_CONFIDENCE_MAPPING'
  | 'UNVERIFIED_CHAIN';

export interface GapItem {
  gapId: string;
  category: GapCategory;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedNodes: string[];
  suggestedAction: string;
  estimatedImpact: string;
}

// ============================================================================
// CONSISTENCY CHECK
// ============================================================================

export interface ConsistencyReport {
  generatedAt: string;
  totalChecked: number;
  passed: number;
  failed: number;
  warnings: number;
  issues: ConsistencyIssue[];
}

export interface ConsistencyIssue {
  issueId: string;
  nodeId?: string;
  edgeId?: string;
  type: 'BROKEN_CHAIN' | 'ORPHAN_NODE' | 'INVALID_DIRECTION' | 'DUTY_MISMATCH' | 'CATEGORY_MISMATCH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

// ============================================================================
// GRAPH AUDIT RESULT
// ============================================================================

export interface GraphAuditResult {
  auditId: string;
  auditedAt: string;
  totalNodes: number;
  totalEdges: number;
  activeEdges: number;
  conflicts: XrefConflict[];
  coverage: CoverageReport;
  gaps: GapReport;
  consistency: ConsistencyReport;
  duplicates: DuplicateGroup[];
  passed: boolean;
  summary: string;
}
