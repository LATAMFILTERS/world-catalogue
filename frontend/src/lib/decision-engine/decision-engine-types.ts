/**
 * Engineering Decision Engine — Type Definitions
 *
 * Governs: ENGINEERING_DECISION_ENGINE v1.1
 * Authority: ENGINEERING_EXPERIENCE_PRINCIPLES v1.3, Principles 12 & 13
 *
 * "The platform may reason only after it has earned the right to reason."
 */

// ─── Intent Classes ────────────────────────────────────────────────────────────

export type IntentClass =
  | 'FAILURE_DIAGNOSIS'
  | 'PROACTIVE_PROTECTION'
  | 'TECHNOLOGY_RESEARCH'
  | 'STANDARDS_INTERPRETATION'
  | 'EQUIPMENT_REPLACEMENT'
  | 'UNKNOWN';

// ─── Contamination Domains ─────────────────────────────────────────────────────

export type ContaminationDomain =
  | 'AIR_INTAKE'
  | 'FUEL'
  | 'LUBE_OIL'
  | 'HYDRAULIC'
  | 'CABIN_AIR'
  | 'COMPRESSED_AIR'
  | 'UNKNOWN';

// ─── Decision States ───────────────────────────────────────────────────────────

/**
 * PROHIBITED: No reasoning permitted. Minimum information must be requested.
 * HIGH:       RECOMMEND — full recommendation authorized.
 * MEDIUM:     RECOMMEND WITH DISCLOSURE — hypothesis disclosures required.
 * LOW:        DO NOT RECOMMEND — continue diagnostic consultation.
 * UNKNOWN:    NO RESPONSE — insufficient knowledge coverage.
 */
export type DecisionState = 'PROHIBITED' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

// ─── PROHIBITED Gate Reasons ───────────────────────────────────────────────────

export type ProhibitedReason =
  | 'UNKNOWN_EQUIPMENT'         // Asset type not identified
  | 'UNKNOWN_CONTAMINATION_SOURCE'  // Contamination domain not identified
  | 'UNKNOWN_OPERATING_CONDITIONS'  // Domain-specific conditions absent
  | 'CONFLICTING_EVIDENCE'      // Evidence internal contradiction
  | 'EVIDENCE_FLOOR_NOT_MET';   // Below domain minimum threshold

// ─── Evidence Categories ───────────────────────────────────────────────────────

export type EvidenceAvailability =
  | 'PRESENT'    // Full credit
  | 'KNOWN'      // Full credit (operating conditions variant)
  | 'MAPPED'     // Full credit (equipment mapping variant)
  | 'CORRELATED' // Full credit (symptom correlation variant)
  | 'PARTIAL'    // Half credit
  | 'INFERABLE'  // Half credit
  | 'ABSENT'     // 0 points
  | 'UNKNOWN';   // 0 points — also may trigger PROHIBITED

export interface EvidenceCategory {
  readonly categoryId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly name: string;
  readonly availability: EvidenceAvailability;
  readonly sources: readonly string[];  // entity IDs or description of evidence
}

// ─── Inference Types ───────────────────────────────────────────────────────────

export type InferenceType =
  | 'DIRECT'       // Conclusion follows directly from evidence
  | 'SUPPORTED'    // Conclusion supported by analogy or correlated evidence
  | 'EXTENDED'     // Conclusion extrapolated — requires disclosure
  | 'SPECULATIVE'; // Conclusion not grounded — must be excluded

export interface ClaimAudit {
  readonly claimText: string;
  readonly inferenceType: InferenceType;
  readonly evidenceSources: readonly string[];
  readonly disclosureRequired: boolean;
  readonly disclosureText?: string;
}

// ─── Evaluation Input ──────────────────────────────────────────────────────────

export interface EvaluationInput {
  readonly intentClass: IntentClass;
  readonly domain: ContaminationDomain;

  // Asset context
  readonly assetId: string | null;
  readonly assetDescription: string | null;

  // Evidence from diagnostic state
  readonly contaminationEntityIds: readonly string[];
  readonly failureModeEntityIds: readonly string[];
  readonly principleEntityIds: readonly string[];
  readonly technologyEntityIds: readonly string[];
  readonly symptomIds: readonly string[];
  readonly environmentIds: readonly string[];
  readonly onsetId: string | null;

  // Operating conditions (domain-specific)
  readonly operatingConditionsKnown: boolean;

  // Draft claims to be audited (output of reasoning prior to authorization)
  readonly draftClaims: readonly string[];
}

// ─── Evidence Inventory Result ─────────────────────────────────────────────────

export interface EvidenceInventoryResult {
  readonly categories: readonly EvidenceCategory[];
  readonly rawScore: number;
  readonly domainMinimumMet: boolean;
  readonly conflictDetected: boolean;
}

// ─── Inference Audit Result ────────────────────────────────────────────────────

export interface InferenceAuditResult {
  readonly claims: readonly ClaimAudit[];
  readonly hasExtended: boolean;
  readonly extendedCount: number;
  readonly hasSpeculative: boolean;
  readonly speculativeCount: number;
  readonly allDirect: boolean;
  readonly inferenceAdjustment: number;
}

// ─── Confidence Calculation Result ────────────────────────────────────────────

export interface ConfidenceCalculationResult {
  readonly rawScore: number;
  readonly adjustedScore: number;
  readonly confidenceLevel: ConfidenceLevel;
  readonly hardFloorApplied: string | null;
  readonly inferenceAdjustment: number;
}

// ─── PROHIBITED Gate Result ────────────────────────────────────────────────────

export interface ProhibitedGateResult {
  readonly prohibited: boolean;
  readonly reason: ProhibitedReason | null;
  readonly minimumInformationRequired: readonly string[];
}

// ─── Recommendation Composition ────────────────────────────────────────────────

export interface RecommendationComposition {
  readonly authorized: true;
  readonly decisionState: 'HIGH' | 'MEDIUM';
  readonly confidenceLevel: ConfidenceLevel;
  readonly engineeringStatement: string;
  readonly evidenceChain: readonly string[];
  readonly disclosures: readonly ClaimAudit[];
  readonly recommendedEntityIds: readonly string[];
  readonly implementationGuidance: string;
}

export interface ProhibitedComposition {
  readonly authorized: false;
  readonly decisionState: 'PROHIBITED';
  readonly reason: ProhibitedReason;
  readonly minimumInformationRequired: readonly string[];
}

export interface InsufficientComposition {
  readonly authorized: false;
  readonly decisionState: 'LOW' | 'UNKNOWN';
  readonly confidenceLevel: ConfidenceLevel;
  readonly continueDiagnostic: true;
}

export type CompositionResult =
  | RecommendationComposition
  | ProhibitedComposition
  | InsufficientComposition;

// ─── Full Evaluation Result ────────────────────────────────────────────────────

export interface EvaluationResult {
  // Step 1: Intent
  readonly intentClass: IntentClass;
  readonly intentConfirmed: boolean;

  // Step 2: Knowledge Coverage
  readonly domainCovered: boolean;
  readonly coverageNotes: string;

  // Step 3: Evidence
  readonly evidenceInventory: EvidenceInventoryResult;

  // Step 4: Inference Audit
  readonly inferenceAudit: InferenceAuditResult;

  // Step 5a: PROHIBITED Gate
  readonly prohibitedGate: ProhibitedGateResult;

  // Step 5: Confidence (only if not PROHIBITED)
  readonly confidenceResult: ConfidenceCalculationResult | null;

  // Step 6: Decision
  readonly decisionState: DecisionState;
  readonly composition: CompositionResult;
}
