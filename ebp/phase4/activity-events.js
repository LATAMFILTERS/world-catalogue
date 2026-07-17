'use strict';

// EBP platform-wide Activity Events ledger (ADR-0037, PLATFORM_ARCHITECTURE.md
// §8.1) — implemented for the first time by Phase 4. Every future phase
// reuses this exact table and this exact helper; no phase may create an
// independent event system.
//
// Dashboard Readiness event vocabulary (docs/ebp/ENGINEERING_RULE_ENGINE.md
// §11 / phase-04-validation-engine.md): VALIDATION_RUN_CREATED,
// RULE_EVALUATED, RULE_PASSED, RULE_FAILED, RULE_WARNING,
// RULE_NOT_APPLICABLE, VALIDATION_COMPLETED, VALIDATION_MARKED_STALE,
// ENGINEERING_REVIEW_STARTED, ENGINEERING_DECISION_RECORDED,
// ENGINEERING_EXCEPTION_REQUESTED, ENGINEERING_EXCEPTION_APPROVED,
// ENGINEERING_EXCEPTION_REJECTED, ENGINEERING_CONDITION_CREATED,
// ENGINEERING_CONDITION_SATISFIED, ENGINEERING_CONDITION_OVERDUE,
// ENGINEERING_CONDITION_FAILED.

// emitEvent(client, event) — `client` is a pg Pool or an in-transaction
// Client; event emission is never allowed to abort the caller's
// transaction, so callers should emit only after their own writes have
// succeeded (fire-and-record, not fire-and-forget — this IS the durable
// record, so failures here are logged loudly, never silently swallowed).
async function emitEvent(client, event) {
  const {
    eventType,
    entityType,
    entityId,
    entityVersion = null,
    passportId = null,
    manufacturerId = null,
    batchId = null,
    offerId = null,
    userId = null,
    actor,
    correlationId = null,
    eventData = {},
  } = event;

  if (!eventType || !entityType || !entityId) {
    throw new Error('activity-events.emitEvent requires eventType, entityType, and entityId');
  }

  await client.query(
    `INSERT INTO ebp_activity_events
       (event_type, entity_type, entity_id, entity_version, passport_id,
        manufacturer_id, batch_id, offer_id, user_id, declared_actor,
        identity_mechanism, correlation_id, event_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      eventType,
      entityType,
      entityId,
      entityVersion,
      passportId,
      manufacturerId,
      batchId,
      offerId,
      userId,
      actor ? actor.declared_actor : null,
      actor ? actor.identity_mechanism : 'ADMIN_KEY_SHARED',
      correlationId,
      JSON.stringify(eventData),
    ]
  );
}

module.exports = { emitEvent };
