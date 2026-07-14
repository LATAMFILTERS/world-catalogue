'use strict';

// EBP Phase 5 — internal-only projections. Mirrors Phase 4's dto.js
// convention: no field is ever silently added to an API response without
// an explicit allow-list here.

function toSelectionRunDTO(run) {
  if (!run) return null;
  return {
    id: run.id,
    passport_id: run.passport_id,
    engineering_revision: run.engineering_revision,
    selection_version: run.selection_version,
    selection_policy_id: run.selection_policy_id,
    demand_signal_id: run.demand_signal_id,
    demand_not_provided: run.demand_not_provided,
    run_result: run.run_result,
    superseded_by: run.superseded_by,
    trigger: run.trigger,
    triggered_by: run.triggered_by,
    created_at: run.created_at,
  };
}

function toCandidateDTO(candidate, factorScores = []) {
  return {
    id: candidate.id,
    offer_id: candidate.offer_id,
    offer_revision: candidate.offer_revision,
    manufacturer_id: candidate.manufacturer_id,
    eligible: candidate.eligible,
    exclusion_reason: candidate.exclusion_reason,
    composite_score_pre_bonus: candidate.composite_score_pre_bonus,
    preferred_bonus_applied: candidate.preferred_bonus_applied,
    composite_score_final: candidate.composite_score_final,
    rank_position: candidate.rank_position,
    tier: candidate.tier,
    backup_diversification_limited: candidate.backup_diversification_limited,
    factor_scores: factorScores.map(toFactorScoreDTO),
  };
}

function toFactorScoreDTO(fs) {
  return {
    factor_code: fs.factor_code,
    factor_category: fs.factor_category,
    original_value: fs.original_value,
    unit: fs.unit,
    source: fs.source,
    source_version: fs.source_version,
    normalized_value: fs.normalized_value,
    weight: fs.weight,
    weighted_contribution: fs.weighted_contribution,
    penalty: fs.penalty,
    gate_applied: fs.gate_applied,
    status: fs.status,
    reason_code: fs.reason_code,
    explanation_params: fs.explanation_params,
    evidence_reference: fs.evidence_reference,
  };
}

function toSelectionDecisionDTO(decision) {
  if (!decision) return null;
  return {
    id: decision.id,
    selection_run_id: decision.selection_run_id,
    status: decision.status,
    decided_by: decision.decided_by,
    decided_at: decision.decided_at,
    notes: decision.notes,
    approved_primary_offer_id: decision.approved_primary_offer_id,
    approved_secondary_offer_id: decision.approved_secondary_offer_id,
    approved_backup_offer_id: decision.approved_backup_offer_id,
  };
}

function toOverrideDTO(override) {
  if (!override) return null;
  return {
    id: override.id,
    selection_run_id: override.selection_run_id,
    tier: override.tier,
    engine_recommended_offer_id: override.engine_recommended_offer_id,
    engine_recommended_score: override.engine_recommended_score,
    requested_offer_id: override.requested_offer_id,
    requested_by: override.requested_by,
    requested_at: override.requested_at,
    reason: override.reason,
    status: override.status,
    decided_by: override.decided_by,
    decided_at: override.decided_at,
    decision_notes: override.decision_notes,
  };
}

function toPolicyDTO(policy) {
  if (!policy) return null;
  return {
    id: policy.id,
    policy_code: policy.policy_code,
    policy_version: policy.policy_version,
    name: policy.name,
    description: policy.description,
    scope_type: policy.scope_type,
    scope_value: policy.scope_value,
    weights: policy.weights,
    status: policy.status,
    effective_from: policy.effective_from,
    created_by: policy.created_by,
  };
}

module.exports = {
  toSelectionRunDTO,
  toCandidateDTO,
  toFactorScoreDTO,
  toSelectionDecisionDTO,
  toOverrideDTO,
  toPolicyDTO,
};
