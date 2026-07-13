'use strict';

// EBP Phase 4 — orchestration layer: Validation Run creation, Engineering
// Decisions/Exceptions/Conditions, Rule Catalog administration, the Alert
// Layer, and role bootstrap, per docs/ebp/phases/phase-04-validation-engine.md
// and docs/ebp/ENGINEERING_RULE_ENGINE.md, corrected per the 2026-07-13
// pre-freeze correction round.
//
// Actor parameter convention (identical to every other phase): `actor` is
// always `{ declared_actor, identity_mechanism }` from ebp/phase1/actor.js
// — a self-reported label, never a verified identity, while Decision 01
// (ADR-0039) layers functional roles (ENGINEERING_REVIEWER/
// ENGINEERING_APPROVER/ADMIN_OWNER) on top of the existing shared
// requireAdmin mechanism via ebp_engineering_role_assignments.

const repository = require('./repository');
const ruleEngine = require('./rule-engine');
const activityEvents = require('./activity-events');
const alerts = require('./alerts');

class ValidationError extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.join('; ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const HUMAN_ENGINEERING_DECISIONS = ['APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED'];
const CONDITION_STATUSES = ['OPEN', 'SATISFIED', 'OVERDUE', 'WAIVED', 'FAILED', 'CANCELLED'];
const OFFER_INVALID_STATUSES = ['REJECTED', 'SUPERSEDED', 'EXPIRED', 'WITHDRAWN'];

async function requireRole(pool, actor, role) {
  const has = await repository.actorHasRole(pool, actor.declared_actor, role);
  if (!has) {
    throw new UnauthorizedError(`declared_actor "${actor.declared_actor}" does not hold the ${role} functional role (Decision 01, ADR-0039)`);
  }
}

// ─── Validation Run orchestration (Decision 12, ADR-0050) ───────────────────

async function runValidation(pool, offerId, trigger, actor) {
  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);

  const activeRules = await repository.fetchActiveRuleVersions(pool);
  const ruleByKey = new Map(activeRules.map((r) => [`${r.rule_id}@${r.rule_version}`, r]));
  const ruleResults = ruleEngine.evaluateRuleSet(activeRules, context);
  const { mechanical_result, mechanically_eligible_for_approval } = ruleEngine.computeMechanicalResult(ruleResults);

  // Correction round, item 2.5: every run's input_versions always embeds
  // the offer's current Exception ledger (id/rule/version/status/
  // decided_at) — regardless of trigger — so any run is a complete,
  // self-contained audit snapshot of what was known about Exceptions at
  // that moment. Approving/rejecting an Exception never rewrites this
  // historical snapshot on an earlier run.
  const allExceptions = await repository.fetchExceptionsForOffer(pool, context.offer_id, context.offer_revision);
  const inputVersions = {
    passport_id: context.passport_id,
    engineering_revision: context.engineering_revision,
    offer_id: context.offer_id,
    offer_revision: context.offer_revision,
    rule_versions: activeRules.map((r) => ({ rule_id: r.rule_id, rule_version: r.rule_version })),
    exceptions: allExceptions.map((e) => ({
      exception_id: e.id,
      rule_id: e.rule_id,
      rule_version: e.rule_version,
      status: e.status,
      decided_at: e.approved_at,
    })),
  };

  const client = await pool.connect();
  let newRun;
  try {
    await client.query('BEGIN');

    const priorRun = await repository.fetchCurrentValidationRun(client, context.offer_id, context.offer_revision);

    // The prior CURRENT run must vacate uq_ebp_validation_runs_one_current
    // (one CURRENT row per offer revision) before the new row can be
    // inserted; superseded_by is wired up afterward, once the new row's id
    // is known.
    if (priorRun) {
      await repository.markValidationRunStale(client, priorRun.id);
      await alerts.raiseValidationStale(client, context.offer_id, context.manufacturer_id, context.passport_id, priorRun.id);
    }

    newRun = await repository.insertValidationRun(client, {
      passport_id: context.passport_id,
      engineering_revision: context.engineering_revision,
      manufacturer_id: context.manufacturer_id,
      offer_id: context.offer_id,
      offer_revision: context.offer_revision,
      mechanical_result,
      mechanically_eligible_for_approval,
      trigger,
      input_versions: inputVersions,
      created_by: actor.declared_actor,
      identity_mechanism: actor.identity_mechanism,
    });

    if (priorRun) {
      await repository.setSupersededBy(client, priorRun.id, newRun.id);
      await activityEvents.emitEvent(client, {
        eventType: 'VALIDATION_MARKED_STALE',
        entityType: 'VALIDATION_RUN',
        entityId: priorRun.id,
        offerId: context.offer_id,
        manufacturerId: context.manufacturer_id,
        passportId: context.passport_id,
        actor,
        eventData: { superseded_by: newRun.id, trigger },
      });
      // A fresh CURRENT run now exists — the prior run's "pending review" /
      // "stale" concerns are moot; resolve both immediately rather than
      // leaving phantom open alerts pointing at a superseded run.
      await repository.resolveAlerts(client, alerts.ALERT_TYPES.VALIDATION_PENDING_REVIEW, 'VALIDATION_RUN', priorRun.id, 'run superseded by a newer Validation Run');
      await alerts.resolveValidationStale(client, context.offer_id, 'superseded by a newer Validation Run');
    }

    const insertedRuleResults = await repository.insertRuleResults(client, newRun.id, ruleResults);

    // Decision 09: every offer requires a human decision. The system never
    // grants Engineering Approval itself — this auto-inserted row is
    // always PENDING_REVIEW, ensuring exactly one decision row chain exists
    // for the analytics view to read, never an implicit approval.
    const decision = await repository.insertDecision(client, {
      validation_run_id: newRun.id,
      decision: 'PENDING_REVIEW',
      decided_by: actor.declared_actor,
      identity_mechanism: actor.identity_mechanism,
      notes: 'Auto-created when Validation Run was created; awaiting human Engineering Decision (Decision 09, ADR-0047).',
    });
    void decision;

    await activityEvents.emitEvent(client, {
      eventType: 'VALIDATION_RUN_CREATED',
      entityType: 'VALIDATION_RUN',
      entityId: newRun.id,
      offerId: context.offer_id,
      manufacturerId: context.manufacturer_id,
      passportId: context.passport_id,
      actor,
      eventData: { trigger },
    });

    await alerts.raiseValidationPendingReview(client, newRun);

    const stateEventMap = {
      PASS: 'RULE_PASSED',
      FAIL: 'RULE_FAILED',
      WARNING: 'RULE_WARNING',
      NOT_APPLICABLE: 'RULE_NOT_APPLICABLE',
    };

    for (const insertedResult of insertedRuleResults) {
      // Correction round, item 4: entity_id is the real ebp_rule_results.id,
      // never validation_run_id — this is what lets a future timeline
      // reconstruct "this exact rule result" as a single, stable entity.
      const commonEventFields = {
        entityType: 'RULE_RESULT',
        entityId: insertedResult.id,
        entityVersion: `${insertedResult.rule_id}@${insertedResult.rule_version}`,
        offerId: context.offer_id,
        manufacturerId: context.manufacturer_id,
        passportId: context.passport_id,
        actor,
      };

      await activityEvents.emitEvent(client, {
        ...commonEventFields,
        eventType: 'RULE_EVALUATED',
        eventData: { rule_id: insertedResult.rule_id, rule_version: insertedResult.rule_version, state: insertedResult.state, validation_run_id: newRun.id },
      });
      const stateEvent = stateEventMap[insertedResult.state];
      if (stateEvent) {
        await activityEvents.emitEvent(client, {
          ...commonEventFields,
          eventType: stateEvent,
          eventData: { rule_id: insertedResult.rule_id, rule_version: insertedResult.rule_version, validation_run_id: newRun.id },
        });
      }

      const rule = ruleByKey.get(`${insertedResult.rule_id}@${insertedResult.rule_version}`);

      if (insertedResult.state === 'FAIL' && insertedResult.severity === 'CRITICAL') {
        await alerts.raiseCriticalRuleFailure(client, newRun, insertedResult);
      }
      if (rule && rule.comparison_type === 'REQUIRED_EVIDENCE' && (insertedResult.state === 'FAIL' || insertedResult.state === 'REQUIRES_EXCEPTION')) {
        await alerts.raiseRequiredEvidenceMissing(client, newRun, insertedResult);
      }
    }

    // Consistency-audit fix (2026-07-13): best-effort, non-authoritative
    // projection into Phase 3's frozen compliance_status column. Never the
    // source of truth — ebp_rule_results remains authoritative. Only rules
    // whose default_behavior names a concrete field_name are projected.
    for (const rule of activeRules) {
      const fieldName = rule.default_behavior && rule.default_behavior.field_name;
      if (!fieldName) continue;
      const result = ruleResults.find((r) => r.rule_id === rule.rule_id);
      if (!result) continue;
      let compliance;
      if (result.state === 'PASS' || result.state === 'NOT_APPLICABLE') compliance = 'COMPLIANT';
      else if (result.state === 'FAIL' || result.state === 'REQUIRES_EXCEPTION') compliance = 'NON_COMPLIANT';
      else compliance = 'PENDING';
      await repository.projectComplianceStatus(client, context.offer_id, fieldName, compliance);
    }

    await activityEvents.emitEvent(client, {
      eventType: 'VALIDATION_COMPLETED',
      entityType: 'VALIDATION_RUN',
      entityId: newRun.id,
      offerId: context.offer_id,
      manufacturerId: context.manufacturer_id,
      passportId: context.passport_id,
      actor,
      eventData: { mechanical_result },
    });

    // This offer now has a CURRENT Validation Run — any earlier
    // "no current validation" alert is moot.
    await alerts.resolveActiveOfferWithoutCurrentValidation(client, context.offer_id, 'Validation Run created');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return newRun.id;
}

// Effective disposition per rule result: the technical result (state) is
// never overwritten, but when an APPROVED Exception exists for a
// REQUIRES_EXCEPTION result, the *effective* disposition for approval/
// selection purposes is ACCEPTED_BY_EXCEPTION — a deviation that was
// formally accepted, never counted as genuine technical compliance.
function computeEffectiveDisposition(ruleResult, approvedExceptionKeys) {
  if (ruleResult.state === 'REQUIRES_EXCEPTION' && approvedExceptionKeys.has(`${ruleResult.rule_id}@${ruleResult.rule_version}`)) {
    return 'ACCEPTED_BY_EXCEPTION';
  }
  return ruleResult.state;
}

async function getValidationSummary(pool, offerId) {
  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);

  const run = await repository.fetchCurrentValidationRun(pool, offerId, context.offer_revision);
  if (!run) return { offer_id: offerId, offer_revision: context.offer_revision, validation_run: null };

  const [ruleResults, decision, exceptions] = await Promise.all([
    repository.fetchRuleResults(pool, run.id),
    repository.fetchLatestDecisionForRun(pool, run.id),
    repository.fetchExceptionsForOffer(pool, offerId, context.offer_revision),
  ]);
  const conditions = decision ? await repository.fetchConditionsForDecision(pool, decision.id) : [];

  const approvedExceptionKeys = new Set(exceptions.filter((e) => e.status === 'APPROVED').map((e) => `${e.rule_id}@${e.rule_version}`));
  const ruleResultsWithDisposition = ruleResults.map((r) => ({ ...r, effective_disposition: computeEffectiveDisposition(r, approvedExceptionKeys) }));

  return {
    offer_id: offerId,
    offer_revision: context.offer_revision,
    validation_run: run,
    rule_results: ruleResultsWithDisposition,
    engineering_decision: decision,
    exceptions,
    conditions,
    selection_eligibility: computeSelectionEligibilityFromParts(run, decision, conditions),
  };
}

async function getValidationHistory(pool, offerId) {
  return repository.fetchValidationRunHistory(pool, offerId);
}

// ─── Selection eligibility (correction round, item 3) ───────────────────────
// Phase 5 (Manufacturer Selection) does not exist yet — this function is
// the eligibility gate future Phase 5 must call; it must never be
// satisfied by silently reading a stale decision row without accounting
// for its linked conditions' current state.

function computeSelectionEligibilityFromParts(run, decision, conditions) {
  if (!run || run.status !== 'CURRENT') return { eligible: false, reason: 'no CURRENT Validation Run' };
  if (!decision || !['APPROVED', 'CONDITIONALLY_APPROVED'].includes(decision.decision)) {
    return { eligible: false, reason: 'no eligible Engineering Decision (APPROVED or CONDITIONALLY_APPROVED) recorded' };
  }
  if (decision.status === 'NEEDS_REVIEW') {
    return { eligible: false, reason: 'Engineering Decision requires re-review — a linked condition changed' };
  }
  if (decision.decision === 'CONDITIONALLY_APPROVED') {
    const blockingConditions = (conditions || []).filter((c) => ['OPEN', 'OVERDUE', 'FAILED'].includes(c.status));
    if (blockingConditions.length) {
      return { eligible: false, reason: `${blockingConditions.length} mandatory condition(s) not yet SATISFIED/WAIVED` };
    }
  }
  return { eligible: true, reason: null };
}

async function computeSelectionEligibility(pool, offerId) {
  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);
  const run = await repository.fetchCurrentValidationRun(pool, offerId, context.offer_revision);
  if (!run) return { eligible: false, reason: 'no CURRENT Validation Run' };
  const decision = await repository.fetchLatestDecisionForRun(pool, run.id);
  const conditions = decision ? await repository.fetchConditionsForDecision(pool, decision.id) : [];
  return computeSelectionEligibilityFromParts(run, decision, conditions);
}

// ─── Engineering Decisions (Decisions 08/09, ADR-0046/ADR-0047; strict
// eligibility per the 2026-07-13 correction round) ───────────────────────

async function recordEngineeringDecision(pool, offerId, decisionValue, notes, conditions, actor) {
  if (decisionValue === 'PENDING_REVIEW') {
    throw new ValidationError(['PENDING_REVIEW is the system-generated initial state and can never be submitted as a human decision, especially when another decision is already current']);
  }
  if (!HUMAN_ENGINEERING_DECISIONS.includes(decisionValue)) {
    throw new ValidationError([`decision must be one of ${HUMAN_ENGINEERING_DECISIONS.join(', ')}`]);
  }
  await requireRole(pool, actor, 'ENGINEERING_APPROVER');

  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);

  // "El Offer y su revisión siguen vigentes" — a REJECTED,
  // SUPERSEDED, EXPIRED, or WITHDRAWN offer, or one past its expires_at,
  // can never receive a new Engineering Decision.
  if (OFFER_INVALID_STATUSES.includes(context.offer_status)) {
    throw new ConflictError(`offer is ${context.offer_status} — cannot record an Engineering Decision`);
  }
  if (context.offer_expires_at && new Date(context.offer_expires_at) < new Date()) {
    throw new ConflictError('offer has expired — cannot record an Engineering Decision');
  }

  const run = await repository.fetchCurrentValidationRun(pool, offerId, context.offer_revision);
  if (!run) throw new ConflictError('no CURRENT Validation Run exists for this offer revision — run validation first');

  const ruleResults = await repository.fetchRuleResults(pool, run.id);
  const allExceptions = await repository.fetchExceptionsForOffer(pool, offerId, context.offer_revision);
  const approvedExceptionKeys = new Set(allExceptions.filter((e) => e.status === 'APPROVED').map((e) => `${e.rule_id}@${e.rule_version}`));

  const hasFail = ruleResults.some((r) => r.state === 'FAIL');
  const hasBlockingReview = ruleResults.some((r) => r.state === 'REQUIRES_REVIEW');
  const unresolvedExceptionRules = ruleResults.filter((r) => r.state === 'REQUIRES_EXCEPTION' && !approvedExceptionKeys.has(`${r.rule_id}@${r.rule_version}`));

  if (decisionValue === 'REJECTED') {
    if (!notes || !notes.trim()) throw new ValidationError(['REJECTED requires a documented reason (notes)']);
    // No eligibility restriction — REJECTED may be recorded over any
    // current result, per the correction round's own rule.
  } else if (decisionValue === 'APPROVED') {
    if (conditions && conditions.length) {
      throw new ValidationError(['APPROVED cannot carry conditions — use CONDITIONALLY_APPROVED when follow-up conditions are required']);
    }
    if (hasFail) throw new ConflictError('cannot APPROVE: at least one NON_WAIVABLE rule is FAIL');
    if (hasBlockingReview) throw new ConflictError('cannot APPROVE: at least one rule result still REQUIRES_REVIEW');
    if (unresolvedExceptionRules.length) {
      throw new ConflictError(`cannot APPROVE: ${unresolvedExceptionRules.length} rule(s) in REQUIRES_EXCEPTION have no APPROVED exception yet`);
    }
    if (run.mechanical_result !== 'MECHANICALLY_PASS') {
      throw new ConflictError(`cannot APPROVE: mechanical_result is ${run.mechanical_result}, not MECHANICALLY_PASS`);
    }
  } else if (decisionValue === 'CONDITIONALLY_APPROVED') {
    if (!conditions || !conditions.length) {
      throw new ValidationError(['CONDITIONALLY_APPROVED requires at least one structured condition (Decision 08, ADR-0046)']);
    }
    if (hasFail) throw new ConflictError('cannot CONDITIONALLY_APPROVE: at least one NON_WAIVABLE rule is FAIL');
    if (hasBlockingReview) throw new ConflictError('cannot CONDITIONALLY_APPROVE: at least one rule result still REQUIRES_REVIEW');
    if (unresolvedExceptionRules.length) {
      throw new ConflictError(`cannot CONDITIONALLY_APPROVE: ${unresolvedExceptionRules.length} rule(s) in REQUIRES_EXCEPTION have no APPROVED exception yet`);
    }
  }

  const client = await pool.connect();
  let decision;
  try {
    await client.query('BEGIN');

    await activityEvents.emitEvent(client, {
      eventType: 'ENGINEERING_REVIEW_STARTED',
      entityType: 'VALIDATION_RUN',
      entityId: run.id,
      offerId,
      manufacturerId: context.manufacturer_id,
      passportId: context.passport_id,
      actor,
      eventData: {},
    });

    decision = await repository.insertDecision(client, {
      validation_run_id: run.id,
      decision: decisionValue,
      decided_by: actor.declared_actor,
      identity_mechanism: actor.identity_mechanism,
      notes,
    });

    const createdConditions = [];
    if (decisionValue === 'CONDITIONALLY_APPROVED') {
      for (const c of conditions) {
        if (!c.condition_type || !c.description || !c.requirement) {
          throw new ValidationError(['each condition requires condition_type, description, and requirement']);
        }
        const row = await repository.insertCondition(client, { ...c, engineering_decision_id: decision.id });
        createdConditions.push(row);
        await activityEvents.emitEvent(client, {
          eventType: 'ENGINEERING_CONDITION_CREATED',
          entityType: 'ENGINEERING_CONDITION',
          entityId: row.id,
          offerId,
          manufacturerId: context.manufacturer_id,
          passportId: context.passport_id,
          actor,
          eventData: { condition_type: row.condition_type },
        });
      }
    }

    await activityEvents.emitEvent(client, {
      eventType: 'ENGINEERING_DECISION_RECORDED',
      entityType: 'ENGINEERING_DECISION',
      entityId: decision.id,
      offerId,
      manufacturerId: context.manufacturer_id,
      passportId: context.passport_id,
      actor,
      eventData: { decision: decisionValue },
    });

    await client.query('COMMIT');
    decision.conditions = createdConditions;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return decision;
}

// ─── Engineering Exceptions (Decision 07, ADR-0045; revalidation effect
// per the 2026-07-13 correction round) ───────────────────────────────────

async function requestException(pool, offerId, ruleId, ruleVersion, justification, actor) {
  if (!justification || !justification.trim()) throw new ValidationError(['justification is required']);

  const hasReviewerRole = await repository.actorHasRole(pool, actor.declared_actor, 'ENGINEERING_REVIEWER');
  const hasApproverRole = await repository.actorHasRole(pool, actor.declared_actor, 'ENGINEERING_APPROVER');
  if (!hasReviewerRole && !hasApproverRole) {
    throw new UnauthorizedError(`declared_actor "${actor.declared_actor}" holds no engineering functional role`);
  }

  const rule = await repository.fetchRuleVersion(pool, ruleId, ruleVersion);
  if (!rule) throw new NotFoundError(`rule ${ruleId}@${ruleVersion} not found`);
  if (rule.exception_policy === 'NON_WAIVABLE') {
    throw new ConflictError(`rule ${ruleId}@${ruleVersion} is NON_WAIVABLE (Decision 02, ADR-0040) — no exception may be requested`);
  }

  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);
  const run = await repository.fetchCurrentValidationRun(pool, offerId, context.offer_revision);
  if (!run) throw new ConflictError('no CURRENT Validation Run exists for this offer revision');
  const results = await repository.fetchRuleResults(pool, run.id);
  const result = results.find((r) => r.rule_id === ruleId && r.rule_version === ruleVersion);
  if (!result || result.state !== 'REQUIRES_EXCEPTION') {
    throw new ConflictError(`rule ${ruleId}@${ruleVersion} is not in REQUIRES_EXCEPTION state for the current Validation Run`);
  }

  const client = await pool.connect();
  let exception;
  try {
    await client.query('BEGIN');
    exception = await repository.insertException(client, {
      offer_id: offerId,
      offer_revision: context.offer_revision,
      rule_id: ruleId,
      rule_version: ruleVersion,
      requested_by: actor.declared_actor,
      justification,
    });
    await activityEvents.emitEvent(client, {
      eventType: 'ENGINEERING_EXCEPTION_REQUESTED',
      entityType: 'ENGINEERING_EXCEPTION',
      entityId: exception.id,
      offerId,
      manufacturerId: context.manufacturer_id,
      passportId: context.passport_id,
      actor,
      eventData: { rule_id: ruleId, rule_version: ruleVersion },
    });
    await alerts.raiseExceptionPending(client, exception);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') throw new ConflictError(`an exception already exists for offer ${offerId} revision ${context.offer_revision}, rule ${ruleId}@${ruleVersion} (Decision 07 scope, ADR-0045)`);
    throw err;
  } finally {
    client.release();
  }
  return exception;
}

// Approving or rejecting an Exception changes an evaluation input
// (correction round, item 2): the CURRENT Validation Run is marked STALE
// and the offer cannot receive a final Engineering Approval until a new
// Validation Run is executed with trigger EXCEPTION_APPROVED/
// EXCEPTION_REJECTED. Rather than leave that as a manual follow-up step
// that could be forgotten (no background job infrastructure exists in
// this platform), this function triggers that revalidation itself,
// deterministically, in the same operation — guaranteeing the required
// trigger value and input_versions snapshot are always correct. Historical
// Rule Results on the now-STALE run are never rewritten; the new run gets
// its own fresh set.
async function decideException(pool, exceptionId, approve, actor) {
  await requireRole(pool, actor, 'ENGINEERING_APPROVER');
  const exception = await repository.fetchExceptionById(pool, exceptionId);
  if (!exception) throw new NotFoundError(`exception ${exceptionId} not found`);
  if (exception.status !== 'REQUESTED') throw new ConflictError(`exception ${exceptionId} is already ${exception.status}`);

  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    updated = await repository.updateExceptionStatus(client, exceptionId, approve ? 'APPROVED' : 'REJECTED', actor.declared_actor);
    await activityEvents.emitEvent(client, {
      eventType: approve ? 'ENGINEERING_EXCEPTION_APPROVED' : 'ENGINEERING_EXCEPTION_REJECTED',
      entityType: 'ENGINEERING_EXCEPTION',
      entityId: exceptionId,
      offerId: exception.offer_id,
      actor,
      eventData: { rule_id: exception.rule_id, rule_version: exception.rule_version },
    });
    await alerts.resolveExceptionPending(client, exception, `exception ${approve ? 'APPROVED' : 'REJECTED'}`);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Deliberately outside the transaction above: runValidation manages its
  // own transaction (it must, since it also has to vacate the partial
  // unique index before inserting the new CURRENT row). The exception
  // decision itself is durable at this point regardless of what happens
  // next.
  await runValidation(pool, exception.offer_id, approve ? 'EXCEPTION_APPROVED' : 'EXCEPTION_REJECTED', actor);

  return updated;
}

// ─── Engineering Conditions (Decision 08, ADR-0046; eligibility
// re-evaluation per the 2026-07-13 correction round) ─────────────────────

const DECISION_REVIEW_EVENT = 'ENGINEERING_DECISION_REQUIRES_REVIEW';

async function updateConditionStatusService(pool, conditionId, status, actor) {
  if (!CONDITION_STATUSES.includes(status)) throw new ValidationError([`status must be one of ${CONDITION_STATUSES.join(', ')}`]);
  await requireRole(pool, actor, 'ENGINEERING_APPROVER');

  const condition = await repository.fetchConditionById(pool, conditionId);
  if (!condition) throw new NotFoundError(`condition ${conditionId} not found`);

  const eventMap = { SATISFIED: 'ENGINEERING_CONDITION_SATISFIED', OVERDUE: 'ENGINEERING_CONDITION_OVERDUE', FAILED: 'ENGINEERING_CONDITION_FAILED' };

  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    updated = await repository.updateConditionStatus(client, conditionId, status);
    const eventType = eventMap[status];
    if (eventType) {
      await activityEvents.emitEvent(client, {
        eventType,
        entityType: 'ENGINEERING_CONDITION',
        entityId: conditionId,
        actor,
        eventData: { condition_type: condition.condition_type },
      });
    }

    if (status === 'OVERDUE') await alerts.raiseConditionOverdue(client, condition);
    else if (status === 'FAILED') await alerts.raiseConditionFailed(client, condition);
    if (['SATISFIED', 'WAIVED', 'CANCELLED'].includes(status)) {
      await alerts.resolveConditionAlerts(client, condition, `condition ${status}`);
    }

    // Correction round, item 3: a condition changing state must never let
    // its decision's eligibility drift silently. Recompute the decision's
    // effective status from ALL of its sibling conditions' current state —
    // NEEDS_REVIEW if any is FAILED/OVERDUE, CURRENT otherwise. The
    // decision row itself (decision/decided_by/notes/decided_at) is never
    // rewritten; only this correction-round `status` column changes.
    const siblingConditions = await repository.fetchConditionsForDecision(client, condition.engineering_decision_id);
    const anyBlocking = siblingConditions.some((c) => ['FAILED', 'OVERDUE'].includes(c.status));
    const newDecisionStatus = anyBlocking ? 'NEEDS_REVIEW' : 'CURRENT';
    const decisionBefore = await repository.fetchDecisionById(client, condition.engineering_decision_id);
    if (decisionBefore && decisionBefore.status !== newDecisionStatus) {
      await repository.setDecisionStatus(client, condition.engineering_decision_id, newDecisionStatus);
      if (newDecisionStatus === 'NEEDS_REVIEW') {
        await activityEvents.emitEvent(client, {
          eventType: DECISION_REVIEW_EVENT,
          entityType: 'ENGINEERING_DECISION',
          entityId: condition.engineering_decision_id,
          actor,
          eventData: { reason: `condition ${condition.id} is ${status}` },
        });
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return updated;
}

// ─── Rule Catalog administration (Decision 10, ADR-0048; publication
// validation per the 2026-07-13 correction round) ────────────────────────

const COMPARISON_TYPES = [
  'EXACT_MATCH', 'NUMERIC_TOLERANCE', 'RANGE', 'MAXIMUM', 'MINIMUM',
  'ENUMERATION', 'PATTERN', 'BOOLEAN', 'REQUIRED_EVIDENCE', 'COMPOSITE', 'CONDITIONAL',
];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const EXCEPTION_POLICIES = ['NON_WAIVABLE', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'WAIVABLE_WITH_CONDITIONS'];
const RULE_RESULT_STATES = ['PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE', 'REQUIRES_REVIEW', 'REQUIRES_EXCEPTION'];
const KNOWN_APPLICABILITY_KEYS = ['product_category', 'product_subtype', 'duty', 'technology_code', 'requires_field_present', 'requires_field_value'];

function validateRuleVersionPayload(payload) {
  const errors = [];
  if (!payload.rule_id) errors.push('rule_id is required');
  if (!Number.isInteger(payload.rule_version) || payload.rule_version < 1) errors.push('rule_version must be a positive integer');
  if (!payload.rule_name) errors.push('rule_name is required');
  if (!payload.description) errors.push('description is required');
  if (!COMPARISON_TYPES.includes(payload.comparison_type)) errors.push(`comparison_type must be one of ${COMPARISON_TYPES.join(', ')}`);
  if (!SEVERITIES.includes(payload.severity)) errors.push(`severity must be one of ${SEVERITIES.join(', ')}`);
  if (payload.exception_policy && !EXCEPTION_POLICIES.includes(payload.exception_policy)) errors.push(`exception_policy must be one of ${EXCEPTION_POLICIES.join(', ')}`);
  // Decision 02: CRITICAL severity defaults to NON_WAIVABLE; an explicit
  // waivable CRITICAL rule must say so visibly (accepted, but never silent).
  if (payload.severity === 'CRITICAL' && !payload.exception_policy) {
    payload.exception_policy = 'NON_WAIVABLE';
  }
  if (!payload.category) errors.push('category is required');
  if (!payload.applies_to) errors.push('applies_to is required');
  if (!payload.default_behavior) errors.push('default_behavior is required');
  return errors;
}

async function createRuleVersion(pool, payload, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const errors = validateRuleVersionPayload(payload);
  if (errors.length) throw new ValidationError(errors);

  const existingVersions = await repository.fetchRuleVersionsByRuleId(pool, payload.rule_id);
  if (existingVersions.some((v) => v.rule_version === payload.rule_version)) {
    throw new ConflictError(`rule ${payload.rule_id}@${payload.rule_version} already exists — published versions are never edited (Decision 10, ADR-0048)`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await repository.insertRuleVersion(client, { ...payload, created_by: actor.declared_actor, status: 'DRAFT' });
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return repository.fetchRuleVersion(pool, payload.rule_id, payload.rule_version);
}

// Validates default_behavior completeness for a given comparison_type.
// Recurses once for CONDITIONAL's nested `then` config.
function validateDefaultBehaviorCompleteness(comparisonType, defaultBehavior, path = 'default_behavior') {
  const errors = [];
  const db = defaultBehavior || {};
  if (comparisonType === 'COMPOSITE') return errors; // COMPOSITE uses `operands`, not `default_behavior`
  if (comparisonType === 'CONDITIONAL') {
    if (!db.precondition || !db.precondition.field || !db.precondition.operator) {
      errors.push(`${path}.precondition (with field + operator) is required for CONDITIONAL`);
    }
    if (!db.then || !db.then.comparison_type) {
      errors.push(`${path}.then.comparison_type is required for CONDITIONAL`);
    } else {
      errors.push(...validateDefaultBehaviorCompleteness(db.then.comparison_type, db.then, `${path}.then`));
    }
    return errors;
  }
  if (!db.field_name) errors.push(`${path}.field_name is required for ${comparisonType}`);
  switch (comparisonType) {
    case 'MINIMUM':
      if (db.min === undefined && db.target_source !== 'PASSPORT_FIELD') errors.push(`${path}.min (or target_source: PASSPORT_FIELD) is required for MINIMUM`);
      break;
    case 'MAXIMUM':
      if (db.max === undefined && db.target_source !== 'PASSPORT_FIELD') errors.push(`${path}.max (or target_source: PASSPORT_FIELD) is required for MAXIMUM`);
      break;
    case 'RANGE':
      if (db.min === undefined || db.max === undefined) errors.push(`${path}.min and ${path}.max are both required for RANGE`);
      break;
    case 'NUMERIC_TOLERANCE':
      if (db.target === undefined && db.target_source !== 'PASSPORT_FIELD') errors.push(`${path}.target (or target_source: PASSPORT_FIELD) is required for NUMERIC_TOLERANCE`);
      if (db.tolerance_pct === undefined && db.tolerance_abs === undefined) errors.push(`${path}.tolerance_pct or ${path}.tolerance_abs is required for NUMERIC_TOLERANCE`);
      break;
    case 'ENUMERATION':
      if (!Array.isArray(db.allowed) || !db.allowed.length) errors.push(`${path}.allowed (non-empty array) is required for ENUMERATION`);
      break;
    case 'PATTERN':
      if (!db.pattern) errors.push(`${path}.pattern is required for PATTERN`);
      break;
    case 'BOOLEAN':
      if (db.expected === undefined) errors.push(`${path}.expected is required for BOOLEAN`);
      break;
    case 'EXACT_MATCH':
      if (db.target === undefined && db.target_source !== 'PASSPORT_FIELD') errors.push(`${path}.target (or target_source: PASSPORT_FIELD) is required for EXACT_MATCH`);
      break;
    case 'REQUIRED_EVIDENCE':
      break; // field_name alone is sufficient
    default:
      break;
  }
  return errors;
}

function validateApplicabilityShape(ruleApplicability) {
  const errors = [];
  const ra = ruleApplicability || {};
  for (const key of Object.keys(ra)) {
    if (!KNOWN_APPLICABILITY_KEYS.includes(key)) errors.push(`rule_applicability key "${key}" is not a recognized applicability field (Decision 11, ADR-0049)`);
  }
  for (const key of ['product_category', 'product_subtype', 'duty', 'technology_code']) {
    if (ra[key] !== undefined && !Array.isArray(ra[key])) errors.push(`rule_applicability.${key} must be an array of strings`);
  }
  return errors;
}

function validateObservationOverridesShape(overrides) {
  const errors = [];
  if (!overrides) return errors;
  for (const [state, code] of Object.entries(overrides)) {
    if (!RULE_RESULT_STATES.includes(state)) errors.push(`observation_overrides key "${state}" is not one of the six decided Rule Result states`);
    if (typeof code !== 'string' || !/^OBS_[A-Z0-9_]+$/.test(code)) errors.push(`observation_overrides["${state}"] must be a code matching OBS_[A-Z0-9_]+ (found "${code}")`);
  }
  return errors;
}

// Detects direct and indirect cycles among COMPOSITE rules' operand
// references, considering the candidate rule being published plus every
// currently-ACTIVE rule (so a cycle can span more than one already-
// published rule, not only the one being published).
function detectCompositeCycle(candidateRule, activeRules) {
  const graph = new Map();
  for (const r of activeRules) {
    if (r.comparison_type === 'COMPOSITE' && r.operands && Array.isArray(r.operands.rule_ids)) {
      graph.set(r.rule_id, r.operands.rule_ids);
    }
  }
  if (candidateRule.comparison_type === 'COMPOSITE' && candidateRule.operands && Array.isArray(candidateRule.operands.rule_ids)) {
    graph.set(candidateRule.rule_id, candidateRule.operands.rule_ids);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  let cyclePath = null;

  function visit(node, path) {
    color.set(node, GRAY);
    for (const next of graph.get(node) || []) {
      if (color.get(next) === GRAY) {
        cyclePath = [...path, node, next];
        return true;
      }
      if (color.get(next) !== BLACK && graph.has(next)) {
        if (visit(next, [...path, node])) return true;
      }
    }
    color.set(node, BLACK);
    return false;
  }

  for (const node of graph.keys()) {
    if (color.get(node) === undefined) {
      if (visit(node, [])) return cyclePath;
    }
  }
  return null;
}

async function publishRuleVersionService(pool, ruleId, ruleVersion, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const rule = await repository.fetchRuleVersion(pool, ruleId, ruleVersion);
  if (!rule) throw new NotFoundError(`rule ${ruleId}@${ruleVersion} not found`);
  if (rule.status !== 'DRAFT') throw new ConflictError(`rule ${ruleId}@${ruleVersion} is ${rule.status}, only DRAFT may be published`);

  const errors = [];

  // Completeness per comparison_type.
  if (rule.comparison_type === 'COMPOSITE') {
    if (!rule.operands || !rule.operands.operator || !Array.isArray(rule.operands.rule_ids) || !rule.operands.rule_ids.length) {
      errors.push('operands.operator and a non-empty operands.rule_ids array are required for COMPOSITE');
    }
  } else {
    errors.push(...validateDefaultBehaviorCompleteness(rule.comparison_type, rule.default_behavior));
  }

  // Gating: a rule may never weaken the fixed Severity floor (Decision 03).
  if (rule.default_behavior && rule.default_behavior.suppress_blocking && (rule.severity === 'CRITICAL' || rule.severity === 'HIGH')) {
    errors.push(`severity ${rule.severity} may never be configured to suppress blocking (Decision 03, ADR-0041 — harden-only, never weaken)`);
  }

  // CRITICAL + waivable must be explicitly acknowledged, never silent.
  if (rule.severity === 'CRITICAL' && rule.exception_policy !== 'NON_WAIVABLE') {
    if (!rule.default_behavior || rule.default_behavior.critical_waivable_acknowledged !== true) {
      errors.push('a CRITICAL rule with a waivable exception_policy must set default_behavior.critical_waivable_acknowledged = true (Decision 02, ADR-0040)');
    }
  }

  errors.push(...validateApplicabilityShape(rule.rule_applicability));
  errors.push(...validateObservationOverridesShape(rule.observation_overrides));

  // Operand existence + cycle detection for COMPOSITE rules.
  if (rule.comparison_type === 'COMPOSITE' && rule.operands && Array.isArray(rule.operands.rule_ids)) {
    const activeRules = await repository.fetchActiveRuleVersions(pool);
    const activeRuleIds = new Set(activeRules.map((r) => r.rule_id));
    for (const operandId of rule.operands.rule_ids) {
      if (operandId === rule.rule_id) {
        errors.push(`operands.rule_ids references its own rule_id "${operandId}" — a direct self-reference cycle`);
        continue;
      }
      if (!activeRuleIds.has(operandId)) {
        errors.push(`operands.rule_ids references "${operandId}", which has no ACTIVE rule version`);
      }
    }
    if (!errors.length) {
      const cycle = detectCompositeCycle(rule, activeRules);
      if (cycle) errors.push(`Composite dependency cycle detected: ${cycle.join(' -> ')}`);
    }
  }

  if (errors.length) throw new ValidationError(errors);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // supersedeRuleVersion only ever touches rows matching this exact
    // rule_id — other rule_ids' ACTIVE versions are never affected.
    await repository.supersedeRuleVersion(client, ruleId, ruleVersion);
    await repository.publishRuleVersion(client, ruleId, ruleVersion);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return repository.fetchRuleVersion(pool, ruleId, ruleVersion);
}

async function retireRuleVersionService(pool, ruleId, ruleVersion, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const rule = await repository.fetchRuleVersion(pool, ruleId, ruleVersion);
  if (!rule) throw new NotFoundError(`rule ${ruleId}@${ruleVersion} not found`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await repository.retireRuleVersion(client, ruleId, ruleVersion);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return repository.fetchRuleVersion(pool, ruleId, ruleVersion);
}

// ─── Engineering Functional Role administration + permanent bootstrap
// (Decision 01, ADR-0039; corrected per the 2026-07-13 correction round) ──

async function assignRoleService(pool, declaredActor, role, actor) {
  if (!['ENGINEERING_REVIEWER', 'ENGINEERING_APPROVER', 'ADMIN_OWNER'].includes(role)) {
    throw new ValidationError(['role must be one of ENGINEERING_REVIEWER, ENGINEERING_APPROVER, ADMIN_OWNER']);
  }

  const alreadyBootstrapped = await repository.hasBootstrapped(pool);

  if (!alreadyBootstrapped && role === 'ADMIN_OWNER') {
    // One-time bootstrap path. The permanent ebp_engineering_admin_bootstrap
    // record (id=TRUE primary key) makes concurrent bootstrap attempts
    // race-safe at the database level: only one INSERT can ever succeed.
    // This never reopens even if the bootstrapped ADMIN_OWNER is later
    // revoked or deleted — hasBootstrapped() checks for the permanent
    // record's existence, never the current count of active assignments.
    const client = await pool.connect();
    let row;
    try {
      await client.query('BEGIN');
      await repository.insertBootstrapRecord(client, actor.declared_actor);
      row = await repository.assignRole(client, declaredActor, role, actor.declared_actor);
      await activityEvents.emitEvent(client, {
        eventType: 'ENGINEERING_ADMIN_OWNER_BOOTSTRAPPED',
        entityType: 'ENGINEERING_ROLE_ASSIGNMENT',
        entityId: row.id,
        actor,
        eventData: { declared_actor: declaredActor },
      });
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        // Another concurrent request won the bootstrap race — fall through
        // to the normal, role-gated path below (it will correctly reject
        // this caller unless they separately hold ADMIN_OWNER).
        throw new ConflictError('ADMIN_OWNER bootstrap was already completed by a concurrent request — the bootstrap allowance is now permanently closed; use an existing ADMIN_OWNER to assign further roles');
      }
      throw err;
    } finally {
      client.release();
    }
    return row;
  }

  // Normal path: the bootstrap allowance is closed (or this isn't an
  // ADMIN_OWNER assignment) — the caller must already hold ADMIN_OWNER,
  // regardless of how many ADMIN_OWNER assignments are currently active.
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const client = await pool.connect();
  let row;
  try {
    await client.query('BEGIN');
    row = await repository.assignRole(client, declaredActor, role, actor.declared_actor);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return row;
}

async function revokeRoleService(pool, declaredActor, role, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await repository.revokeRole(client, declaredActor, role, actor.declared_actor);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Alert Layer read/administration surface ────────────────────────────────

async function listAlerts(pool, filters) {
  return repository.fetchAlerts(pool, filters);
}

async function acknowledgeAlert(pool, alertId, actor) {
  void actor;
  const alert = await repository.fetchAlertById(pool, alertId);
  if (!alert) throw new NotFoundError(`alert ${alertId} not found`);
  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    updated = await repository.updateAlertStatus(client, alertId, 'ACKNOWLEDGED');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return updated;
}

async function dismissAlert(pool, alertId, reason, actor) {
  void actor;
  const alert = await repository.fetchAlertById(pool, alertId);
  if (!alert) throw new NotFoundError(`alert ${alertId} not found`);
  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    updated = await repository.updateAlertStatus(client, alertId, 'DISMISSED', reason);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return updated;
}

async function scanTimeBasedAlerts(pool) {
  return alerts.scanTimeBasedAlerts(pool);
}

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  runValidation,
  getValidationSummary,
  getValidationHistory,
  computeSelectionEligibility,
  recordEngineeringDecision,
  requestException,
  decideException,
  updateConditionStatus: updateConditionStatusService,
  createRuleVersion,
  publishRuleVersion: publishRuleVersionService,
  retireRuleVersion: retireRuleVersionService,
  assignRole: assignRoleService,
  revokeRole: revokeRoleService,
  requireRole,
  listAlerts,
  acknowledgeAlert,
  dismissAlert,
  scanTimeBasedAlerts,
  fetchValidationOverview: (pool) => repository.fetchValidationOverview(pool),
  fetchRuleFailureStats: (pool) => repository.fetchRuleFailureStats(pool),
  fetchManufacturerFailureStats: (pool) => repository.fetchManufacturerFailureStats(pool),
  fetchTimelineForEntity: (pool, entityType, entityId) => repository.fetchTimelineForEntity(pool, entityType, entityId),
};
