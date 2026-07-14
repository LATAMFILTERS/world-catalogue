'use strict';

// EBP Phase 5 — data access layer. Reads Phase 1/2/3/4 tables read-only;
// writes only to Phase 5's own tables plus the shared ebp_activity_events/
// ebp_alerts tables (both introduced by Phase 4, reused unmodified).

async function fetchPassportContext(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT p.id AS passport_id, p.product_category, p.product_subtype, p.duty,
            p.technology_code, p.engineering_revision
     FROM ebp_engineering_passports p
     WHERE p.id = $1`,
    [passportId]
  );
  return rows[0] || null;
}

// fetchCandidateOffers: every current-active-revision Offer for this
// Passport (any manufacturer), regardless of eligibility — exclusion is
// decided by the caller from the seven-part gate, never filtered out
// here (Selection must retain the full pool, MANUFACTURER_SELECTION_
// ENGINE.md §6).
async function fetchCandidateOffers(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT o.id AS offer_id, o.offer_code, o.offer_revision, o.manufacturer_id,
            o.passport_id, o.engineering_revision, o.status AS offer_status,
            o.expires_at, o.offer_validity_until, o.fob_price, o.moq,
            o.tooling_cost, o.sample_cost, o.lead_time_days, o.monthly_capacity,
            m.status AS manufacturer_status, m.country_code, m.legal_name
     FROM ebp_manufacturer_offers o
     JOIN ebp_manufacturers m ON m.id = o.manufacturer_id
     WHERE o.passport_id = $1
       AND o.status NOT IN ('SUPERSEDED', 'WITHDRAWN', 'REJECTED', 'DRAFT')`,
    [passportId]
  );
  return rows;
}

async function fetchManufacturerQualification(pool, manufacturerId, productCategory, productSubtype) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_qualifications
     WHERE manufacturer_id = $1 AND product_category = $2 AND product_subtype = $3
     ORDER BY updated_at DESC LIMIT 1`,
    [manufacturerId, productCategory, productSubtype]
  );
  return rows[0] || null;
}

// fetchCertificationGapForManufacturer: no Phase 2 table declares an
// explicit "required certifications per family" list, so eligibility
// treats every certification the manufacturer has ever declared as
// required for its own continued validity — any EXPIRED/REVOKED/REJECTED
// row blocks eligibility (§4, point 7). See phase-05-manufacturer-
// selection.md dependency note.
async function fetchCertificationGapForManufacturer(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_certifications
     WHERE manufacturer_id = $1
       AND (status IN ('EXPIRED', 'REVOKED', 'REJECTED') OR (expires_on IS NOT NULL AND expires_on < CURRENT_DATE))`,
    [manufacturerId]
  );
  return rows;
}

async function fetchLatestCommercialApproval(pool, offerId, offerRevision) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_offer_commercial_approvals
     WHERE offer_id = $1 AND offer_revision = $2
     ORDER BY decided_at DESC LIMIT 1`,
    [offerId, offerRevision]
  );
  return rows[0] || null;
}

async function insertCommercialApproval(client, approval) {
  const { rows } = await client.query(
    `INSERT INTO ebp_offer_commercial_approvals
       (offer_id, offer_revision, status, elimfilters_approved_quantity,
        final_approved_packaging, deviation_decision, decided_by, reason, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      approval.offer_id, approval.offer_revision, approval.status,
      approval.elimfilters_approved_quantity || null,
      approval.final_approved_packaging ? JSON.stringify(approval.final_approved_packaging) : null,
      approval.deviation_decision ? JSON.stringify(approval.deviation_decision) : null,
      approval.decided_by, approval.reason || null, approval.notes || null,
    ]
  );
  return rows[0];
}

async function fetchActiveSelectionPolicies(pool, context) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_selection_policies WHERE status = 'ACTIVE'
     AND (
       scope_type = 'PLATFORM'
       OR (scope_type = 'CATEGORY' AND scope_value = $1)
       OR (scope_type = 'SUBTYPE' AND scope_value = $2)
       OR (scope_type = 'DUTY' AND scope_value = $3)
       OR (scope_type = 'TECHNOLOGY' AND scope_value = $4)
     )`,
    [context.product_category, context.product_subtype, context.duty, context.technology_code]
  );
  return rows;
}

async function insertSelectionPolicy(client, policy) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_policies
       (policy_code, policy_version, name, description, scope_type, scope_value,
        weights, criteria, normalization, gates, penalties, diversification_rules,
        concentration_thresholds, preferred_manufacturer_bonus, effective_from, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      policy.policy_code, policy.policy_version, policy.name, policy.description || null,
      policy.scope_type, policy.scope_value || null,
      JSON.stringify(policy.weights), JSON.stringify(policy.criteria || {}),
      JSON.stringify(policy.normalization || {}), JSON.stringify(policy.gates || {}),
      JSON.stringify(policy.penalties || {}), JSON.stringify(policy.diversification_rules || {}),
      JSON.stringify(policy.concentration_thresholds || {}), JSON.stringify(policy.preferred_manufacturer_bonus || {}),
      policy.effective_from || null, policy.status || 'DRAFT', policy.created_by,
    ]
  );
  return rows[0];
}

async function fetchNextPolicyVersion(pool, policyCode) {
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(policy_version), 0) + 1 AS next_version FROM ebp_selection_policies WHERE policy_code = $1`,
    [policyCode]
  );
  return rows[0].next_version;
}

async function publishSelectionPolicy(client, policyId) {
  const { rows } = await client.query(`SELECT * FROM ebp_selection_policies WHERE id = $1`, [policyId]);
  const policy = rows[0];
  if (!policy) return null;
  await client.query(
    `UPDATE ebp_selection_policies SET status = 'SUPERSEDED', updated_at = NOW()
     WHERE scope_type = $1 AND COALESCE(scope_value, '') = COALESCE($2, '') AND status = 'ACTIVE' AND id <> $3`,
    [policy.scope_type, policy.scope_value, policyId]
  );
  const { rows: updated } = await client.query(
    `UPDATE ebp_selection_policies SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [policyId]
  );
  return updated[0];
}

async function fetchPreferredManufacturers(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_preferred_manufacturers
     WHERE manufacturer_id = $1 AND status = 'ACTIVE'
       AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until > NOW())`,
    [manufacturerId]
  );
  return rows;
}

async function insertPreferredManufacturer(client, pref) {
  const { rows } = await client.query(
    `INSERT INTO ebp_preferred_manufacturers
       (manufacturer_id, scope_type, scope_value, reason, valid_from, valid_until, created_by, approved_by)
     VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6, $7, $8) RETURNING *`,
    [pref.manufacturer_id, pref.scope_type, pref.scope_value, pref.reason, pref.valid_from || null, pref.valid_until || null, pref.created_by, pref.approved_by]
  );
  return rows[0];
}

async function insertDemandSignal(client, demand) {
  const { rows } = await client.query(
    `INSERT INTO ebp_demand_signals
       (passport_id, signal_type, estimated_quantity, period, unit, source, confidence, declared_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [demand.passport_id, demand.signal_type, demand.estimated_quantity || null, demand.period || null, demand.unit || null, demand.source || null, demand.confidence || null, demand.declared_by]
  );
  return rows[0];
}

async function fetchLatestDemandSignal(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_demand_signals WHERE passport_id = $1 ORDER BY declared_at DESC LIMIT 1`,
    [passportId]
  );
  return rows[0] || null;
}

async function fetchCurrentSelectionRun(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_selection_runs WHERE passport_id = $1 AND run_result <> 'STALE'
     ORDER BY selection_version DESC LIMIT 1`,
    [passportId]
  );
  return rows[0] || null;
}

async function fetchSelectionRunHistory(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_selection_runs WHERE passport_id = $1 ORDER BY selection_version DESC`,
    [passportId]
  );
  return rows;
}

async function fetchNextSelectionVersion(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(selection_version), 0) + 1 AS next_version FROM ebp_selection_runs WHERE passport_id = $1`,
    [passportId]
  );
  return rows[0].next_version;
}

async function markPriorRunsStale(client, passportId, newRunId) {
  await client.query(
    `UPDATE ebp_selection_runs SET run_result = 'STALE', superseded_by = $2
     WHERE passport_id = $1 AND id <> $2 AND run_result <> 'STALE'`,
    [passportId, newRunId]
  );
  await client.query(
    `UPDATE ebp_selection_decisions SET status = 'SUPERSEDED', updated_at = NOW()
     WHERE selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE passport_id = $1 AND id <> $2)
       AND status NOT IN ('SUPERSEDED', 'REJECTED')`,
    [passportId, newRunId]
  );
}

async function insertSelectionRun(client, run) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_runs
       (passport_id, engineering_revision, selection_version, selection_policy_id,
        demand_signal_id, demand_not_provided, run_result, trigger, triggered_by, input_versions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      run.passport_id, run.engineering_revision, run.selection_version, run.selection_policy_id,
      run.demand_signal_id || null, run.demand_not_provided, run.run_result, run.trigger,
      run.triggered_by, JSON.stringify(run.input_versions || {}),
    ]
  );
  return rows[0];
}

async function insertSelectionCandidate(client, candidate) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_candidates
       (selection_run_id, offer_id, offer_revision, manufacturer_id, eligible, exclusion_reason,
        composite_score_pre_bonus, preferred_bonus_applied, composite_score_final, rank_position,
        tier, backup_diversification_limited)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      candidate.selection_run_id, candidate.offer_id, candidate.offer_revision, candidate.manufacturer_id,
      candidate.eligible, candidate.exclusion_reason || null,
      candidate.composite_score_pre_bonus ?? null, candidate.preferred_bonus_applied || 0,
      candidate.composite_score_final ?? null, candidate.rank_position ?? null,
      candidate.tier || 'NONE', candidate.backup_diversification_limited || false,
    ]
  );
  return rows[0];
}

async function insertFactorScore(client, score) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_factor_scores
       (selection_candidate_id, factor_code, factor_category, original_value, unit, source,
        source_version, normalized_value, weight, weighted_contribution, penalty, gate_applied,
        status, reason_code, explanation_params, evidence_reference)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
    [
      score.selection_candidate_id, score.factor_code, score.factor_category,
      score.original_value !== undefined ? JSON.stringify(score.original_value) : null,
      score.unit || null, score.source || null, score.source_version || null,
      score.normalized_value ?? null, score.weight ?? null, score.weighted_contribution ?? null,
      score.penalty || 0, score.gate_applied || null, score.status || null, score.reason_code,
      JSON.stringify(score.explanation_params || {}), score.evidence_reference || null,
    ]
  );
  return rows[0];
}

async function fetchCandidatesForRun(pool, selectionRunId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_selection_candidates WHERE selection_run_id = $1 ORDER BY rank_position NULLS LAST`,
    [selectionRunId]
  );
  return rows;
}

async function fetchFactorScoresForCandidate(pool, candidateId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_selection_factor_scores WHERE selection_candidate_id = $1 ORDER BY factor_category, factor_code`,
    [candidateId]
  );
  return rows;
}

async function insertSelectionDecision(client, decision) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_decisions (selection_run_id, status)
     VALUES ($1, 'PENDING_REVIEW') RETURNING *`,
    [decision.selection_run_id]
  );
  return rows[0];
}

async function fetchSelectionDecisionByRun(pool, selectionRunId) {
  const { rows } = await pool.query(`SELECT * FROM ebp_selection_decisions WHERE selection_run_id = $1`, [selectionRunId]);
  return rows[0] || null;
}

async function fetchSelectionDecisionById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_selection_decisions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function updateSelectionDecisionStatus(client, id, status, decidedBy, notes, approvedOffers = {}) {
  const { rows } = await client.query(
    `UPDATE ebp_selection_decisions
     SET status = $2, decided_by = $3, decided_at = NOW(), notes = $4,
         approved_primary_offer_id = COALESCE($5, approved_primary_offer_id),
         approved_secondary_offer_id = COALESCE($6, approved_secondary_offer_id),
         approved_backup_offer_id = COALESCE($7, approved_backup_offer_id),
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status, decidedBy, notes || null, approvedOffers.primary || null, approvedOffers.secondary || null, approvedOffers.backup || null]
  );
  return rows[0];
}

async function insertSelectionOverride(client, override) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_overrides
       (selection_run_id, selection_decision_id, tier, engine_recommended_offer_id,
        engine_recommended_score, requested_offer_id, requested_by, reason, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'REQUESTED') RETURNING *`,
    [
      override.selection_run_id, override.selection_decision_id, override.tier,
      override.engine_recommended_offer_id || null, override.engine_recommended_score ?? null,
      override.requested_offer_id, override.requested_by, override.reason,
    ]
  );
  return rows[0];
}

async function fetchOverrideById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_selection_overrides WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function updateOverrideStatus(client, id, status, decidedBy, decisionNotes) {
  const { rows } = await client.query(
    `UPDATE ebp_selection_overrides SET status = $2, decided_by = $3, decided_at = NOW(), decision_notes = $4
     WHERE id = $1 RETURNING *`,
    [id, status, decidedBy, decisionNotes || null]
  );
  return rows[0];
}

// ─── Functional roles (Decision 05, ADR-0066) — own table, own bootstrap ───

async function assignRole(client, declaredActor, role, assignedBy) {
  const { rows } = await client.query(
    `INSERT INTO ebp_selection_role_assignments (declared_actor, role, assigned_by)
     VALUES ($1, $2, $3) ON CONFLICT (declared_actor, role) DO UPDATE SET revoked_at = NULL, revoked_by = NULL, assigned_by = $3, assigned_at = NOW()
     RETURNING *`,
    [declaredActor, role, assignedBy]
  );
  return rows[0];
}

async function revokeRole(client, declaredActor, role, revokedBy) {
  const { rows } = await client.query(
    `UPDATE ebp_selection_role_assignments SET revoked_at = NOW(), revoked_by = $3
     WHERE declared_actor = $1 AND role = $2 AND revoked_at IS NULL RETURNING *`,
    [declaredActor, role, revokedBy]
  );
  return rows[0] || null;
}

async function actorHasRole(pool, declaredActor, role) {
  const { rows } = await pool.query(
    `SELECT 1 FROM ebp_selection_role_assignments WHERE declared_actor = $1 AND role = $2 AND revoked_at IS NULL`,
    [declaredActor, role]
  );
  return rows.length > 0;
}

async function hasBootstrapped(pool) {
  const { rows } = await pool.query(`SELECT 1 FROM ebp_selection_admin_bootstrap WHERE id = TRUE`);
  return rows.length > 0;
}

async function insertBootstrapRecord(client, actorLabel) {
  await client.query(
    `INSERT INTO ebp_selection_admin_bootstrap (id, bootstrapped_actor) VALUES (TRUE, $1)`,
    [actorLabel]
  );
}

// ─── Alerts (shared ebp_alerts table, introduced by Phase 4, ADR-0057) ─────

async function raiseAlert(client, alert) {
  const { rows } = await client.query(
    `INSERT INTO ebp_alerts (alert_type, severity, entity_type, entity_id, manufacturer_id, passport_id, offer_id, alert_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (alert_type, entity_type, entity_id) WHERE status IN ('OPEN', 'ACKNOWLEDGED') DO NOTHING
     RETURNING *`,
    [alert.alert_type, alert.severity, alert.entity_type, alert.entity_id, alert.manufacturer_id || null, alert.passport_id || null, alert.offer_id || null, JSON.stringify(alert.alert_data || {})]
  );
  return rows[0] || null;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

async function fetchSelectionOverview(pool) {
  const { rows } = await pool.query(`SELECT run_result, COUNT(*) AS count FROM ebp_analytics_selection_summary GROUP BY run_result`);
  return rows;
}

async function fetchManufacturerShareForConcentration(pool) {
  const { rows } = await pool.query(
    `SELECT manufacturer_id, COUNT(*) AS sku_count
     FROM ebp_selection_candidates
     WHERE tier = 'PRIMARY' AND selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE run_result <> 'STALE')
     GROUP BY manufacturer_id`
  );
  return rows;
}

async function fetchCountryShareForConcentration(pool) {
  const { rows } = await pool.query(
    `SELECT m.country_code, COUNT(*) AS sku_count
     FROM ebp_selection_candidates c
     JOIN ebp_manufacturers m ON m.id = c.manufacturer_id
     WHERE c.tier = 'PRIMARY' AND c.selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE run_result <> 'STALE')
     GROUP BY m.country_code`
  );
  return rows;
}

module.exports = {
  fetchPassportContext,
  fetchCandidateOffers,
  fetchManufacturerQualification,
  fetchCertificationGapForManufacturer,
  fetchLatestCommercialApproval,
  insertCommercialApproval,
  fetchActiveSelectionPolicies,
  insertSelectionPolicy,
  fetchNextPolicyVersion,
  publishSelectionPolicy,
  fetchPreferredManufacturers,
  insertPreferredManufacturer,
  insertDemandSignal,
  fetchLatestDemandSignal,
  fetchCurrentSelectionRun,
  fetchSelectionRunHistory,
  fetchNextSelectionVersion,
  markPriorRunsStale,
  insertSelectionRun,
  insertSelectionCandidate,
  insertFactorScore,
  fetchCandidatesForRun,
  fetchFactorScoresForCandidate,
  insertSelectionDecision,
  fetchSelectionDecisionByRun,
  fetchSelectionDecisionById,
  updateSelectionDecisionStatus,
  insertSelectionOverride,
  fetchOverrideById,
  updateOverrideStatus,
  assignRole,
  revokeRole,
  actorHasRole,
  hasBootstrapped,
  insertBootstrapRecord,
  raiseAlert,
  fetchSelectionOverview,
  fetchManufacturerShareForConcentration,
  fetchCountryShareForConcentration,
};
