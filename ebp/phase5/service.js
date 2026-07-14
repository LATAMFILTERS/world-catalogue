'use strict';

// EBP Phase 5 — orchestration layer: the Selection Run pipeline (eligibility
// gate -> factor scoring -> composite score -> tie-break -> tier assignment),
// Offer Commercial Approval, Selection Policy governance, Preferred
// Manufacturer, Demand Signal, Manual Override two-step workflow, and role
// bootstrap — per docs/ebp/phases/phase-05-manufacturer-selection.md and
// docs/ebp/MANUFACTURER_SELECTION_ENGINE.md (Decisions 01-12, ADR-0062
// through ADR-0074).
//
// Actor parameter convention (identical to every other phase): `actor` is
// always `{ declared_actor, identity_mechanism }`.

const repository = require('./repository');
const policyLib = require('./policy');
const ranking = require('./ranking');
const activityEvents = require('../phase4/activity-events');
const phase4Service = require('../phase4/service');
const phase4Repository = require('../phase4/repository');

class ValidationError extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.join('; ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
class NotFoundError extends Error {
  constructor(message) { super(message); this.name = 'NotFoundError'; }
}
class ConflictError extends Error {
  constructor(message) { super(message); this.name = 'ConflictError'; }
}
class UnauthorizedError extends Error {
  constructor(message) { super(message); this.name = 'UnauthorizedError'; }
}

const OFFER_INVALID_STATUSES = ['REJECTED', 'SUPERSEDED', 'EXPIRED', 'WITHDRAWN', 'DRAFT'];
const MANUFACTURER_INELIGIBLE_STATUSES = ['SUSPENDED', 'CANDIDATE', 'RETIRED'];

async function requireRole(pool, actor, role) {
  const has = await repository.actorHasRole(pool, actor.declared_actor, role);
  if (!has) {
    throw new UnauthorizedError(`declared_actor "${actor.declared_actor}" does not hold the ${role} functional role (Decision 05, ADR-0066)`);
  }
}

// ─── Offer Commercial Approval (Decision 11, ADR-0072) ─────────────────────

async function recordCommercialApproval(pool, offerId, offerRevision, decisionValue, reason, notes, extra, actor) {
  if (!['APPROVED', 'REJECTED'].includes(decisionValue)) {
    throw new ValidationError(['status must be APPROVED or REJECTED']);
  }
  await requireRole(pool, actor, 'COMMERCIAL_APPROVER');
  if (decisionValue === 'REJECTED' && !reason) {
    throw new ValidationError(['REJECTED requires a documented reason']);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const approval = await repository.insertCommercialApproval(client, {
      offer_id: offerId, offer_revision: offerRevision, status: decisionValue,
      elimfilters_approved_quantity: extra?.elimfilters_approved_quantity,
      final_approved_packaging: extra?.final_approved_packaging,
      deviation_decision: extra?.deviation_decision,
      decided_by: actor.declared_actor, reason, notes,
    });
    await activityEvents.emitEvent(client, {
      eventType: decisionValue === 'APPROVED' ? 'OFFER_COMMERCIAL_APPROVAL_APPROVED' : 'OFFER_COMMERCIAL_APPROVAL_REJECTED',
      entityType: 'OFFER_COMMERCIAL_APPROVAL', entityId: approval.id, offerId, actor,
      eventData: { offer_revision: offerRevision, status: decisionValue },
    });
    await client.query('COMMIT');
    return approval;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ─── Selection Policy governance (Decision 07, ADR-0068) ───────────────────

async function createSelectionPolicy(pool, fields, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const errors = policyLib.validateWeights(fields.weights || {});
  if (errors.length) throw new ValidationError(errors);
  const nextVersion = await repository.fetchNextPolicyVersion(pool, fields.policy_code);
  return repository.insertSelectionPolicy(pool, { ...fields, policy_version: nextVersion, status: 'DRAFT', created_by: actor.declared_actor });
}

async function publishSelectionPolicy(pool, policyId, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const published = await repository.publishSelectionPolicy(client, policyId);
    if (!published) throw new NotFoundError(`selection policy ${policyId} not found`);
    await activityEvents.emitEvent(client, {
      eventType: 'SELECTION_POLICY_PUBLISHED', entityType: 'SELECTION_POLICY', entityId: published.id, actor,
      eventData: { policy_code: published.policy_code, policy_version: published.policy_version, scope_type: published.scope_type, scope_value: published.scope_value },
    });
    await client.query('COMMIT');
    return published;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function ensureDefaultPolicy(pool, actor) {
  const existing = await repository.fetchActiveSelectionPolicies(pool, { product_category: null, product_subtype: null, duty: null, technology_code: null });
  const platformPolicy = existing.find((p) => p.scope_type === 'PLATFORM');
  if (platformPolicy) return platformPolicy;
  const draft = await createSelectionPolicy(pool, policyLib.defaultSelectionPolicyFields(), actor);
  return publishSelectionPolicy(pool, draft.id, actor);
}

function resolveMostSpecificPolicy(policies) {
  const specificityOrder = ['TECHNOLOGY', 'DUTY', 'SUBTYPE', 'CATEGORY', 'PLATFORM'];
  for (const scope of specificityOrder) {
    const matches = policies.filter((p) => p.scope_type === scope);
    if (matches.length === 1) return { policy: matches[0], conflict: false };
    if (matches.length > 1) return { policy: null, conflict: true };
  }
  return { policy: null, conflict: false };
}

// ─── Preferred Manufacturer (Decision 10, ADR-0071) ────────────────────────

async function createPreferredManufacturer(pool, fields, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const pref = await repository.insertPreferredManufacturer(client, { ...fields, created_by: actor.declared_actor, approved_by: actor.declared_actor });
    await activityEvents.emitEvent(client, {
      eventType: 'PREFERRED_MANUFACTURER_APPLIED', entityType: 'PREFERRED_MANUFACTURER', entityId: pref.id,
      manufacturerId: pref.manufacturer_id, actor, eventData: { scope_type: pref.scope_type, scope_value: pref.scope_value },
    });
    await client.query('COMMIT');
    return pref;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function declareDemandSignal(pool, fields, actor) {
  return repository.insertDemandSignal(pool, { ...fields, declared_by: actor.declared_actor });
}

// ─── Eligibility (seven-part gate, Decision 11/ADR-0072) ───────────────────

// evaluateCandidateEligibility: `bulk` (optional) supplies pre-fetched Maps
// for points 5-7 (architecture-review performance correction — these three
// checks no longer issue one query per candidate; see runSelectionPool
// below). Point 2-4 (Phase 4's computeSelectionEligibility) remains a
// per-offer call by design — it is never batched or re-derived (Decision
// 11/ADR-0072).
async function evaluateCandidateEligibility(db, offer, passportContext, bulk = null) {
  const reasons = [];

  // 1. Offer active/current + not expired
  if (OFFER_INVALID_STATUSES.includes(offer.offer_status)) {
    reasons.push(`Offer status is ${offer.offer_status}`);
  }
  if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
    reasons.push('Offer has expired');
  }

  // 2-4. CURRENT Validation Run + Engineering Decision + Conditions
  // (reuses Phase 4's computeSelectionEligibility exactly, never re-derived)
  const phase4Eligibility = await phase4Service.computeSelectionEligibility(db, offer.offer_id);
  if (!phase4Eligibility.eligible) {
    reasons.push(`Phase 4 eligibility: ${phase4Eligibility.reason}`);
  }

  // 5. Offer Commercial Approval APPROVED (Phase 5, ADR-0072)
  const commercialApproval = bulk
    ? bulk.commercialApprovals.get(`${offer.offer_id}@${offer.offer_revision}`)
    : await repository.fetchLatestCommercialApproval(db, offer.offer_id, offer.offer_revision);
  if (!commercialApproval || commercialApproval.status !== 'APPROVED') {
    reasons.push('no APPROVED Offer Commercial Approval on file');
  }

  // 6. Manufacturer/location qualified
  if (MANUFACTURER_INELIGIBLE_STATUSES.includes(offer.manufacturer_status)) {
    reasons.push(`Manufacturer status is ${offer.manufacturer_status}`);
  }
  const qualification = bulk
    ? bulk.qualifications.get(offer.manufacturer_id)
    : await repository.fetchManufacturerQualification(db, offer.manufacturer_id, passportContext.product_category, passportContext.product_subtype);
  if (!qualification || !['QUALIFIED', 'CONDITIONAL'].includes(qualification.status)) {
    reasons.push('Manufacturer not QUALIFIED/CONDITIONAL-satisfied for this family');
  }

  // 7. Certifications current
  const certGapCount = bulk
    ? (bulk.certGapCounts.get(offer.manufacturer_id) || 0)
    : (await repository.fetchCertificationGapForManufacturer(db, offer.manufacturer_id)).length;
  if (certGapCount) {
    reasons.push(`${certGapCount} expired/invalid certification(s) on file`);
  }

  return { eligible: reasons.length === 0, reasons };
}

// ─── Factor scoring (Decisions 01/09, ADR-0062/0070) ───────────────────────

function buildFactorScores(offer, pool_context) {
  const { fobRange, leadTimeRange, capacityRange, approvedExceptionCount, penalties, diversificationScore } = pool_context;
  const scores = [];

  const fobNorm = policyLib.normalizeLinear(Number(offer.fob_price), fobRange.min, fobRange.max, true);
  scores.push({ factor_code: 'FOB_PRICE', factor_category: 'COMMERCIAL', original_value: Number(offer.fob_price), unit: offer.currency, normalized_value: fobNorm, reason_code: 'SEL_REASON_LOWEST_VALID_FOB' });

  const leadNorm = policyLib.normalizeLinear(Number(offer.lead_time_days) || 0, leadTimeRange.min, leadTimeRange.max, true);
  scores.push({ factor_code: 'LEAD_TIME_DAYS', factor_category: 'OPERATIONAL', original_value: offer.lead_time_days, unit: 'days', normalized_value: leadNorm, reason_code: 'SEL_REASON_CAPACITY_BELOW_TARGET' });

  const capNorm = policyLib.normalizeLinear(Number(offer.monthly_capacity) || 0, capacityRange.min, capacityRange.max, false);
  scores.push({ factor_code: 'MONTHLY_CAPACITY', factor_category: 'OPERATIONAL', original_value: offer.monthly_capacity, unit: 'units/month', normalized_value: capNorm, reason_code: 'SEL_REASON_CAPACITY_BELOW_TARGET' });

  // Technical Priority Rule (Decision 01/ADR-0062, MANUFACTURER_SELECTION_ENGINE.md
  // §3A): an Offer carrying APPROVED Exceptions competes but must receive an
  // explicit, traceable technical penalty — never scored as if it had zero
  // Exceptions. Penalty magnitude is a Selection Policy parameter, never a
  // hardcoded number.
  const { penalized_score, penalty_applied } = policyLib.applyExceptionPenalty(100, approvedExceptionCount, penalties);
  scores.push({
    factor_code: 'ENGINEERING_ELIGIBILITY', factor_category: 'ENGINEERING', original_value: 'APPROVED',
    normalized_value: penalized_score, penalty: penalty_applied,
    reason_code: approvedExceptionCount > 0 ? 'SEL_REASON_TECHNICAL_EXCEPTION_PENALTY' : 'SEL_REASON_LOWEST_VALID_FOB',
    explanation_params: { approved_exception_count: approvedExceptionCount },
  });

  const validityDays = offer.offer_validity_until ? Math.max(0, Math.ceil((new Date(offer.offer_validity_until) - new Date()) / (1000 * 60 * 60 * 24))) : (offer.expires_at ? Math.max(0, Math.ceil((new Date(offer.expires_at) - new Date()) / (1000 * 60 * 60 * 24))) : null);
  scores.push({ factor_code: 'OFFER_VALIDITY_REMAINING', factor_category: 'COMMERCIAL', original_value: validityDays, unit: 'days', normalized_value: validityDays !== null ? policyLib.normalizeLinear(validityDays, 0, 365, false) : null, reason_code: 'SEL_REASON_OFFER_EXPIRES_SOON' });

  scores.push({ factor_code: 'GEOGRAPHIC_DIVERSIFICATION', factor_category: 'STRATEGIC', original_value: offer.country_code, normalized_value: diversificationScore, reason_code: 'SEL_REASON_GEOGRAPHIC_DIVERSIFICATION' });

  return scores;
}

function rangeOf(values) {
  const nums = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  if (!nums.length) return { min: 0, max: 0 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

// ─── Selection Run pipeline (Result Model, ADR-0074) ───────────────────────

async function runSelection(pool, passportId, trigger, actor, options = {}) {
  const passportContext = await repository.fetchPassportContext(pool, passportId);
  if (!passportContext) throw new NotFoundError(`passport ${passportId} not found`);

  const policies = await repository.fetchActiveSelectionPolicies(pool, passportContext);
  const { policy, conflict } = resolveMostSpecificPolicy(policies);

  const offers = await repository.fetchCandidateOffers(pool, passportId);
  const demand = await repository.fetchLatestDemandSignal(pool, passportId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!policy && !conflict) {
      // No ACTIVE policy resolvable at all yet (first-ever run) — bootstrap
      // the default Selection Policy and retry. Not itself a conflict, so
      // no Selection Run is recorded for this bootstrap step.
      await client.query('COMMIT');
      await ensureDefaultPolicy(pool, actor);
      return runSelection(pool, passportId, trigger, actor, options);
    }

    if (conflict) {
      const version = await repository.fetchNextSelectionVersion(client, passportId);
      const run = await repository.insertSelectionRun(client, {
        passport_id: passportId, engineering_revision: passportContext.engineering_revision || 1,
        selection_version: version, selection_policy_id: policies[0].id,
        demand_signal_id: demand ? demand.id : null, demand_not_provided: !demand,
        run_result: 'POLICY_CONFLICT', trigger, triggered_by: actor.declared_actor, input_versions: {},
      });
      await repository.markPriorRunsStale(client, passportId, run.id);
      await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_SELECTION_STARTED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { run_result: 'POLICY_CONFLICT' } });
      await repository.raiseAlert(client, { alert_type: 'POLICY_CONFLICT', severity: 'HIGH', entity_type: 'SELECTION_RUN', entity_id: run.id, passport_id: passportId, alert_data: { scope_type: policies[0].scope_type, conflicting_policy_count: policies.length } });
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_REVIEW_REQUIRED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { reason: 'POLICY_CONFLICT' } });
      await client.query('COMMIT');
      return { run, candidates: [] };
    }

    const version = await repository.fetchNextSelectionVersion(client, passportId);
    const runResultPlaceholder = { passport_id: passportId, engineering_revision: passportContext.engineering_revision || 1, selection_version: version, selection_policy_id: policy.id, demand_signal_id: demand ? demand.id : null, demand_not_provided: !demand, trigger, triggered_by: actor.declared_actor };

    await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_SELECTION_STARTED', entityType: 'PASSPORT', entityId: passportId, passportId, actor, eventData: { selection_version: version } });

    // Bulk-fetch points 5-7 of the eligibility gate for the whole candidate
    // pool in four queries total, instead of one query per candidate per
    // point (architecture-review performance correction — see
    // evaluateCandidateEligibility's `bulk` parameter). Every read here
    // uses `client` (the connection already checked out for this
    // transaction), never `pool` — using `pool` here would check out a
    // second connection per concurrent Selection Run and self-deadlock the
    // moment concurrent runs reach the pool's connection limit (the
    // concurrency-stress-test finding this correction round fixes).
    const allOfferIds = offers.map((o) => o.offer_id);
    const allManufacturerIds = [...new Set(offers.map((o) => o.manufacturer_id))];
    const bulk = {
      commercialApprovals: await repository.fetchLatestCommercialApprovalsBulk(client, allOfferIds),
      qualifications: await repository.fetchManufacturerQualificationsBulk(client, allManufacturerIds, passportContext.product_category, passportContext.product_subtype),
      certGapCounts: await repository.fetchCertificationGapCountsBulk(client, allManufacturerIds),
    };

    const evaluated = [];
    for (const offer of offers) {
      const { eligible, reasons } = await evaluateCandidateEligibility(client, offer, passportContext, bulk);
      evaluated.push({ offer, eligible, exclusion_reason: eligible ? null : reasons.join('; ') });
    }

    const eligibleOffers = evaluated.filter((e) => e.eligible).map((e) => e.offer);

    if (!eligibleOffers.length) {
      const run = await repository.insertSelectionRun(client, { ...runResultPlaceholder, run_result: 'NO_ELIGIBLE_CANDIDATE', input_versions: { candidates_considered: offers.length } });
      await repository.markPriorRunsStale(client, passportId, run.id);
      for (const e of evaluated) {
        await repository.insertSelectionCandidate(client, { selection_run_id: run.id, offer_id: e.offer.offer_id, offer_revision: e.offer.offer_revision, manufacturer_id: e.offer.manufacturer_id, eligible: false, exclusion_reason: e.exclusion_reason });
        await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_EXCLUDED', entityType: 'SELECTION_CANDIDATE', entityId: run.id, offerId: e.offer.offer_id, manufacturerId: e.offer.manufacturer_id, passportId, actor, eventData: { reason: e.exclusion_reason } });
      }
      await repository.raiseAlert(client, { alert_type: 'NO_ELIGIBLE_MANUFACTURER', severity: 'HIGH', entity_type: 'PASSPORT', entity_id: passportId, passport_id: passportId, alert_data: {} });
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_REVIEW_REQUIRED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { reason: 'NO_ELIGIBLE_CANDIDATE' } });
      await client.query('COMMIT');
      return { run, candidates: [] };
    }

    // Currency check: ranking normalizes raw FOB numbers directly; without an
    // FX-conversion capability (out of scope for v1.0), mixing currencies in
    // one candidate pool would silently rank incommensurable prices. Rather
    // than fake a conversion, this is an honest INSUFFICIENT_DATA run.
    const distinctCurrencies = new Set(eligibleOffers.map((o) => o.currency));
    if (distinctCurrencies.size > 1) {
      const run = await repository.insertSelectionRun(client, { ...runResultPlaceholder, run_result: 'INSUFFICIENT_DATA', input_versions: { candidates_considered: offers.length, eligible: eligibleOffers.length, reason: 'multiple currencies present, no FX conversion capability in v1.0', currencies: [...distinctCurrencies] } });
      await repository.markPriorRunsStale(client, passportId, run.id);
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_REVIEW_REQUIRED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { reason: 'INSUFFICIENT_DATA: mixed currencies' } });
      await client.query('COMMIT');
      return { run, candidates: [] };
    }

    // Factor scoring
    const fobRange = rangeOf(eligibleOffers.map((o) => o.fob_price));
    const leadTimeRange = rangeOf(eligibleOffers.map((o) => o.lead_time_days));
    const capacityRange = rangeOf(eligibleOffers.map((o) => o.monthly_capacity));

    // Bulk-fetch exception counts and Preferred Manufacturer status for the
    // eligible pool — same performance correction as above, applied to
    // scoring's own per-candidate lookups.
    const eligibleOfferIds = eligibleOffers.map((o) => o.offer_id);
    const eligibleManufacturerIds = [...new Set(eligibleOffers.map((o) => o.manufacturer_id))];
    const exceptionCounts = await repository.fetchApprovedExceptionCountsBulk(client, eligibleOfferIds);
    const preferredManufacturerSet = await repository.fetchPreferredManufacturerSetBulk(client, eligibleManufacturerIds);

    // Tie-break step 6, "better diversification versus already-assigned
    // tiers" (MANUFACTURER_SELECTION_ENGINE.md §6): a real, deterministic,
    // order-independent measure derived from the eligible pool itself —
    // never a hardcoded constant (architecture-review correction,
    // 2026-07-14). A candidate whose manufacturer/country is rarer in the
    // eligible pool would diversify the outcome more if selected, so it
    // scores higher; this makes the step a functioning tie-breaker instead
    // of a permanent no-op.
    const mfrCounts = new Map();
    const countryCounts = new Map();
    for (const offer of eligibleOffers) {
      mfrCounts.set(offer.manufacturer_id, (mfrCounts.get(offer.manufacturer_id) || 0) + 1);
      countryCounts.set(offer.country_code, (countryCounts.get(offer.country_code) || 0) + 1);
    }
    const diversificationScoreFor = (offer) => {
      const mfrShare = mfrCounts.get(offer.manufacturer_id) / eligibleOffers.length;
      const countryShare = countryCounts.get(offer.country_code) / eligibleOffers.length;
      return Math.round((1 - (mfrShare + countryShare) / 2) * 100 * 100) / 100;
    };

    const scored = [];
    for (const offer of eligibleOffers) {
      const approvedExceptionCount = exceptionCounts.get(`${offer.offer_id}@${offer.offer_revision}`) || 0;
      const diversificationScore = diversificationScoreFor(offer);
      const factorScores = buildFactorScores(offer, { fobRange, leadTimeRange, capacityRange, approvedExceptionCount, penalties: policy.penalties, diversificationScore });
      const categoryScores = {};
      for (const cat of policyLib.CATEGORIES) {
        const forCat = factorScores.filter((f) => f.factor_category === cat);
        categoryScores[cat] = policyLib.computeCategoryScore(forCat) ?? 0;
      }
      const compositeScorePreBonus = policyLib.computeCompositeScore(categoryScores, policy.weights);
      const isPreferred = preferredManufacturerSet.has(offer.manufacturer_id);
      const { composite_score_final, bonus_applied } = policyLib.applyPreferredManufacturerBonus(compositeScorePreBonus, isPreferred, policy.preferred_manufacturer_bonus);

      scored.push({
        offer, factorScores, categoryScores, compositeScorePreBonus, composite_score_final, bonus_applied,
        technical_quality_score: categoryScores.ENGINEERING,
        fewer_exceptions_score: factorScores.find((f) => f.factor_code === 'ENGINEERING_ELIGIBILITY').normalized_value,
        normalized_fob_score: factorScores.find((f) => f.factor_code === 'FOB_PRICE').normalized_value,
        lead_time_score: factorScores.find((f) => f.factor_code === 'LEAD_TIME_DAYS').normalized_value,
        capacity_score: factorScores.find((f) => f.factor_code === 'MONTHLY_CAPACITY').normalized_value,
        diversification_score: diversificationScore,
        remaining_validity_score: factorScores.find((f) => f.factor_code === 'OFFER_VALIDITY_REMAINING').normalized_value || 0,
      });
    }

    const rankableCandidates = scored.map((s) => ({ ...s, offer_id: s.offer.offer_id, composite_score_final: s.composite_score_final }));
    const { ranked, tied } = ranking.rankCandidates(rankableCandidates);

    const runResult = tied.length ? 'TIE_REQUIRES_HUMAN_REVIEW' : 'RECOMMENDATION_READY';
    const run = await repository.insertSelectionRun(client, { ...runResultPlaceholder, run_result: runResult, input_versions: { candidates_considered: offers.length, eligible: eligibleOffers.length } });
    const { staleRunIds } = await repository.markPriorRunsStale(client, passportId, run.id);
    for (const staleRunId of staleRunIds) {
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_MARKED_STALE', entityType: 'SELECTION_RUN', entityId: staleRunId, passportId, actor, eventData: { superseded_by: run.id } });
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_SUPERSEDED', entityType: 'SELECTION_RUN', entityId: staleRunId, passportId, actor, eventData: { superseded_by: run.id } });
      // A tie or policy conflict on a now-superseded run is resolved by
      // construction — the new run is a fresh, independent computation.
      await phase4Repository.resolveAlerts(client, 'TIE_REQUIRES_REVIEW', 'SELECTION_RUN', staleRunId, 'Selection Run superseded by a new Re-selection');
      await phase4Repository.resolveAlerts(client, 'POLICY_CONFLICT', 'SELECTION_RUN', staleRunId, 'Selection Run superseded by a new Re-selection');
      await phase4Repository.resolveAlerts(client, 'SELECTION_STALE', 'SELECTION_RUN', staleRunId, 'Selection Run superseded by a new Re-selection');
    }

    // Excluded candidates first
    for (const e of evaluated.filter((x) => !x.eligible)) {
      await repository.insertSelectionCandidate(client, { selection_run_id: run.id, offer_id: e.offer.offer_id, offer_revision: e.offer.offer_revision, manufacturer_id: e.offer.manufacturer_id, eligible: false, exclusion_reason: e.exclusion_reason });
      await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_EXCLUDED', entityType: 'SELECTION_CANDIDATE', entityId: run.id, offerId: e.offer.offer_id, manufacturerId: e.offer.manufacturer_id, passportId, actor, eventData: { reason: e.exclusion_reason } });
    }

    // Tier assignment: Primary/Secondary consecutive; Backup per diversification
    // rule. Never assigned on a tie surviving all eight tie-break steps — the
    // engine never guesses; a human breaks it via Manual Override
    // (MANUFACTURER_SELECTION_ENGINE.md §6, "Tie-Break Rules", step 8).
    const tiers = tied.length ? [] : assignTiers(ranked, policy.diversification_rules);

    for (let i = 0; i < ranked.length; i++) {
      const candidateData = ranked[i];
      const tierInfo = tiers.find((t) => t.offer_id === candidateData.offer_id) || { tier: 'NONE', backupDiversificationLimited: false };
      const dbCandidate = await repository.insertSelectionCandidate(client, {
        selection_run_id: run.id, offer_id: candidateData.offer.offer_id, offer_revision: candidateData.offer.offer_revision,
        manufacturer_id: candidateData.offer.manufacturer_id, eligible: true,
        composite_score_pre_bonus: candidateData.compositeScorePreBonus, preferred_bonus_applied: candidateData.bonus_applied,
        composite_score_final: candidateData.composite_score_final, rank_position: i + 1,
        tier: tierInfo.tier, backup_diversification_limited: tierInfo.backupDiversificationLimited,
      });
      for (const fs of candidateData.factorScores) {
        const weight = policy.weights[fs.factor_category] || 0;
        await repository.insertFactorScore(client, {
          selection_candidate_id: dbCandidate.id, factor_code: fs.factor_code, factor_category: fs.factor_category,
          original_value: fs.original_value, unit: fs.unit, source: 'ebp_manufacturer_offers', source_version: String(candidateData.offer.offer_revision),
          normalized_value: fs.normalized_value, weight, weighted_contribution: fs.normalized_value !== null ? Math.round(fs.normalized_value * weight * 100) / 100 : null,
          penalty: fs.penalty || 0, reason_code: fs.reason_code, explanation_params: fs.explanation_params || {},
        });
      }
      await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_CANDIDATE_EVALUATED', entityType: 'SELECTION_CANDIDATE', entityId: dbCandidate.id, offerId: candidateData.offer.offer_id, manufacturerId: candidateData.offer.manufacturer_id, passportId, actor, eventData: { rank_position: i + 1, composite_score_final: candidateData.composite_score_final, tier: tierInfo.tier } });
      if (tierInfo.tier === 'PRIMARY') {
        await activityEvents.emitEvent(client, { eventType: 'PRIMARY_SELECTED', entityType: 'SELECTION_CANDIDATE', entityId: dbCandidate.id, offerId: candidateData.offer.offer_id, manufacturerId: candidateData.offer.manufacturer_id, passportId, actor, eventData: {} });
        await phase4Repository.resolveAlerts(client, 'PRODUCT_WITHOUT_PRIMARY', 'PASSPORT', passportId, 'Primary Manufacturer found in a later Selection Run');
      }
      if (tierInfo.tier === 'SECONDARY') await activityEvents.emitEvent(client, { eventType: 'SECONDARY_SELECTED', entityType: 'SELECTION_CANDIDATE', entityId: dbCandidate.id, offerId: candidateData.offer.offer_id, manufacturerId: candidateData.offer.manufacturer_id, passportId, actor, eventData: {} });
      if (tierInfo.tier === 'BACKUP') {
        await activityEvents.emitEvent(client, { eventType: 'BACKUP_SELECTED', entityType: 'SELECTION_CANDIDATE', entityId: dbCandidate.id, offerId: candidateData.offer.offer_id, manufacturerId: candidateData.offer.manufacturer_id, passportId, actor, eventData: { backup_diversification_limited: tierInfo.backupDiversificationLimited } });
        await phase4Repository.resolveAlerts(client, 'PRODUCT_WITHOUT_BACKUP', 'PASSPORT', passportId, 'Backup Manufacturer found in a later Selection Run');
        if (tierInfo.backupDiversificationLimited) {
          await repository.raiseAlert(client, { alert_type: 'BACKUP_DIVERSIFICATION_LIMITED', severity: 'LOW', entity_type: 'SELECTION_RUN', entity_id: run.id, passport_id: passportId, alert_data: {} });
        }
      }
    }
    if (!tied.length) {
      await phase4Repository.resolveAlerts(client, 'NO_ELIGIBLE_MANUFACTURER', 'PASSPORT', passportId, 'Eligible Manufacturer(s) found in a later Selection Run');
    }

    if (!tiers.some((t) => t.tier === 'PRIMARY')) {
      await repository.raiseAlert(client, { alert_type: 'PRODUCT_WITHOUT_PRIMARY', severity: 'HIGH', entity_type: 'PASSPORT', entity_id: passportId, passport_id: passportId, alert_data: {} });
    }
    if (!tiers.some((t) => t.tier === 'BACKUP')) {
      await repository.raiseAlert(client, { alert_type: 'PRODUCT_WITHOUT_BACKUP', severity: 'MEDIUM', entity_type: 'PASSPORT', entity_id: passportId, passport_id: passportId, alert_data: {} });
    }

    await activityEvents.emitEvent(client, { eventType: 'MANUFACTURER_RECOMMENDED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { run_result: runResult } });

    const decision = await repository.insertSelectionDecision(client, { selection_run_id: run.id });

    if (runResult === 'TIE_REQUIRES_HUMAN_REVIEW') {
      await repository.raiseAlert(client, { alert_type: 'TIE_REQUIRES_REVIEW', severity: 'MEDIUM', entity_type: 'SELECTION_RUN', entity_id: run.id, passport_id: passportId, alert_data: { tied } });
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_REVIEW_REQUIRED', entityType: 'SELECTION_RUN', entityId: run.id, passportId, actor, eventData: { reason: 'TIE_REQUIRES_HUMAN_REVIEW' } });
    }

    await client.query('COMMIT');
    return { run, decision, candidates: await repository.fetchCandidatesForRun(pool, run.id) };
  } catch (e) {
    await client.query('ROLLBACK');
    // Concurrency stress-test finding (architecture review): two Selection
    // Runs fired concurrently for the same Passport can both compute the
    // same "next version" before either commits — data integrity is never
    // at risk (the UNIQUE(passport_id, selection_version) constraint lets
    // only one insert win), but the loser must see a clean, expected
    // conflict, never a raw Postgres constraint-violation error.
    if (e.code === '23505' && String(e.constraint || '').includes('selection_version')) {
      throw new ConflictError('a concurrent Selection Run for this Passport already completed — retry');
    }
    throw e;
  } finally {
    client.release();
  }
}

// assignTiers: Primary/Secondary are consecutive rank positions. Backup
// diverges per the policy's diversification rules (Decision 04, ADR-0065)
// — prefers a candidate whose country_code differs from Primary/Secondary
// among the remaining ranked pool; falls back to strict rank order if none
// qualifies, marking backupDiversificationLimited.
function assignTiers(ranked, diversificationRules) {
  const tiers = [];
  if (!ranked.length) return tiers;

  const primary = ranked[0];
  tiers.push({ offer_id: primary.offer_id, tier: 'PRIMARY', backupDiversificationLimited: false });

  const secondary = ranked[1];
  if (secondary) tiers.push({ offer_id: secondary.offer_id, tier: 'SECONDARY', backupDiversificationLimited: false });

  const remaining = ranked.slice(2);
  if (remaining.length) {
    const usedCountries = new Set([primary.offer.country_code, secondary ? secondary.offer.country_code : null].filter(Boolean));
    const diversified = remaining.find((c) => !usedCountries.has(c.offer.country_code));
    if (diversified) {
      tiers.push({ offer_id: diversified.offer_id, tier: 'BACKUP', backupDiversificationLimited: false });
    } else {
      tiers.push({ offer_id: remaining[0].offer_id, tier: 'BACKUP', backupDiversificationLimited: true });
    }
  }

  return tiers;
}

// ─── Selection Decision (human act) ─────────────────────────────────────────

async function recordSelectionDecision(pool, selectionRunId, decisionValue, notes, actor) {
  if (!['APPROVED', 'REJECTED'].includes(decisionValue)) {
    throw new ValidationError(['decision must be APPROVED or REJECTED']);
  }
  await requireRole(pool, actor, 'SELECTION_APPROVER');
  const decision = await repository.fetchSelectionDecisionByRun(pool, selectionRunId);
  if (!decision) throw new NotFoundError(`no Selection Decision for run ${selectionRunId}`);
  if (decision.status !== 'PENDING_REVIEW') throw new ConflictError(`decision is ${decision.status}, not PENDING_REVIEW`);

  const candidates = await repository.fetchCandidatesForRun(pool, selectionRunId);
  const primary = candidates.find((c) => c.tier === 'PRIMARY');
  const secondary = candidates.find((c) => c.tier === 'SECONDARY');
  const backup = candidates.find((c) => c.tier === 'BACKUP');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await repository.updateSelectionDecisionStatus(client, decision.id, decisionValue, actor.declared_actor, notes, {
      primary: decisionValue === 'APPROVED' ? primary?.offer_id : null,
      secondary: decisionValue === 'APPROVED' ? secondary?.offer_id : null,
      backup: decisionValue === 'APPROVED' ? backup?.offer_id : null,
    });
    await activityEvents.emitEvent(client, { eventType: 'SELECTION_DECISION_RECORDED', entityType: 'SELECTION_DECISION', entityId: decision.id, actor, eventData: { status: decisionValue } });
    await client.query('COMMIT');
    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ─── Manual Override (Decisions 05/06, ADR-0066/ADR-0067) ──────────────────

async function requestOverride(pool, selectionRunId, tier, requestedOfferId, reason, actor) {
  await requireRole(pool, actor, 'SELECTION_APPROVER');
  const decision = await repository.fetchSelectionDecisionByRun(pool, selectionRunId);
  if (!decision) throw new NotFoundError(`no Selection Decision for run ${selectionRunId}`);
  const candidates = await repository.fetchCandidatesForRun(pool, selectionRunId);
  const engineTierCandidate = candidates.find((c) => c.tier === tier);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const override = await repository.insertSelectionOverride(client, {
      selection_run_id: selectionRunId, selection_decision_id: decision.id, tier,
      engine_recommended_offer_id: engineTierCandidate?.offer_id, engine_recommended_score: engineTierCandidate?.composite_score_final,
      requested_offer_id: requestedOfferId, requested_by: actor.declared_actor, reason,
    });
    await activityEvents.emitEvent(client, { eventType: 'MANUAL_SELECTION_OVERRIDE_REQUESTED', entityType: 'SELECTION_OVERRIDE', entityId: override.id, actor, eventData: { tier, requested_offer_id: requestedOfferId } });
    await client.query('COMMIT');
    return override;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function decideOverride(pool, overrideId, decisionValue, decisionNotes, actor) {
  if (!['APPROVED', 'REJECTED'].includes(decisionValue)) throw new ValidationError(['decision must be APPROVED or REJECTED']);
  await requireRole(pool, actor, 'ADMIN_OWNER');
  const override = await repository.fetchOverrideById(pool, overrideId);
  if (!override) throw new NotFoundError(`override ${overrideId} not found`);
  if (override.status !== 'REQUESTED') throw new ConflictError(`override is ${override.status}, not REQUESTED`);
  if (override.requested_by === actor.declared_actor) {
    throw new ConflictError('the same declared actor cannot both request and decide a Manual Override (Decision 05, ADR-0066)');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await repository.updateOverrideStatus(client, overrideId, decisionValue, actor.declared_actor, decisionNotes);
    if (decisionValue === 'APPROVED') {
      await repository.updateSelectionDecisionStatus(client, override.selection_decision_id, 'OVERRIDDEN', actor.declared_actor, decisionNotes, {
        primary: override.tier === 'PRIMARY' ? override.requested_offer_id : null,
        secondary: override.tier === 'SECONDARY' ? override.requested_offer_id : null,
        backup: override.tier === 'BACKUP' ? override.requested_offer_id : null,
      });
    }
    await activityEvents.emitEvent(client, {
      eventType: decisionValue === 'APPROVED' ? 'MANUAL_SELECTION_OVERRIDE_APPROVED' : 'MANUAL_SELECTION_OVERRIDE_REJECTED',
      entityType: 'SELECTION_OVERRIDE', entityId: override.id, actor, eventData: { tier: override.tier },
    });
    await client.query('COMMIT');
    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ─── Role administration + permanent bootstrap (mirrors Phase 4 Decision 01/ADR-0039, ADR-0059) ───

async function assignRoleService(pool, declaredActor, role, actor) {
  if (!['SELECTION_REVIEWER', 'SELECTION_APPROVER', 'COMMERCIAL_APPROVER', 'ADMIN_OWNER'].includes(role)) {
    throw new ValidationError(['role must be one of SELECTION_REVIEWER, SELECTION_APPROVER, COMMERCIAL_APPROVER, ADMIN_OWNER']);
  }
  const alreadyBootstrapped = await repository.hasBootstrapped(pool);

  if (!alreadyBootstrapped && role === 'ADMIN_OWNER') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await repository.insertBootstrapRecord(client, actor.declared_actor);
      const row = await repository.assignRole(client, declaredActor, role, actor.declared_actor);
      await activityEvents.emitEvent(client, { eventType: 'SELECTION_ADMIN_OWNER_BOOTSTRAPPED', entityType: 'SELECTION_ROLE_ASSIGNMENT', entityId: row.id, actor, eventData: { declared_actor: declaredActor } });
      await client.query('COMMIT');
      return row;
    } catch (e) {
      await client.query('ROLLBACK');
      if (String(e.message).includes('duplicate key') || e.code === '23505') {
        throw new ConflictError('ADMIN_OWNER bootstrap was already completed by a concurrent request — use an existing ADMIN_OWNER to assign further roles');
      }
      throw e;
    } finally {
      client.release();
    }
  }

  await requireRole(pool, actor, 'ADMIN_OWNER');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const row = await repository.assignRole(client, declaredActor, role, actor.declared_actor);
    await activityEvents.emitEvent(client, { eventType: 'SELECTION_ROLE_ASSIGNED', entityType: 'SELECTION_ROLE_ASSIGNMENT', entityId: row.id, actor, eventData: { declared_actor: declaredActor, role } });
    await client.query('COMMIT');
    return row;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function revokeRoleService(pool, declaredActor, role, actor) {
  await requireRole(pool, actor, 'ADMIN_OWNER');
  return repository.revokeRole(pool, declaredActor, role, actor.declared_actor);
}

// ─── Alert Layer (reuses Phase 4's ebp_alerts table and repository
// functions directly — never a duplicated Alert Layer, ADR-0037) ───────────

async function listAlerts(pool, filters) {
  return phase4Repository.fetchAlerts(pool, filters);
}

async function acknowledgeAlert(pool, id) {
  return phase4Repository.updateAlertStatus(pool, id, 'ACKNOWLEDGED', null);
}

async function dismissAlert(pool, id, reason) {
  return phase4Repository.updateAlertStatus(pool, id, 'DISMISSED', reason);
}

// scanTimeBasedAlerts: the on-demand equivalent of a scheduled sweep, same
// "no cron required, compute at read/explicit-trigger time" discipline as
// Phase 4's own time-based alert scan (ADR-0031/ADR-0057). Raises
// PRIMARY_OFFER_EXPIRING for an approved Primary whose Offer is within 14
// days of expiring, and PRIMARY_MANUFACTURER_SUSPENDED for an approved
// Primary whose Manufacturer has since become SUSPENDED.
async function scanTimeBasedAlerts(pool) {
  const { rows } = await pool.query(
    `SELECT sd.id AS decision_id, sr.passport_id, sd.approved_primary_offer_id,
            o.expires_at, o.offer_validity_until, m.status AS manufacturer_status, m.id AS manufacturer_id
     FROM ebp_selection_decisions sd
     JOIN ebp_selection_runs sr ON sr.id = sd.selection_run_id
     JOIN ebp_manufacturer_offers o ON o.id = sd.approved_primary_offer_id
     JOIN ebp_manufacturers m ON m.id = o.manufacturer_id
     WHERE sd.status IN ('APPROVED', 'OVERRIDDEN') AND sr.run_result <> 'STALE'`
  );
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const expiry = row.offer_validity_until || row.expires_at;
      if (expiry) {
        const daysRemaining = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 14) {
          await repository.raiseAlert(client, { alert_type: 'PRIMARY_OFFER_EXPIRING', severity: daysRemaining <= 0 ? 'CRITICAL' : 'MEDIUM', entity_type: 'PASSPORT', entity_id: row.passport_id, passport_id: row.passport_id, offer_id: row.approved_primary_offer_id, alert_data: { days_remaining: daysRemaining } });
        }
      }
      if (row.manufacturer_status === 'SUSPENDED') {
        await repository.raiseAlert(client, { alert_type: 'PRIMARY_MANUFACTURER_SUSPENDED', severity: 'CRITICAL', entity_type: 'PASSPORT', entity_id: row.passport_id, passport_id: row.passport_id, manufacturer_id: row.manufacturer_id, alert_data: {} });
      }
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return { scanned: rows.length };
}

module.exports = {
  ValidationError, NotFoundError, ConflictError, UnauthorizedError,
  requireRole,
  recordCommercialApproval,
  createSelectionPolicy,
  publishSelectionPolicy,
  ensureDefaultPolicy,
  resolveMostSpecificPolicy,
  createPreferredManufacturer,
  declareDemandSignal,
  evaluateCandidateEligibility,
  runSelection,
  assignTiers,
  recordSelectionDecision,
  requestOverride,
  decideOverride,
  assignRole: assignRoleService,
  revokeRole: revokeRoleService,
  listAlerts,
  acknowledgeAlert,
  dismissAlert,
  scanTimeBasedAlerts,
};
