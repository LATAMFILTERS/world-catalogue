'use strict';

// EBP Phase 4 — orchestration layer: Validation Run creation, Engineering
// Decisions/Exceptions/Conditions, and Rule Catalog administration, per
// docs/ebp/phases/phase-04-validation-engine.md and
// docs/ebp/ENGINEERING_RULE_ENGINE.md.
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

const ENGINEERING_DECISIONS = ['PENDING_REVIEW', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED'];
const CONDITION_STATUSES = ['OPEN', 'SATISFIED', 'OVERDUE', 'WAIVED', 'FAILED', 'CANCELLED'];

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
  const ruleResults = ruleEngine.evaluateRuleSet(activeRules, context);
  const { mechanical_result, mechanically_eligible_for_approval } = ruleEngine.computeMechanicalResult(ruleResults);

  const inputVersions = {
    passport_id: context.passport_id,
    engineering_revision: context.engineering_revision,
    offer_id: context.offer_id,
    offer_revision: context.offer_revision,
    rule_versions: activeRules.map((r) => ({ rule_id: r.rule_id, rule_version: r.rule_version })),
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
        eventData: { superseded_by: newRun.id },
      });
    }

    await repository.insertRuleResults(client, newRun.id, ruleResults);

    // Decision 09: every offer requires a human decision. The system never
    // grants Engineering Approval itself — this auto-inserted row is
    // always PENDING_REVIEW, ensuring exactly one decision row chain exists
    // for the analytics view to read, never an implicit approval.
    await repository.insertDecision(client, {
      validation_run_id: newRun.id,
      decision: 'PENDING_REVIEW',
      decided_by: actor.declared_actor,
      identity_mechanism: actor.identity_mechanism,
      notes: 'Auto-created when Validation Run was created; awaiting human Engineering Decision (Decision 09, ADR-0047).',
    });

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

    for (const r of ruleResults) {
      await activityEvents.emitEvent(client, {
        eventType: 'RULE_EVALUATED',
        entityType: 'RULE_RESULT',
        entityId: newRun.id,
        entityVersion: `${r.rule_id}@${r.rule_version}`,
        offerId: context.offer_id,
        manufacturerId: context.manufacturer_id,
        passportId: context.passport_id,
        actor,
        eventData: { rule_id: r.rule_id, rule_version: r.rule_version, state: r.state },
      });
      const stateEventMap = {
        PASS: 'RULE_PASSED',
        FAIL: 'RULE_FAILED',
        WARNING: 'RULE_WARNING',
        NOT_APPLICABLE: 'RULE_NOT_APPLICABLE',
      };
      const stateEvent = stateEventMap[r.state];
      if (stateEvent) {
        await activityEvents.emitEvent(client, {
          eventType: stateEvent,
          entityType: 'RULE_RESULT',
          entityId: newRun.id,
          entityVersion: `${r.rule_id}@${r.rule_version}`,
          offerId: context.offer_id,
          manufacturerId: context.manufacturer_id,
          passportId: context.passport_id,
          actor,
          eventData: { rule_id: r.rule_id, rule_version: r.rule_version },
        });
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

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return newRun.id;
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

  return { offer_id: offerId, offer_revision: context.offer_revision, validation_run: run, rule_results: ruleResults, engineering_decision: decision, exceptions, conditions };
}

async function getValidationHistory(pool, offerId) {
  return repository.fetchValidationRunHistory(pool, offerId);
}

// ─── Engineering Decisions (Decisions 08/09, ADR-0046/ADR-0047) ─────────────

async function recordEngineeringDecision(pool, offerId, decisionValue, notes, conditions, actor) {
  if (!ENGINEERING_DECISIONS.includes(decisionValue)) {
    throw new ValidationError([`decision must be one of ${ENGINEERING_DECISIONS.join(', ')}`]);
  }
  await requireRole(pool, actor, 'ENGINEERING_APPROVER');

  const context = await repository.fetchOfferContext(pool, offerId);
  if (!context) throw new NotFoundError(`offer ${offerId} not found`);
  const run = await repository.fetchCurrentValidationRun(pool, offerId, context.offer_revision);
  if (!run) throw new ConflictError('no CURRENT Validation Run exists for this offer revision — run validation first');

  if (decisionValue === 'CONDITIONALLY_APPROVED' && (!conditions || !conditions.length)) {
    throw new ValidationError(['CONDITIONALLY_APPROVED requires at least one structured condition (Decision 08, ADR-0046)']);
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

// ─── Engineering Exceptions (Decision 07, ADR-0045) ─────────────────────────

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
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return updated;
}

// ─── Engineering Conditions (Decision 08, ADR-0046) ─────────────────────────

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
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return updated;
}

// ─── Rule Catalog administration (Decision 10, ADR-0048) ────────────────────

const COMPARISON_TYPES = [
  'EXACT_MATCH', 'NUMERIC_TOLERANCE', 'RANGE', 'MAXIMUM', 'MINIMUM',
  'ENUMERATION', 'PATTERN', 'BOOLEAN', 'REQUIRED_EVIDENCE', 'COMPOSITE', 'CONDITIONAL',
];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const EXCEPTION_POLICIES = ['NON_WAIVABLE', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'WAIVABLE_WITH_CONDITIONS'];

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
  let id;
  try {
    await client.query('BEGIN');
    id = await repository.insertRuleVersion(client, { ...payload, created_by: actor.declared_actor, status: 'DRAFT' });
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return repository.fetchRuleVersion(pool, payload.rule_id, payload.rule_version);
}

async function publishRuleVersionService(pool, ruleId, ruleVersion, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const rule = await repository.fetchRuleVersion(pool, ruleId, ruleVersion);
  if (!rule) throw new NotFoundError(`rule ${ruleId}@${ruleVersion} not found`);
  if (rule.status !== 'DRAFT') throw new ConflictError(`rule ${ruleId}@${ruleVersion} is ${rule.status}, only DRAFT may be published`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
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

// ─── Engineering Functional Role administration (Decision 01, ADR-0039) ─────

async function assignRoleService(pool, declaredActor, role, actor) {
  if (!['ENGINEERING_REVIEWER', 'ENGINEERING_APPROVER', 'ADMIN_OWNER'].includes(role)) {
    throw new ValidationError(['role must be one of ENGINEERING_REVIEWER, ENGINEERING_APPROVER, ADMIN_OWNER']);
  }
  // Bootstrap allowance: with zero ADMIN_OWNER assignments in existence,
  // nobody could ever satisfy requireRole(ADMIN_OWNER) to create the first
  // one. requireAdmin (the shared ADMIN_KEY) is still the real security
  // boundary this sits behind (Decision 01, ADR-0039) — this only skips the
  // functional-role check for the one-time bootstrap case.
  const ownerCount = await repository.countActiveAssignmentsForRole(pool, 'ADMIN_OWNER');
  if (ownerCount > 0) {
    await requireRole(pool, actor, 'ADMIN_OWNER');
  }
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

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  runValidation,
  getValidationSummary,
  getValidationHistory,
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
};
