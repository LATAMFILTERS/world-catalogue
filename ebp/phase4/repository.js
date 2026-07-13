'use strict';

// EBP Phase 4 — database access. Every function takes a `pool` (read
// paths) or `client` (writes that must participate in a caller-managed
// transaction) so this module never manages its own connection lifecycle,
// matching every other phase in this codebase.

// ─── Rule Catalog (Decision 10, ADR-0048) ───────────────────────────────────

async function fetchActiveRuleVersions(pool) {
  const { rows } = await pool.query(`SELECT * FROM ebp_rule_versions WHERE status = 'ACTIVE' ORDER BY rule_id`);
  return rows;
}

async function fetchRuleVersion(pool, ruleId, ruleVersion) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_rule_versions WHERE rule_id = $1 AND rule_version = $2`,
    [ruleId, ruleVersion]
  );
  return rows[0] || null;
}

async function fetchRuleVersionsByRuleId(pool, ruleId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_rule_versions WHERE rule_id = $1 ORDER BY rule_version ASC`,
    [ruleId]
  );
  return rows;
}

async function fetchActiveRuleVersionForRuleId(client, ruleId) {
  const { rows } = await client.query(
    `SELECT * FROM ebp_rule_versions WHERE rule_id = $1 AND status = 'ACTIVE'`,
    [ruleId]
  );
  return rows[0] || null;
}

async function insertRuleVersion(client, rule) {
  const { rows } = await client.query(
    `INSERT INTO ebp_rule_versions
       (rule_id, rule_version, rule_name, description, comparison_type, severity,
        exception_policy, category, applies_to, rule_applicability, default_behavior,
        operands, observation_overrides, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      rule.rule_id,
      rule.rule_version,
      rule.rule_name,
      rule.description,
      rule.comparison_type,
      rule.severity,
      rule.exception_policy || 'NON_WAIVABLE',
      rule.category,
      JSON.stringify(rule.applies_to || {}),
      JSON.stringify(rule.rule_applicability || {}),
      JSON.stringify(rule.default_behavior || {}),
      rule.operands ? JSON.stringify(rule.operands) : null,
      rule.observation_overrides ? JSON.stringify(rule.observation_overrides) : null,
      rule.status || 'DRAFT',
      rule.created_by,
    ]
  );
  return rows[0].id;
}

async function publishRuleVersion(client, ruleId, ruleVersion) {
  await client.query(
    `UPDATE ebp_rule_versions SET status = 'ACTIVE', effective_from = NOW()
     WHERE rule_id = $1 AND rule_version = $2`,
    [ruleId, ruleVersion]
  );
}

async function supersedeRuleVersion(client, ruleId, exceptRuleVersion) {
  await client.query(
    `UPDATE ebp_rule_versions SET status = 'SUPERSEDED', effective_until = NOW()
     WHERE rule_id = $1 AND status = 'ACTIVE' AND rule_version != $2`,
    [ruleId, exceptRuleVersion]
  );
}

async function retireRuleVersion(client, ruleId, ruleVersion) {
  await client.query(
    `UPDATE ebp_rule_versions SET status = 'RETIRED', effective_until = NOW()
     WHERE rule_id = $1 AND rule_version = $2`,
    [ruleId, ruleVersion]
  );
}

async function fetchOfferByCode(pool, offerCode) {
  const { rows } = await pool.query(
    `SELECT id, offer_code, offer_revision FROM ebp_manufacturer_offers WHERE offer_code = $1`,
    [offerCode]
  );
  return rows[0] || null;
}

// ─── Offer context assembly (input to the Rule Engine) ─────────────────────

async function fetchOfferContext(pool, offerId) {
  const { rows } = await pool.query(
    `SELECT o.id AS offer_id, o.offer_code, o.offer_revision, o.manufacturer_id,
            o.passport_id, o.engineering_revision, o.status AS offer_status,
            o.expires_at AS offer_expires_at,
            p.product_category, p.product_subtype, p.duty, p.technology_code,
            row_to_json(pe.*) AS passport_spec
     FROM ebp_manufacturer_offers o
     JOIN ebp_engineering_passports p ON p.id = o.passport_id
     LEFT JOIN ebp_passport_engineering pe ON pe.passport_id = o.passport_id
     WHERE o.id = $1`,
    [offerId]
  );
  if (!rows[0]) return null;

  const { rows: fieldRows } = await pool.query(
    `SELECT field_name, offered_value, evidence_document_id, completeness_status
     FROM ebp_manufacturer_offer_technical_fields WHERE offer_id = $1`,
    [offerId]
  );
  const offeredFields = {};
  for (const f of fieldRows) {
    offeredFields[f.field_name] = {
      offered_value: f.offered_value,
      evidence_document_id: f.evidence_document_id,
      completeness_status: f.completeness_status,
    };
  }

  const row = rows[0];
  return {
    offer_id: row.offer_id,
    offer_code: row.offer_code,
    offer_revision: row.offer_revision,
    manufacturer_id: row.manufacturer_id,
    passport_id: row.passport_id,
    engineering_revision: row.engineering_revision,
    offer_status: row.offer_status,
    offer_expires_at: row.offer_expires_at,
    product_category: row.product_category,
    product_subtype: row.product_subtype,
    duty: row.duty,
    technology_code: row.technology_code,
    passportSpec: row.passport_spec || {},
    offeredFields,
  };
}

// ─── Validation Runs (Decision 12, ADR-0050) ────────────────────────────────

async function fetchCurrentValidationRun(pool, offerId, offerRevision) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_validation_runs WHERE offer_id = $1 AND offer_revision = $2 AND status = 'CURRENT'`,
    [offerId, offerRevision]
  );
  return rows[0] || null;
}

async function fetchValidationRunById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_validation_runs WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function fetchValidationRunHistory(pool, offerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_validation_runs WHERE offer_id = $1 ORDER BY created_at ASC`,
    [offerId]
  );
  return rows;
}

async function insertValidationRun(client, run) {
  const { rows } = await client.query(
    `INSERT INTO ebp_validation_runs
       (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision,
        mechanical_result, mechanically_eligible_for_approval, trigger, input_versions,
        created_by, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      run.passport_id,
      run.engineering_revision,
      run.manufacturer_id,
      run.offer_id,
      run.offer_revision,
      run.mechanical_result,
      run.mechanically_eligible_for_approval,
      run.trigger,
      JSON.stringify(run.input_versions || {}),
      run.created_by,
      run.identity_mechanism || 'ADMIN_KEY_SHARED',
    ]
  );
  return rows[0];
}

// Marks a run STALE without yet knowing the new run's id (the new row
// cannot be inserted until the prior CURRENT row vacates the partial
// unique index uq_ebp_validation_runs_one_current) — see setSupersededBy.
async function markValidationRunStale(client, id) {
  await client.query(`UPDATE ebp_validation_runs SET status = 'STALE' WHERE id = $1`, [id]);
}

async function setSupersededBy(client, id, supersededById) {
  await client.query(`UPDATE ebp_validation_runs SET superseded_by = $2 WHERE id = $1`, [id, supersededById]);
}

// ─── Rule Results ────────────────────────────────────────────────────────────

// Returns the inserted rows (with their real ebp_rule_results.id) in the
// same order as `results` — callers must use these ids, never
// validation_run_id, as the entity_id for per-rule Activity Events.
async function insertRuleResults(client, validationRunId, results) {
  const inserted = [];
  for (const r of results) {
    const { rows } = await client.query(
      `INSERT INTO ebp_rule_results
         (validation_run_id, rule_id, rule_version, state, severity, observation_code, observation_params)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [validationRunId, r.rule_id, r.rule_version, r.state, r.severity, r.observation_code, JSON.stringify(r.observation_params || {})]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}

async function fetchRuleResults(pool, validationRunId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_rule_results WHERE validation_run_id = $1 ORDER BY created_at ASC`,
    [validationRunId]
  );
  return rows;
}

// ─── Engineering Exceptions (Decision 07, ADR-0045) ─────────────────────────

async function fetchApprovedExceptions(pool, offerId, offerRevision) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_exceptions
     WHERE offer_id = $1 AND offer_revision = $2 AND status = 'APPROVED'`,
    [offerId, offerRevision]
  );
  const map = new Map();
  for (const r of rows) map.set(`${r.rule_id}@${r.rule_version}`, r);
  return map;
}

async function fetchExceptionsForOffer(pool, offerId, offerRevision) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_exceptions WHERE offer_id = $1 AND offer_revision = $2 ORDER BY requested_at ASC`,
    [offerId, offerRevision]
  );
  return rows;
}

async function fetchExceptionById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_engineering_exceptions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function insertException(client, ex) {
  const { rows } = await client.query(
    `INSERT INTO ebp_engineering_exceptions
       (offer_id, offer_revision, rule_id, rule_version, requested_by, justification)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [ex.offer_id, ex.offer_revision, ex.rule_id, ex.rule_version, ex.requested_by, ex.justification]
  );
  return rows[0];
}

async function updateExceptionStatus(client, id, status, decidedBy) {
  const { rows } = await client.query(
    `UPDATE ebp_engineering_exceptions
     SET status = $2, approved_by = $3, approved_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, decidedBy]
  );
  return rows[0];
}

// ─── Engineering Decisions (Decisions 08/09, ADR-0046/ADR-0047) ─────────────

async function insertDecision(client, decision) {
  const { rows } = await client.query(
    `INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by, identity_mechanism, notes)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [decision.validation_run_id, decision.decision, decision.decided_by, decision.identity_mechanism || 'ADMIN_KEY_SHARED', decision.notes || null]
  );
  return rows[0];
}

async function fetchLatestDecisionForRun(pool, validationRunId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_decisions WHERE validation_run_id = $1 ORDER BY decided_at DESC LIMIT 1`,
    [validationRunId]
  );
  return rows[0] || null;
}

async function fetchDecisionById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_engineering_decisions WHERE id = $1`, [id]);
  return rows[0] || null;
}

// Correction round — a condition later failing/going overdue must reopen
// its decision's effective eligibility without rewriting the decision's own
// history (decision/decided_by/notes/decided_at are never touched here).
async function setDecisionStatus(client, decisionId, status) {
  const { rows } = await client.query(
    `UPDATE ebp_engineering_decisions SET status = $2 WHERE id = $1 RETURNING *`,
    [decisionId, status]
  );
  return rows[0];
}

// ─── Engineering Conditions (Decision 08, ADR-0046) ─────────────────────────

async function insertCondition(client, condition) {
  const { rows } = await client.query(
    `INSERT INTO ebp_engineering_conditions
       (engineering_decision_id, condition_type, description, requirement, responsible_party,
        due_date, required_evidence, consequence)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      condition.engineering_decision_id,
      condition.condition_type,
      condition.description,
      condition.requirement,
      condition.responsible_party || null,
      condition.due_date || null,
      condition.required_evidence || null,
      condition.consequence || null,
    ]
  );
  return rows[0];
}

async function fetchConditionsForDecision(pool, decisionId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_conditions WHERE engineering_decision_id = $1 ORDER BY created_at ASC`,
    [decisionId]
  );
  return rows;
}

async function fetchConditionById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_engineering_conditions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function updateConditionStatus(client, id, status) {
  const satisfiedAt = status === 'SATISFIED' ? 'NOW()' : 'NULL';
  const { rows } = await client.query(
    `UPDATE ebp_engineering_conditions SET status = $2, satisfied_at = ${satisfiedAt} WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return rows[0];
}

async function fetchOverdueOpenConditions(pool) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_conditions
     WHERE status = 'OPEN' AND due_date IS NOT NULL AND due_date < CURRENT_DATE`
  );
  return rows;
}

async function fetchConditionsDueSoon(pool, withinDays) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_engineering_conditions
     WHERE status = 'OPEN' AND due_date IS NOT NULL
       AND due_date >= CURRENT_DATE AND due_date <= (CURRENT_DATE + $1::int)`,
    [withinDays]
  );
  return rows;
}

// ─── Alert-scan support: offers with no CURRENT validation run ─────────────

async function fetchActiveOffersWithoutCurrentValidation(pool) {
  const { rows } = await pool.query(
    `SELECT o.id AS offer_id, o.offer_code, o.offer_revision, o.manufacturer_id, o.passport_id
     FROM ebp_manufacturer_offers o
     WHERE o.status IN ('SUBMITTED', 'UNDER_REVIEW', 'VALIDATED')
       AND NOT EXISTS (
         SELECT 1 FROM ebp_validation_runs vr
         WHERE vr.offer_id = o.id AND vr.offer_revision = o.offer_revision AND vr.status = 'CURRENT'
       )`
  );
  return rows;
}

// ─── Coarse Phase 3 compliance_status projection (consistency-audit fix) ───
// Best-effort, non-authoritative UPDATE only — never an ALTER TABLE, never
// treated as the source of truth. See phase-04-validation-engine.md
// Integration Points, 2026-07-13 consistency-audit finding.

async function projectComplianceStatus(client, offerId, fieldName, complianceStatus) {
  await client.query(
    `UPDATE ebp_manufacturer_offer_technical_fields
     SET compliance_status = $3
     WHERE offer_id = $1 AND field_name = $2`,
    [offerId, fieldName, complianceStatus]
  );
}

// ─── Engineering Functional Roles (Decision 01, ADR-0039) ───────────────────

async function assignRole(client, declaredActor, role, assignedBy) {
  const { rows } = await client.query(
    `INSERT INTO ebp_engineering_role_assignments (declared_actor, role, assigned_by)
     VALUES ($1,$2,$3)
     ON CONFLICT (declared_actor, role) DO UPDATE SET assigned_by = EXCLUDED.assigned_by, assigned_at = NOW(), revoked_at = NULL, revoked_by = NULL
     RETURNING *`,
    [declaredActor, role, assignedBy]
  );
  return rows[0];
}

async function revokeRole(client, declaredActor, role, revokedBy) {
  await client.query(
    `UPDATE ebp_engineering_role_assignments SET revoked_at = NOW(), revoked_by = $3
     WHERE declared_actor = $1 AND role = $2 AND revoked_at IS NULL`,
    [declaredActor, role, revokedBy]
  );
}

async function actorHasRole(pool, declaredActor, role) {
  const { rows } = await pool.query(
    `SELECT 1 FROM ebp_engineering_role_assignments
     WHERE declared_actor = $1 AND role = $2 AND revoked_at IS NULL LIMIT 1`,
    [declaredActor, role]
  );
  return rows.length > 0;
}

async function countActiveAssignmentsForRole(pool, role) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM ebp_engineering_role_assignments WHERE role = $1 AND revoked_at IS NULL`,
    [role]
  );
  return rows[0].count;
}

async function fetchActiveRolesForActor(pool, declaredActor) {
  const { rows } = await pool.query(
    `SELECT role FROM ebp_engineering_role_assignments WHERE declared_actor = $1 AND revoked_at IS NULL`,
    [declaredActor]
  );
  return rows.map((r) => r.role);
}

// ─── Permanent ADMIN_OWNER bootstrap (correction round) ─────────────────────
// The id=TRUE primary key on ebp_engineering_admin_bootstrap makes this
// insert atomically race-safe: two concurrent callers both attempting the
// first bootstrap will have exactly one INSERT succeed and the other fail
// with a unique-violation (23505) — the caller must catch that specific
// error and treat it as "someone else already bootstrapped."
async function insertBootstrapRecord(client, actorLabel) {
  const { rows } = await client.query(
    `INSERT INTO ebp_engineering_admin_bootstrap (id, bootstrapped_actor) VALUES (TRUE, $1) RETURNING *`,
    [actorLabel]
  );
  return rows[0];
}

async function hasBootstrapped(pool) {
  const { rows } = await pool.query(`SELECT 1 FROM ebp_engineering_admin_bootstrap LIMIT 1`);
  return rows.length > 0;
}

// ─── Alert Layer (correction round, ADR-0037-aligned) ───────────────────────
// raiseAlert is dedup-safe: ON CONFLICT on uq_ebp_alerts_open_dedup means a
// second raise for the same (alert_type, entity_type, entity_id) while one
// is still OPEN/ACKNOWLEDGED is a no-op (refreshes alert_data instead of
// creating a duplicate row).

async function raiseAlert(client, alert) {
  const { rows } = await client.query(
    `INSERT INTO ebp_alerts
       (alert_type, severity, entity_type, entity_id, manufacturer_id, passport_id,
        offer_id, validation_run_id, due_at, alert_data, correlation_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (alert_type, entity_type, entity_id) WHERE status IN ('OPEN','ACKNOWLEDGED')
     DO UPDATE SET alert_data = EXCLUDED.alert_data
     RETURNING *`,
    [
      alert.alert_type,
      alert.severity,
      alert.entity_type,
      alert.entity_id,
      alert.manufacturer_id || null,
      alert.passport_id || null,
      alert.offer_id || null,
      alert.validation_run_id || null,
      alert.due_at || null,
      JSON.stringify(alert.alert_data || {}),
      alert.correlation_id || null,
    ]
  );
  return rows[0];
}

async function resolveAlerts(client, alertType, entityType, entityId, resolutionReason) {
  const { rows } = await client.query(
    `UPDATE ebp_alerts SET status = 'RESOLVED', resolved_at = NOW(), resolution_reason = $4
     WHERE alert_type = $1 AND entity_type = $2 AND entity_id = $3 AND status IN ('OPEN', 'ACKNOWLEDGED')
     RETURNING *`,
    [alertType, entityType, entityId, resolutionReason || null]
  );
  return rows;
}

async function fetchAlerts(pool, filters = {}) {
  const clauses = [];
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  if (filters.alert_type) {
    params.push(filters.alert_type);
    clauses.push(`alert_type = $${params.length}`);
  }
  if (filters.offer_id) {
    params.push(filters.offer_id);
    clauses.push(`offer_id = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM ebp_alerts ${where} ORDER BY detected_at DESC LIMIT 200`, params);
  return rows;
}

async function fetchAlertById(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM ebp_alerts WHERE alert_id = $1`, [id]);
  return rows[0] || null;
}

async function updateAlertStatus(client, id, status, resolutionReason) {
  const { rows } = await client.query(
    `UPDATE ebp_alerts SET status = $2, resolved_at = CASE WHEN $2 IN ('RESOLVED','DISMISSED') THEN NOW() ELSE resolved_at END, resolution_reason = COALESCE($3, resolution_reason)
     WHERE alert_id = $1 RETURNING *`,
    [id, status, resolutionReason || null]
  );
  return rows[0];
}

// ─── Internal Analytics API support (item 6, correction round) ─────────────
// Reads only from ebp_analytics_validation_summary and ebp_activity_events
// (never a raw transactional table directly, per ADR-0037 §8.3) — the
// aggregation itself happens here in SQL, never recomputed in the frontend.

async function fetchValidationOverview(pool) {
  const { rows } = await pool.query(
    `SELECT mechanical_result, COUNT(*)::int AS count
     FROM ebp_analytics_validation_summary GROUP BY mechanical_result`
  );
  const { rows: decisionRows } = await pool.query(
    `SELECT engineering_decision, COUNT(*)::int AS count
     FROM ebp_analytics_validation_summary WHERE engineering_decision IS NOT NULL
     GROUP BY engineering_decision`
  );
  const { rows: totalsRows } = await pool.query(
    `SELECT COUNT(*)::int AS total_current_runs,
            COALESCE(SUM(open_exceptions), 0)::int AS total_open_exceptions,
            COALESCE(SUM(open_conditions), 0)::int AS total_open_conditions
     FROM ebp_analytics_validation_summary`
  );
  return {
    by_mechanical_result: rows,
    by_engineering_decision: decisionRows,
    totals: totalsRows[0],
  };
}

async function fetchRuleFailureStats(pool) {
  const { rows } = await pool.query(
    `SELECT rr.rule_id, rr.rule_version, rv.rule_name, rv.severity,
            COUNT(*) FILTER (WHERE rr.state = 'FAIL')::int AS fail_count,
            COUNT(*) FILTER (WHERE rr.state = 'REQUIRES_EXCEPTION')::int AS requires_exception_count,
            COUNT(*) FILTER (WHERE rr.state = 'WARNING')::int AS warning_count,
            COUNT(*)::int AS total_evaluations
     FROM ebp_rule_results rr
     JOIN ebp_validation_runs vr ON vr.id = rr.validation_run_id
     LEFT JOIN ebp_rule_versions rv ON rv.rule_id = rr.rule_id AND rv.rule_version = rr.rule_version
     WHERE vr.status = 'CURRENT'
     GROUP BY rr.rule_id, rr.rule_version, rv.rule_name, rv.severity
     ORDER BY fail_count DESC, requires_exception_count DESC
     LIMIT 50`
  );
  return rows;
}

async function fetchManufacturerFailureStats(pool) {
  const { rows } = await pool.query(
    `SELECT manufacturer_id,
            COUNT(*) FILTER (WHERE mechanical_result = 'MECHANICALLY_FAIL')::int AS fail_count,
            COUNT(*) FILTER (WHERE mechanical_result = 'REQUIRES_ENGINEERING_REVIEW')::int AS requires_review_count,
            COUNT(*) FILTER (WHERE mechanical_result = 'MECHANICALLY_PASS')::int AS pass_count,
            COUNT(*)::int AS total
     FROM ebp_analytics_validation_summary
     GROUP BY manufacturer_id
     ORDER BY fail_count DESC
     LIMIT 50`
  );
  return rows;
}

async function fetchTimelineForEntity(pool, entityType, entityId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_activity_events WHERE entity_type = $1 AND entity_id = $2 ORDER BY event_timestamp ASC`,
    [entityType, entityId]
  );
  return rows;
}

module.exports = {
  fetchOfferByCode,
  fetchActiveRuleVersions,
  fetchRuleVersion,
  fetchRuleVersionsByRuleId,
  fetchActiveRuleVersionForRuleId,
  insertRuleVersion,
  publishRuleVersion,
  supersedeRuleVersion,
  retireRuleVersion,
  fetchOfferContext,
  fetchCurrentValidationRun,
  fetchValidationRunById,
  fetchValidationRunHistory,
  insertValidationRun,
  markValidationRunStale,
  setSupersededBy,
  insertRuleResults,
  fetchRuleResults,
  fetchApprovedExceptions,
  fetchExceptionsForOffer,
  fetchExceptionById,
  insertException,
  updateExceptionStatus,
  insertDecision,
  fetchLatestDecisionForRun,
  fetchDecisionById,
  setDecisionStatus,
  insertCondition,
  fetchConditionsForDecision,
  fetchConditionById,
  updateConditionStatus,
  fetchOverdueOpenConditions,
  fetchConditionsDueSoon,
  fetchActiveOffersWithoutCurrentValidation,
  projectComplianceStatus,
  assignRole,
  revokeRole,
  actorHasRole,
  fetchActiveRolesForActor,
  countActiveAssignmentsForRole,
  insertBootstrapRecord,
  hasBootstrapped,
  raiseAlert,
  resolveAlerts,
  fetchAlerts,
  fetchAlertById,
  updateAlertStatus,
  fetchValidationOverview,
  fetchRuleFailureStats,
  fetchManufacturerFailureStats,
  fetchTimelineForEntity,
};
