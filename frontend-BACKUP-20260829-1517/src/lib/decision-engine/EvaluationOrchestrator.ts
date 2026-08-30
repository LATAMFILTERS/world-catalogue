/**
 * EvaluationOrchestrator — Master sequencer for the Engineering Decision Engine
 *
 * Executes the 6-step evaluation gate in strict sequence:
 *   Step 1: Question Understanding    → IntentClass + domain
 *   Step 2: Knowledge Coverage        → domain coverage check
 *   Step 3: Evidence Availability     → EvidenceInventory
 *   Step 4: Inference Detection       → InferenceAudit
 *   Step 5a: PROHIBITED Gate          → stops if triggered
 *   Step 5: Confidence Assessment     → ConfidenceCalculator
 *   Step 6: Decision                  → RecommendationComposer
 *
 * No step may be skipped. No recommendation may be produced before Step 6.
 * "The platform may reason only after it has earned the right to reason."
 */

import { buildInventory } from './EvidenceInventory';
import { auditClaims } from './InferenceAudit';
import { calculateConfidence } from './ConfidenceCalculator';
import { compose } from './RecommendationComposer';
import type {
  EvaluationInput,
  EvaluationResult,
  ProhibitedGateResult,
  ProhibitedReason,
  ContaminationDomain,
} from './decision-engine-types';

// ─── Covered domains ──────────────────────────────────────────────────────────

const COVERED_DOMAINS = new Set<ContaminationDomain>([
  'AIR_INTAKE',
  'FUEL',
  'LUBE_OIL',
  'HYDRAULIC',
  'CABIN_AIR',
  'COMPRESSED_AIR',
]);

// ─── Step 2: Knowledge Coverage ───────────────────────────────────────────────

function checkCoverage(input: EvaluationInput): { covered: boolean; notes: string } {
  if (input.domain === 'UNKNOWN') {
    return {
      covered: false,
      notes: 'Contamination domain not identified. Coverage cannot be assessed until domain is known.',
    };
  }
  if (!COVERED_DOMAINS.has(input.domain)) {
    return {
      covered: false,
      notes: `Domain ${input.domain} is not in the governed Knowledge Graph. No engineering knowledge available.`,
    };
  }
  return {
    covered: true,
    notes: `Domain ${input.domain} is covered. Engineering knowledge available for evaluation.`,
  };
}

// ─── Step 5a: PROHIBITED Gate ─────────────────────────────────────────────────

function evaluateProhibitedGate(
  input: EvaluationInput,
  domainCovered: boolean,
  evidenceInventory: ReturnType<typeof buildInventory>,
): ProhibitedGateResult {
  // Condition 1: Unknown Equipment
  if (!input.assetId && !input.assetDescription) {
    return {
      prohibited: true,
      reason: 'UNKNOWN_EQUIPMENT',
      minimumInformationRequired: [
        'What type of equipment requires filtration evaluation?',
        'What is the operating application? (e.g., earthmoving, agriculture, marine, manufacturing)',
      ],
    };
  }

  // Condition 2: Unknown Contamination Source
  if (input.domain === 'UNKNOWN' && input.contaminationEntityIds.length === 0) {
    return {
      prohibited: true,
      reason: 'UNKNOWN_CONTAMINATION_SOURCE',
      minimumInformationRequired: [
        'Which filtration system requires evaluation? (air intake, fuel, hydraulic, lube oil, cabin, compressed air)',
        'What is the primary contamination concern?',
      ],
    };
  }

  // Condition 3: Unknown Operating Conditions (domain-specific)
  const diagOrPro = input.intentClass === 'FAILURE_DIAGNOSIS' || input.intentClass === 'PROACTIVE_PROTECTION';
  if (diagOrPro && !input.operatingConditionsKnown && input.environmentIds.length === 0) {
    return {
      prohibited: true,
      reason: 'UNKNOWN_OPERATING_CONDITIONS',
      minimumInformationRequired: [
        'What is the operating environment? (e.g., dusty, wet, high-temperature, underground)',
        'What are the operating hours and duty cycle for this asset?',
      ],
    };
  }

  // Condition 4: Conflicting Evidence
  if (evidenceInventory.conflictDetected) {
    return {
      prohibited: true,
      reason: 'CONFLICTING_EVIDENCE',
      minimumInformationRequired: [
        'Clarify the primary symptom — is this a recurring failure or a new observation?',
        'Confirm the operating environment — the reported conditions appear inconsistent with the identified contamination pattern.',
      ],
    };
  }

  // Condition 5: Evidence Floor Not Met (and domain is covered)
  if (domainCovered && !evidenceInventory.domainMinimumMet) {
    return {
      prohibited: true,
      reason: 'EVIDENCE_FLOOR_NOT_MET',
      minimumInformationRequired: [
        'Describe the observed symptoms or failure mode in more detail.',
        'Provide the asset model or specification where available.',
      ],
    };
  }

  return {
    prohibited: false,
    reason: null,
    minimumInformationRequired: [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function evaluate(input: EvaluationInput): EvaluationResult {
  // Step 1: Question Understanding
  const intentClass = input.intentClass;
  const intentConfirmed = intentClass !== 'UNKNOWN';

  // Step 2: Knowledge Coverage
  const { covered: domainCovered, notes: coverageNotes } = checkCoverage(input);

  // Step 3: Evidence Availability
  const evidenceInventory = buildInventory(intentClass, input);

  // Step 4: Inference Detection
  const inferenceAudit = auditClaims(input.draftClaims, evidenceInventory);

  // Step 5a: PROHIBITED Gate (executes before confidence scoring)
  const prohibitedGate = evaluateProhibitedGate(input, domainCovered, evidenceInventory);

  if (prohibitedGate.prohibited) {
    // Gate triggered — evaluation stops here. No confidence scoring. No recommendation.
    const composition = compose(input, prohibitedGate, null, evidenceInventory, inferenceAudit);
    return {
      intentClass,
      intentConfirmed,
      domainCovered,
      coverageNotes,
      evidenceInventory,
      inferenceAudit,
      prohibitedGate,
      confidenceResult: null,
      decisionState: 'PROHIBITED',
      composition,
    };
  }

  // Domain not covered → UNKNOWN, skip confidence
  if (!domainCovered) {
    const composition = compose(input, prohibitedGate, null, evidenceInventory, inferenceAudit);
    return {
      intentClass,
      intentConfirmed,
      domainCovered,
      coverageNotes,
      evidenceInventory,
      inferenceAudit,
      prohibitedGate,
      confidenceResult: null,
      decisionState: 'UNKNOWN',
      composition,
    };
  }

  // Step 5: Confidence Assessment
  const confidenceResult = calculateConfidence(intentClass, evidenceInventory, inferenceAudit);

  // Step 6: Decision
  const composition = compose(input, prohibitedGate, confidenceResult, evidenceInventory, inferenceAudit);

  // Map confidence level to decision state
  type DS = EvaluationResult['decisionState'];
  const decisionState: DS = ((): DS => {
    const level = confidenceResult.confidenceLevel;
    if (level === 'HIGH') return 'HIGH';
    if (level === 'MEDIUM') return 'MEDIUM';
    if (level === 'LOW') return 'LOW';
    return 'UNKNOWN';
  })();

  return {
    intentClass,
    intentConfirmed,
    domainCovered,
    coverageNotes,
    evidenceInventory,
    inferenceAudit,
    prohibitedGate,
    confidenceResult,
    decisionState,
    composition,
  };
}
