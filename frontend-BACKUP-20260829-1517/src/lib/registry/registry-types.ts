/**
 * registry-types.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Core type definitions for the governed Knowledge Graph registries.
 * All entities in this system follow the Engineering Maturity Model:
 *   Level 0 (RESEARCH) → Level 1 (DRAFT) → Level 2 (VALIDATED)
 *   → Level 3 (PUBLISHED) → Level 4 (SUPERSEDED) → Level 5 (ARCHIVED)
 *
 * Constitutional basis: Foundation Freeze & Implementation Transition v1.0
 * EDR references: EDR-A-001, EDR-A-002, EDR-B-001, EDR-B-002
 */

// ============================================================================
// MATURITY LEVEL — Engineering Maturity Model
// ============================================================================

export type MaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const MATURITY = {
  RESEARCH: 0 as const,
  DRAFT: 1 as const,
  VALIDATED: 2 as const,
  PUBLISHED: 3 as const,
  SUPERSEDED: 4 as const,
  ARCHIVED: 5 as const,
} satisfies Record<string, MaturityLevel>;

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  0: 'RESEARCH',
  1: 'DRAFT',
  2: 'VALIDATED',
  3: 'PUBLISHED',
  4: 'SUPERSEDED',
  5: 'ARCHIVED',
};

// ============================================================================
// VERSION RECORD — all governed entities carry this
// ============================================================================

export interface VersionRecord {
  /** Semantic version: MAJOR.MINOR.PATCH */
  readonly version: string;
  /** ISO 8601 date of this version */
  readonly publishedDate: string;
  /** Governance authority who approved this version */
  readonly approvedBy: string;
  /** What changed from the prior version */
  readonly changeNote: string;
  /** EDR that governed this change, if applicable */
  readonly edrRef?: string;
}

// ============================================================================
// BASE ENTITY — all registry entities extend this
// ============================================================================

export interface BaseEntity {
  readonly id: string;
  readonly maturity: MaturityLevel;
  readonly versionHistory: readonly VersionRecord[];
  /** ISO 8601 creation date */
  readonly createdDate: string;
  /** Pointer to superseding entity, if maturity === 4 */
  readonly supersededBy?: string;
}

// ============================================================================
// SCIENCE DOMAINS — Engineering Principle categorization
// EDR: EDR-B-002 — Why Five Engineering Science Domains Were Defined
// ============================================================================

export type ScienceDomain =
  | 'Separation Science'
  | 'Chemical Engineering'
  | 'Phase Science'
  | 'Instrumentation Science'
  | 'Tribochemistry';

// ============================================================================
// ENGINEERING PRINCIPLE
// EDR: EDR-B-001 — Why Engineering Principles Replaced Separation Mechanisms
// ============================================================================

export interface EngineeringPrinciple extends BaseEntity {
  readonly entityType: 'ENGINEERING_PRINCIPLE';
  /** Canonical code, e.g. EP-SEP-001 */
  readonly code: string;
  readonly name: string;
  readonly scienceDomain: ScienceDomain;
  /**
   * Neutral technical definition — no marketing language.
   * Must be consistent across all pages that reference this principle.
   */
  readonly definition: string;
  /** Governing standard(s) that validate this principle */
  readonly standardRefs: readonly string[];
  /** Technology Architecture IDs that implement this principle */
  readonly implementedByTechnologies: readonly string[];
  /** Physical/chemical phenomenon this principle controls */
  readonly phenomenonDescription: string;
}

// ============================================================================
// TECHNOLOGY ARCHITECTURE — eight-component class schema
// EDR: EDR-A-002 — Why Technology Architecture Became the Core Engineering Entity
// ============================================================================

export interface ProtectionMedia {
  readonly type: string;
  readonly description: string;
  readonly micronRating?: string;
  readonly mediaConstruction?: string;
}

// ============================================================================
// PROTECTION MEDIA RECORD — governed canonical media type
// ============================================================================

export type MediaFunction =
  | 'DEPTH_FILTRATION'
  | 'SURFACE_FILTRATION'
  | 'COALESCENCE'
  | 'HYDROPHOBIC_REPULSION'
  | 'ADSORPTION'
  | 'DESICCATION'
  | 'SCA_DELIVERY'
  | 'STRUCTURAL_SUPPORT';

export interface ProtectionMediaRecord extends BaseEntity {
  readonly entityType: 'PROTECTION_MEDIA';
  /** Canonical ID, e.g. PM-GLASS-MICROFIBER-DEPTH */
  readonly id: string;
  readonly name: string;
  readonly mediaFunction: MediaFunction;
  /**
   * Neutral technical definition of the media type.
   * Describes physical/chemical mechanism — no marketing language.
   */
  readonly definition: string;
  readonly baseConstruction: string;
  readonly micronRatingRange?: string;
  readonly operatingTempRange?: string;
  readonly compatibleFluidTypes: readonly string[];
  /** Technology Architecture IDs that employ this media type */
  readonly employedByTechnologyIds: readonly string[];
  /** Engineering Principle IDs this media type implements */
  readonly implementsPrincipleIds: readonly string[];
}

// ============================================================================
// VERSION REGISTRY ENTRY — cross-registry version timeline
// ============================================================================

export interface VersionRegistryEntry {
  readonly entryId: string;
  readonly entityId: string;
  readonly entityType: string;
  readonly version: string;
  readonly publishedDate: string;
  readonly approvedBy: string;
  readonly changeNote: string;
  readonly edrRef?: string;
}

export interface MaterialSpec {
  readonly component: string;
  readonly material: string;
  readonly justification: string;
}

export interface ConstructionDetail {
  readonly feature: string;
  readonly description: string;
  readonly engineeringBasis: string;
}

export interface FlowDynamic {
  readonly parameter: string;
  readonly value: string;
  readonly unit: string;
  readonly standardRef?: string;
}

export interface CaptureCapability {
  readonly contaminantClass: string;
  readonly mechanism: string;
  readonly efficiency?: string;
  readonly particleSizeRange?: string;
}

export interface PerformanceClaim {
  readonly metric: string;
  readonly value: string;
  readonly unit: string;
  /** Must trace to a test result or published standard value */
  readonly evidenceSource: string;
  readonly standardRef?: string;
}

export interface FailureModeEntry {
  readonly id: string;
  /** Root cause chain: Cause → Effect → Final Consequence */
  readonly rootCauseChain: string;
  readonly measuredConsequence: string;
  readonly operationalImpact: string;
  readonly preventedByThisTechnology: boolean;
}

/**
 * The eight-component Technology Architecture class schema.
 * No Technology Architecture may be published at Level 3 without
 * all eight components populated.
 */
export interface TechnologyArchitecture extends BaseEntity {
  readonly entityType: 'TECHNOLOGY_ARCHITECTURE';
  /** Canonical ID, e.g. TECH-MACROCORE */
  readonly id: string;
  readonly technologyName: string;
  readonly commercialName: string;
  /** Primary system domain — authoritative mapping, never overridden */
  readonly systemDomain: SystemDomain;
  readonly primaryStandards: readonly string[];

  // — COMPONENT CLASS 1: Protection Media
  readonly protectionMedia: readonly ProtectionMedia[];

  // — COMPONENT CLASS 2: Engineering Principles (links to EngineeringPrinciple.id)
  readonly engineeringPrincipleIds: readonly string[];

  // — COMPONENT CLASS 3: Materials
  readonly materials: readonly MaterialSpec[];

  // — COMPONENT CLASS 4: Construction
  readonly construction: readonly ConstructionDetail[];

  // — COMPONENT CLASS 5: Flow Dynamics
  readonly flowDynamics: readonly FlowDynamic[];

  // — COMPONENT CLASS 6: Capture Mechanisms
  readonly captureMechanisms: readonly CaptureCapability[];

  // — COMPONENT CLASS 7: Performance Profile
  readonly performanceProfile: readonly PerformanceClaim[];

  // — COMPONENT CLASS 8: Failure Modes addressed
  readonly failureModes: readonly FailureModeEntry[];

  /** AI Citation Layer — canonical definition (no marketing language) */
  readonly canonicalDefinition: string;
  /** System context: where this technology applies */
  readonly systemContext: string;
  /** Industrial role: why this matters for equipment reliability and TCO */
  readonly industrialRole: string;
}

// ============================================================================
// SYSTEM DOMAIN — authoritative technology-domain mapping
// Constitutional: never overridden by pages, AI, or product catalog
// ============================================================================

export type SystemDomain =
  | 'Air Intake'
  | 'Engine Lube Oil'
  | 'Hydraulic'
  | 'Fuel HPCR'
  | 'Fuel Water Separation'
  | 'Fuel 3-Stage'
  | 'Cooling System'
  | 'Compressed Air'
  | 'Filter Housing Systems'
  | 'Fleet Maintenance'
  | 'Marine Diesel & Hydraulic'
  | 'Cabin Air';

// ============================================================================
// STANDARD RECORD
// ============================================================================

export interface StandardRecord extends BaseEntity {
  readonly entityType: 'STANDARD';
  readonly code: string;
  readonly issuingBody: string;
  readonly title: string;
  readonly scope: string;
  readonly applicableTechnologyIds: readonly string[];
  readonly applicableEngineeringPrincipleIds: readonly string[];
}

// ============================================================================
// FAILURE MODE — governed industrial failure mode
// ============================================================================

export interface FailureModeRecord extends BaseEntity {
  readonly entityType: 'FAILURE_MODE';
  readonly id: string;
  readonly systemContext: string;
  /** Root cause → Effect → Final Consequence chain */
  readonly causeChain: string;
  readonly measurableConsequence: string;
  /** Quantified impact: hours, cost, downtime frequency */
  readonly industrialImpact: string;
  readonly relevantStandardRefs: readonly string[];
  readonly controlledByTechnologyIds: readonly string[];
  readonly contaminationTypeId?: string;
}

// ============================================================================
// CONTAMINATION TYPE
// ============================================================================

export interface ContaminationRecord extends BaseEntity {
  readonly entityType: 'CONTAMINATION';
  readonly id: string;
  readonly name: string;
  readonly contaminantClass: 'SOLID_PARTICLE' | 'LIQUID_PHASE' | 'GASEOUS' | 'BIOLOGICAL' | 'CHEMICAL';
  readonly phaseState: string;
  readonly particleSizeRange?: string;
  readonly sources: readonly string[];
  readonly initiatedFailureModeIds: readonly string[];
  readonly detectionStandards: readonly string[];
}

// ============================================================================
// ENGINEERING MEMORY RECORD — append-only archive entry
// Constitutional: Engineering Memory is permanent and never deleted
// ============================================================================

export interface EngineeringMemoryEntry {
  readonly memoryId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly entityVersion: string;
  readonly archivedDate: string;
  readonly archivedReason: 'SUPERSEDED' | 'DEPRECATED' | 'VERSION_SNAPSHOT' | 'VERSION_UPDATE' | 'ALIAS_CREATED';
  /** Complete entity snapshot at time of archival */
  readonly snapshot: unknown;
  /** EDR that governed the transition, if applicable */
  readonly edrRef?: string;
}

// ============================================================================
// KNOWLEDGE GRAPH RELATIONSHIP
// ============================================================================

export type RelationshipType =
  | 'IMPLEMENTS'         // Technology implements Engineering Principle
  | 'IS_IMPLEMENTED_BY' // Engineering Principle is_implemented_by Technology
  | 'GOVERNED_BY'        // Technology/Principle governed_by Standard
  | 'GOVERNS'            // Standard governs Technology/Principle
  | 'CONTROLS'           // Technology controls Contamination/Failure Mode
  | 'CONTROLLED_BY'      // Failure Mode controlled_by Technology
  | 'INITIATES'          // Contamination initiates Failure Mode
  | 'INITIATED_BY';      // Failure Mode initiated_by Contamination

export interface KnowledgeGraphRelationship {
  readonly id: string;
  readonly type: RelationshipType;
  readonly sourceEntityId: string;
  readonly sourceEntityType: string;
  readonly targetEntityId: string;
  readonly targetEntityType: string;
  readonly evidenceNote?: string;
  readonly createdDate: string;
}
