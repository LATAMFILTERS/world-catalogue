'use strict';

// EBP Phase 4 — minimal Alert Layer (correction round, ADR-0037-aligned).
// Structured, resolvable alerts only. No Notification Center, no email —
// see docs/ebp/phases/phase-04-validation-engine.md "Dashboard Readiness"
// and the correction-round instructions for the exact minimum alert
// vocabulary. Deduplication is enforced at the database level
// (uq_ebp_alerts_open_dedup, migrations/ebp-phase4/002_correction.sql) —
// this module never needs to check "does one already exist" itself;
// repository.raiseAlert's ON CONFLICT handles it.

const repository = require('./repository');

const ALERT_TYPES = {
  VALIDATION_PENDING_REVIEW: 'VALIDATION_PENDING_REVIEW',
  CRITICAL_RULE_FAILURE: 'CRITICAL_RULE_FAILURE',
  REQUIRED_EVIDENCE_MISSING: 'REQUIRED_EVIDENCE_MISSING',
  EXCEPTION_PENDING: 'EXCEPTION_PENDING',
  CONDITION_DUE_SOON: 'CONDITION_DUE_SOON',
  CONDITION_OVERDUE: 'CONDITION_OVERDUE',
  CONDITION_FAILED: 'CONDITION_FAILED',
  VALIDATION_STALE: 'VALIDATION_STALE',
  ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION: 'ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION',
};

async function raiseValidationPendingReview(client, run) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.VALIDATION_PENDING_REVIEW,
    severity: 'MEDIUM',
    entity_type: 'VALIDATION_RUN',
    entity_id: run.id,
    manufacturer_id: run.manufacturer_id,
    passport_id: run.passport_id,
    offer_id: run.offer_id,
    validation_run_id: run.id,
    alert_data: { mechanical_result: run.mechanical_result },
  });
}

async function raiseCriticalRuleFailure(client, run, ruleResult) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.CRITICAL_RULE_FAILURE,
    severity: 'CRITICAL',
    entity_type: 'RULE_RESULT',
    entity_id: ruleResult.id,
    manufacturer_id: run.manufacturer_id,
    passport_id: run.passport_id,
    offer_id: run.offer_id,
    validation_run_id: run.id,
    alert_data: { rule_id: ruleResult.rule_id, rule_version: ruleResult.rule_version },
  });
}

async function raiseRequiredEvidenceMissing(client, run, ruleResult) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.REQUIRED_EVIDENCE_MISSING,
    severity: ruleResult.severity,
    entity_type: 'RULE_RESULT',
    entity_id: ruleResult.id,
    manufacturer_id: run.manufacturer_id,
    passport_id: run.passport_id,
    offer_id: run.offer_id,
    validation_run_id: run.id,
    alert_data: { rule_id: ruleResult.rule_id, rule_version: ruleResult.rule_version },
  });
}

async function raiseExceptionPending(client, exception) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.EXCEPTION_PENDING,
    severity: 'MEDIUM',
    entity_type: 'ENGINEERING_EXCEPTION',
    entity_id: exception.id,
    offer_id: exception.offer_id,
    alert_data: { rule_id: exception.rule_id, rule_version: exception.rule_version },
  });
}

async function resolveExceptionPending(client, exception, reason) {
  return repository.resolveAlerts(client, ALERT_TYPES.EXCEPTION_PENDING, 'ENGINEERING_EXCEPTION', exception.id, reason);
}

async function raiseConditionDueSoon(client, condition) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.CONDITION_DUE_SOON,
    severity: 'LOW',
    entity_type: 'ENGINEERING_CONDITION',
    entity_id: condition.id,
    due_at: condition.due_date,
    alert_data: { condition_type: condition.condition_type },
  });
}

async function raiseConditionOverdue(client, condition) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.CONDITION_OVERDUE,
    severity: 'HIGH',
    entity_type: 'ENGINEERING_CONDITION',
    entity_id: condition.id,
    due_at: condition.due_date,
    alert_data: { condition_type: condition.condition_type },
  });
}

async function raiseConditionFailed(client, condition) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.CONDITION_FAILED,
    severity: 'HIGH',
    entity_type: 'ENGINEERING_CONDITION',
    entity_id: condition.id,
    alert_data: { condition_type: condition.condition_type },
  });
}

async function resolveConditionAlerts(client, condition, reason) {
  await repository.resolveAlerts(client, ALERT_TYPES.CONDITION_DUE_SOON, 'ENGINEERING_CONDITION', condition.id, reason);
  await repository.resolveAlerts(client, ALERT_TYPES.CONDITION_OVERDUE, 'ENGINEERING_CONDITION', condition.id, reason);
  await repository.resolveAlerts(client, ALERT_TYPES.CONDITION_FAILED, 'ENGINEERING_CONDITION', condition.id, reason);
}

// Keyed by offer_id (not validation_run_id) — the "this offer has a stale
// validation and may need attention" signal outlives any one run, and is
// naturally resolved once a fresh CURRENT run exists for the offer.
async function raiseValidationStale(client, offerId, manufacturerId, passportId, staleRunId) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.VALIDATION_STALE,
    severity: 'MEDIUM',
    entity_type: 'OFFER',
    entity_id: offerId,
    manufacturer_id: manufacturerId,
    passport_id: passportId,
    offer_id: offerId,
    validation_run_id: staleRunId,
    alert_data: { stale_run_id: staleRunId },
  });
}

async function resolveValidationStale(client, offerId, reason) {
  return repository.resolveAlerts(client, ALERT_TYPES.VALIDATION_STALE, 'OFFER', offerId, reason);
}

async function raiseActiveOfferWithoutCurrentValidation(client, offer) {
  return repository.raiseAlert(client, {
    alert_type: ALERT_TYPES.ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION,
    severity: 'MEDIUM',
    entity_type: 'OFFER',
    entity_id: offer.offer_id,
    manufacturer_id: offer.manufacturer_id,
    passport_id: offer.passport_id,
    offer_id: offer.offer_id,
    alert_data: { offer_code: offer.offer_code },
  });
}

async function resolveActiveOfferWithoutCurrentValidation(client, offerId, reason) {
  return repository.resolveAlerts(client, ALERT_TYPES.ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION, 'OFFER', offerId, reason);
}

// scanTimeBasedAlerts — the manual, on-demand equivalent of a future
// scheduled job (mirrors Phase 3's ADR-0031 "centralized effective status,
// no cron required" precedent). Raises CONDITION_DUE_SOON for conditions
// due within `dueSoonDays`, and ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION for
// any active offer lacking a CURRENT Validation Run. CONDITION_OVERDUE/
// FAILED and VALIDATION_STALE are raised inline by service.js at the exact
// moment they occur, not by this scan.
async function scanTimeBasedAlerts(pool, dueSoonDays = 7) {
  const raised = { condition_due_soon: 0, active_offer_without_validation: 0 };

  const dueSoon = await repository.fetchConditionsDueSoon(pool, dueSoonDays);
  for (const condition of dueSoon) {
    await raiseConditionDueSoon(pool, condition);
    raised.condition_due_soon += 1;
  }

  const offersWithoutValidation = await repository.fetchActiveOffersWithoutCurrentValidation(pool);
  for (const offer of offersWithoutValidation) {
    await raiseActiveOfferWithoutCurrentValidation(pool, offer);
    raised.active_offer_without_validation += 1;
  }

  return raised;
}

module.exports = {
  ALERT_TYPES,
  raiseValidationPendingReview,
  raiseCriticalRuleFailure,
  raiseRequiredEvidenceMissing,
  raiseExceptionPending,
  resolveExceptionPending,
  raiseConditionDueSoon,
  raiseConditionOverdue,
  raiseConditionFailed,
  resolveConditionAlerts,
  raiseValidationStale,
  resolveValidationStale,
  raiseActiveOfferWithoutCurrentValidation,
  resolveActiveOfferWithoutCurrentValidation,
  scanTimeBasedAlerts,
};
