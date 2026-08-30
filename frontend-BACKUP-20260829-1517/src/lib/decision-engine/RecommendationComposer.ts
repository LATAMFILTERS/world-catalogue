/**
 * RecommendationComposer — Step 6 of the Engineering Decision Engine
 *
 * Composes the authorized recommendation only when Step 6 produces
 * RECOMMEND or RECOMMEND WITH DISCLOSURE. Returns null for all other states.
 *
 * Mandatory sequence (RECOMMENDATION_GOVERNANCE.md):
 *   Engineering Statement → Evidence Chain → Confidence Declaration →
 *   Technology Recommendation → Product Recommendation → Implementation Guidance
 *
 * Products are always last. Engineering statement is always first.
 */

import type {
  EvaluationInput,
  EvidenceInventoryResult,
  InferenceAuditResult,
  ConfidenceCalculationResult,
  ProhibitedGateResult,
  CompositionResult,
  RecommendationComposition,
  ProhibitedComposition,
  InsufficientComposition,
  ConfidenceLevel,
  ProhibitedReason,
} from './decision-engine-types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildEngineeringStatement(
  input: EvaluationInput,
  confidenceLevel: ConfidenceLevel,
): string {
  const domain = input.domain !== 'UNKNOWN' ? input.domain.replace(/_/g, ' ') : 'identified';
  const asset = input.assetDescription ?? input.assetId ?? 'the identified asset';

  const contaminationCount = input.contaminationEntityIds.length;
  const failureModeCount = input.failureModeEntityIds.length;

  let statement = `For ${asset}, the engineering evaluation of ${domain.toLowerCase()} contamination has been completed.`;

  if (contaminationCount > 0) {
    statement += ` ${contaminationCount} contamination ${contaminationCount === 1 ? 'mode has' : 'modes have'} been identified and evaluated.`;
  }
  if (failureModeCount > 0) {
    statement += ` ${failureModeCount} failure ${failureModeCount === 1 ? 'mode' : 'modes'} relevant to this application ${failureModeCount === 1 ? 'has' : 'have'} been mapped.`;
  }
  if (input.technologyEntityIds.length > 0) {
    statement += ` Technology architecture has been matched to the contamination profile.`;
  }

  return statement;
}

function buildEvidenceChain(
  evidenceInventory: EvidenceInventoryResult,
): string[] {
  const chain: string[] = [];
  const present = evidenceInventory.categories.filter(
    c => c.availability === 'PRESENT' || c.availability === 'KNOWN' ||
         c.availability === 'MAPPED' || c.availability === 'CORRELATED',
  );
  const partial = evidenceInventory.categories.filter(
    c => c.availability === 'PARTIAL' || c.availability === 'INFERABLE',
  );

  for (const cat of present) {
    chain.push(`${cat.name}: confirmed (${cat.sources.slice(0, 3).join(', ')})`);
  }
  for (const cat of partial) {
    chain.push(`${cat.name}: partial — ${cat.sources.slice(0, 2).join(', ')}`);
  }

  return chain;
}

function buildImplementationGuidance(
  input: EvaluationInput,
  confidenceLevel: ConfidenceLevel,
): string {
  const parts: string[] = [];

  parts.push('Implementation requires verification of compatibility with identified equipment before product selection.');

  if (input.domain === 'HYDRAULIC') {
    parts.push('Hydraulic systems require commissioning flush before introducing upgraded filtration to avoid particle migration.');
  }
  if (input.domain === 'FUEL') {
    parts.push('Fuel system filtration changes require monitoring of differential pressure indicators during initial operating period.');
  }
  if (input.domain === 'AIR_INTAKE') {
    parts.push('Air intake filter service intervals must be adjusted to operating environment — standard OEM intervals are calibrated for average conditions, not this application.');
  }
  if (input.domain === 'LUBE_OIL') {
    parts.push('Oil analysis at the next service interval will confirm whether the contamination target is being achieved.');
  }

  if (confidenceLevel === 'MEDIUM') {
    parts.push('This recommendation includes engineering hypotheses. Confirm disclosed assumptions before committing to service interval changes.');
  }

  parts.push('Monitor differential pressure indicators and document at each service event to build engineering memory for this asset.');

  return parts.join(' ');
}

function prohibitedReasonText(reason: ProhibitedReason): string {
  switch (reason) {
    case 'UNKNOWN_EQUIPMENT':
      return 'Asset type has not been identified. Engineering evaluation cannot proceed without knowing the equipment being protected.';
    case 'UNKNOWN_CONTAMINATION_SOURCE':
      return 'Contamination domain has not been identified. The evaluation cannot determine which filtration system applies.';
    case 'UNKNOWN_OPERATING_CONDITIONS':
      return 'Operating conditions are not known. Domain-specific evaluation requires minimum operating context.';
    case 'CONFLICTING_EVIDENCE':
      return 'Available evidence contains internal contradictions. The evaluation cannot form a defensible conclusion until conflicting signals are resolved.';
    case 'EVIDENCE_FLOOR_NOT_MET':
      return 'Minimum evidence requirements for this domain have not been met. Additional engineering information is required before evaluation can proceed.';
  }
}

function buildMinimumInformationRequired(
  input: EvaluationInput,
  reason: ProhibitedReason,
): string[] {
  const questions: string[] = [];

  switch (reason) {
    case 'UNKNOWN_EQUIPMENT':
      questions.push('What type of equipment is being evaluated? (e.g., mining excavator, agricultural harvester, hydraulic press)');
      questions.push('What is the primary engine or system type?');
      break;
    case 'UNKNOWN_CONTAMINATION_SOURCE':
      questions.push('Which system requires filtration evaluation? (Air intake, fuel, hydraulic, lube oil, cabin air, compressed air)');
      questions.push('What is the primary contamination concern — airborne dust, water ingress, particle wear, or system cleanliness?');
      break;
    case 'UNKNOWN_OPERATING_CONDITIONS':
      questions.push('What is the operating environment? (dusty, wet, high temperature, marine, underground)');
      questions.push('What are the operating hours per day and annual hours for this asset?');
      if (input.domain === 'HYDRAULIC') {
        questions.push('What is the hydraulic system operating pressure?');
      }
      if (input.domain === 'AIR_INTAKE') {
        questions.push('What is the estimated ambient dust concentration at the operating site?');
      }
      break;
    case 'CONFLICTING_EVIDENCE':
      questions.push('Clarify the primary symptom: is the issue recurring failure, performance degradation, or contamination found at service?');
      questions.push('Confirm the operating conditions — environmental data conflicts with reported symptom pattern.');
      break;
    case 'EVIDENCE_FLOOR_NOT_MET':
      if (!input.assetId && !input.assetDescription) {
        questions.push('Identify the asset type and model where possible.');
      }
      if (input.contaminationEntityIds.length === 0) {
        questions.push('Identify the contamination domain (air, fuel, hydraulic, lube oil, cabin, compressed air).');
      }
      if (input.symptomIds.length === 0 && input.failureModeEntityIds.length === 0) {
        questions.push('Describe the observed symptoms or the failure mode being investigated.');
      }
      break;
  }

  // Always apply Question Economy Principle — never more than 3 questions
  return questions.slice(0, 3);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function compose(
  input: EvaluationInput,
  prohibitedGate: ProhibitedGateResult,
  confidenceResult: ConfidenceCalculationResult | null,
  evidenceInventory: EvidenceInventoryResult,
  inferenceAudit: InferenceAuditResult,
): CompositionResult {
  // PROHIBITED state — no reasoning permitted
  if (prohibitedGate.prohibited && prohibitedGate.reason) {
    const composition: ProhibitedComposition = {
      authorized: false,
      decisionState: 'PROHIBITED',
      reason: prohibitedGate.reason,
      minimumInformationRequired:
        prohibitedGate.minimumInformationRequired.length > 0
          ? prohibitedGate.minimumInformationRequired
          : buildMinimumInformationRequired(input, prohibitedGate.reason),
    };
    return composition;
  }

  // LOW or UNKNOWN — do not recommend, continue diagnostic
  if (!confidenceResult || confidenceResult.confidenceLevel === 'LOW' || confidenceResult.confidenceLevel === 'UNKNOWN') {
    const composition: InsufficientComposition = {
      authorized: false,
      decisionState: confidenceResult?.confidenceLevel === 'LOW' ? 'LOW' : 'UNKNOWN',
      confidenceLevel: confidenceResult?.confidenceLevel ?? 'UNKNOWN',
      continueDiagnostic: true,
    };
    return composition;
  }

  // HIGH or MEDIUM — recommendation authorized
  const level = confidenceResult.confidenceLevel;
  if (level !== 'HIGH' && level !== 'MEDIUM') {
    const composition: InsufficientComposition = {
      authorized: false,
      decisionState: 'LOW',
      confidenceLevel: level,
      continueDiagnostic: true,
    };
    return composition;
  }

  const disclosures = inferenceAudit.claims.filter(c => c.disclosureRequired);
  const recommendedEntityIds = [
    ...input.technologyEntityIds,
    ...input.contaminationEntityIds.slice(0, 2),
  ];

  const composition: RecommendationComposition = {
    authorized: true,
    decisionState: level,
    confidenceLevel: level,
    engineeringStatement: buildEngineeringStatement(input, level),
    evidenceChain: buildEvidenceChain(evidenceInventory),
    disclosures,
    recommendedEntityIds,
    implementationGuidance: buildImplementationGuidance(input, level),
  };

  return composition;
}
