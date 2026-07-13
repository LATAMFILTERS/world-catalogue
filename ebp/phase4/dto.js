'use strict';

// EBP Phase 4 — internal-only DTOs. Every endpoint in this phase is
// mounted behind requireAdmin (docs/ebp/phases/phase-04-validation-engine.md
// "API Surface") — there is no Manufacturer- or Distributor-facing
// projection to build, unlike Phase 1/3's role-scoped DTOs.

const { renderObservation } = require('./observations');

// `row.effective_disposition` (correction round, item 2): computed by
// service.js — the same as `state` unless an APPROVED Exception exists
// for a REQUIRES_EXCEPTION result, in which case it is
// ACCEPTED_BY_EXCEPTION. Never stored on ebp_rule_results itself; this is
// purely a read-time projection so historical rows are never rewritten.
function toRuleResultDTO(row) {
  return {
    id: row.id,
    rule_id: row.rule_id,
    rule_version: row.rule_version,
    state: row.state,
    effective_disposition: row.effective_disposition !== undefined ? row.effective_disposition : row.state,
    severity: row.severity,
    observation_code: row.observation_code,
    observation_params: row.observation_params,
    observation_text: renderObservation(row.observation_code, row.observation_params),
    created_at: row.created_at,
  };
}

function toValidationRunDTO(run) {
  if (!run) return null;
  return {
    id: run.id,
    passport_id: run.passport_id,
    engineering_revision: run.engineering_revision,
    manufacturer_id: run.manufacturer_id,
    offer_id: run.offer_id,
    offer_revision: run.offer_revision,
    mechanical_result: run.mechanical_result,
    mechanically_eligible_for_approval: run.mechanically_eligible_for_approval,
    trigger: run.trigger,
    input_versions: run.input_versions,
    status: run.status,
    superseded_by: run.superseded_by,
    created_by: run.created_by,
    identity_mechanism: run.identity_mechanism,
    created_at: run.created_at,
  };
}

function toDecisionDTO(decision) {
  if (!decision) return null;
  return {
    id: decision.id,
    validation_run_id: decision.validation_run_id,
    decision: decision.decision,
    status: decision.status, // CURRENT / NEEDS_REVIEW — correction round
    decided_by: decision.decided_by,
    identity_mechanism: decision.identity_mechanism,
    notes: decision.notes,
    decided_at: decision.decided_at,
    conditions: (decision.conditions || []).map(toConditionDTO),
  };
}

function toConditionDTO(row) {
  return {
    id: row.id,
    engineering_decision_id: row.engineering_decision_id,
    condition_type: row.condition_type,
    description: row.description,
    requirement: row.requirement,
    responsible_party: row.responsible_party,
    due_date: row.due_date,
    required_evidence: row.required_evidence,
    status: row.status,
    satisfied_at: row.satisfied_at,
    consequence: row.consequence,
    created_at: row.created_at,
  };
}

function toExceptionDTO(row) {
  return {
    id: row.id,
    offer_id: row.offer_id,
    offer_revision: row.offer_revision,
    rule_id: row.rule_id,
    rule_version: row.rule_version,
    status: row.status,
    requested_by: row.requested_by,
    requested_at: row.requested_at,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    justification: row.justification,
  };
}

function toValidationSummaryDTO(summary) {
  return {
    offer_id: summary.offer_id,
    offer_revision: summary.offer_revision,
    validation_run: toValidationRunDTO(summary.validation_run),
    rule_results: (summary.rule_results || []).map(toRuleResultDTO),
    engineering_decision: toDecisionDTO(summary.engineering_decision),
    exceptions: (summary.exceptions || []).map(toExceptionDTO),
    conditions: (summary.conditions || []).map(toConditionDTO),
    selection_eligibility: summary.selection_eligibility || null,
  };
}

function toRuleVersionDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    rule_id: row.rule_id,
    rule_version: row.rule_version,
    rule_name: row.rule_name,
    description: row.description,
    comparison_type: row.comparison_type,
    severity: row.severity,
    exception_policy: row.exception_policy,
    category: row.category,
    applies_to: row.applies_to,
    rule_applicability: row.rule_applicability,
    default_behavior: row.default_behavior,
    operands: row.operands,
    observation_overrides: row.observation_overrides,
    status: row.status,
    effective_from: row.effective_from,
    effective_until: row.effective_until,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

function toAlertDTO(row) {
  return {
    alert_id: row.alert_id,
    alert_type: row.alert_type,
    severity: row.severity,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    manufacturer_id: row.manufacturer_id,
    passport_id: row.passport_id,
    offer_id: row.offer_id,
    validation_run_id: row.validation_run_id,
    status: row.status,
    detected_at: row.detected_at,
    due_at: row.due_at,
    resolved_at: row.resolved_at,
    resolution_reason: row.resolution_reason,
    alert_data: row.alert_data,
    correlation_id: row.correlation_id,
  };
}

module.exports = {
  toRuleResultDTO,
  toValidationRunDTO,
  toDecisionDTO,
  toConditionDTO,
  toExceptionDTO,
  toValidationSummaryDTO,
  toRuleVersionDTO,
  toAlertDTO,
};
