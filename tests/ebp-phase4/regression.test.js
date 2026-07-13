'use strict';

// EBP Phase 4 — regression tests. These guard the database-level
// invariants directly (bypassing the application layer) so a future
// change to service.js/repository.js cannot silently weaken a guarantee
// the schema itself is supposed to enforce. Skips with a clear message if
// the database is unreachable.
//
// Run: node --test tests/ebp-phase4/regression.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';

test('EBP Phase 4 — regression guards', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 4 regression tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const suffix = Date.now().toString().slice(-8);
  const createdRuleIds = [];

  t.after(async () => {
    if (createdRuleIds.length) {
      await pool.query(`DELETE FROM ebp_rule_versions WHERE rule_id = ANY($1::text[])`, [createdRuleIds]);
    }
    await pool.end();
  });

  async function insertDraftRule(ruleId, version, overrides = {}) {
    createdRuleIds.push(ruleId);
    const defaults = {
      rule_name: 'regression rule',
      description: 'regression test rule',
      comparison_type: 'MINIMUM',
      severity: 'HIGH',
      exception_policy: 'NON_WAIVABLE',
      category: 'DIMENSIONS',
      applies_to: {},
      default_behavior: { field_name: 'x', min: 1 },
      status: 'DRAFT',
    };
    const r = { ...defaults, ...overrides };
    await pool.query(
      `INSERT INTO ebp_rule_versions
         (rule_id, rule_version, rule_name, description, comparison_type, severity, exception_policy, category, applies_to, default_behavior, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'regression-test')`,
      [ruleId, version, r.rule_name, r.description, r.comparison_type, r.severity, r.exception_policy, r.category, JSON.stringify(r.applies_to), JSON.stringify(r.default_behavior), r.status]
    );
  }

  // ── Rule Catalog invariants (Decision 10, ADR-0048) ──────────────────────

  await t.test('at most one ACTIVE rule_version per rule_id (uq_ebp_rule_versions_one_active)', async () => {
    const ruleId = `REG-RULE-ACTIVE-${suffix}`;
    await insertDraftRule(ruleId, 1, { status: 'ACTIVE' });
    await assert.rejects(
      () => pool.query(`INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, category, applies_to, default_behavior, status, created_by)
                         VALUES ($1,2,'x','x','MINIMUM','HIGH','DIMENSIONS','{}','{}','ACTIVE','regression-test')`, [ruleId]),
      /uq_ebp_rule_versions_one_active/
    );
  });

  await t.test('rule_id + rule_version is unique (published versions are never edited)', async () => {
    const ruleId = `REG-RULE-DUP-${suffix}`;
    await insertDraftRule(ruleId, 1);
    await assert.rejects(() => insertDraftRule(ruleId, 1), /duplicate key|unique/i);
  });

  await t.test('comparison_type, severity, exception_policy, category, status CHECK constraints reject invalid values', async () => {
    const ruleId = `REG-RULE-CHECK-${suffix}`;
    await assert.rejects(() => insertDraftRule(ruleId, 1, { comparison_type: 'NOT_A_TYPE' }), /violates check constraint/);
    await assert.rejects(() => insertDraftRule(ruleId, 1, { severity: 'BOGUS' }), /violates check constraint/);
    await assert.rejects(() => insertDraftRule(ruleId, 1, { exception_policy: 'ALWAYS_WAIVABLE' }), /violates check constraint/);
    await assert.rejects(() => insertDraftRule(ruleId, 1, { category: 'NOT_A_CATEGORY' }), /violates check constraint/);
    await assert.rejects(() => insertDraftRule(ruleId, 1, { status: 'PUBLISHED' }), /violates check constraint/);
  });

  // ── Validation Runs invariants (Decision 12, ADR-0050; ADR-0051) ─────────

  await t.test('mechanical_result CHECK constraint rejects an Engineering-Decision-shaped value', async () => {
    const { rows } = await pool.query(`SELECT id FROM ebp_engineering_passports LIMIT 1`);
    const { rows: mfrRows } = await pool.query(`SELECT id FROM ebp_manufacturers LIMIT 1`);
    const { rows: offerRows } = await pool.query(`SELECT id, offer_revision FROM ebp_manufacturer_offers LIMIT 1`);
    if (!rows.length || !mfrRows.length || !offerRows.length) return; // no fixtures available, skip silently
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, trigger, input_versions, created_by)
         VALUES ($1, 1, $2, $3, $4, 'APPROVED', 'MANUAL_RERUN', '{}', 'regression-test')`,
        [rows[0].id, mfrRows[0].id, offerRows[0].id, offerRows[0].offer_revision]
      ),
      /violates check constraint/
    );
  });

  await t.test('rule_results.state CHECK constraint only accepts the six decided states', async () => {
    const ruleId = `REG-RULE-STATE-${suffix}`;
    await insertDraftRule(ruleId, 1, { status: 'ACTIVE' });
    const { rows } = await pool.query(`SELECT id FROM ebp_engineering_passports LIMIT 1`);
    const { rows: mfrRows } = await pool.query(`SELECT id FROM ebp_manufacturers LIMIT 1`);
    const { rows: offerRows } = await pool.query(`SELECT id, offer_revision FROM ebp_manufacturer_offers LIMIT 1`);
    if (!rows.length || !mfrRows.length || !offerRows.length) return;
    const runInsert = await pool.query(
      `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, trigger, input_versions, created_by, status)
       VALUES ($1, 1, $2, $3, $4, 'MECHANICALLY_PASS', 'MANUAL_RERUN', '{}', 'regression-test', 'STALE') RETURNING id`,
      [rows[0].id, mfrRows[0].id, offerRows[0].id, offerRows[0].offer_revision]
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_rule_results (validation_run_id, rule_id, rule_version, state, severity, observation_code)
         VALUES ($1, $2, 1, 'SORT_OF_PASSED', 'HIGH', 'OBS_TEST')`,
        [runInsert.rows[0].id, ruleId]
      ),
      /violates check constraint/
    );
    await pool.query(`DELETE FROM ebp_validation_runs WHERE id = $1`, [runInsert.rows[0].id]);
  });

  await t.test('rule_results.(rule_id, rule_version) FK rejects a non-existent rule version', async () => {
    const { rows } = await pool.query(`SELECT id FROM ebp_engineering_passports LIMIT 1`);
    const { rows: mfrRows } = await pool.query(`SELECT id FROM ebp_manufacturers LIMIT 1`);
    const { rows: offerRows } = await pool.query(`SELECT id, offer_revision FROM ebp_manufacturer_offers LIMIT 1`);
    if (!rows.length || !mfrRows.length || !offerRows.length) return;
    const runInsert = await pool.query(
      `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, trigger, input_versions, created_by, status)
       VALUES ($1, 1, $2, $3, $4, 'MECHANICALLY_PASS', 'MANUAL_RERUN', '{}', 'regression-test', 'STALE') RETURNING id`,
      [rows[0].id, mfrRows[0].id, offerRows[0].id, offerRows[0].offer_revision]
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_rule_results (validation_run_id, rule_id, rule_version, state, severity, observation_code)
         VALUES ($1, 'RULE-DOES-NOT-EXIST', 999, 'PASS', 'HIGH', 'OBS_TEST')`,
        [runInsert.rows[0].id]
      ),
      /violates foreign key constraint/
    );
    await pool.query(`DELETE FROM ebp_validation_runs WHERE id = $1`, [runInsert.rows[0].id]);
  });

  // ── Engineering Exceptions invariants (Decision 07, ADR-0045) ────────────

  await t.test('exceptions are scoped to exactly (offer_id, offer_revision, rule_id, rule_version) — a duplicate is rejected at the DB level', async () => {
    const ruleId = `REG-RULE-EXCEPTION-${suffix}`;
    await insertDraftRule(ruleId, 1, { status: 'ACTIVE', exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL' });
    const { rows: offerRows } = await pool.query(`SELECT id, offer_revision FROM ebp_manufacturer_offers LIMIT 1`);
    if (!offerRows.length) return;
    await pool.query(
      `INSERT INTO ebp_engineering_exceptions (offer_id, offer_revision, rule_id, rule_version, requested_by, justification)
       VALUES ($1, $2, $3, 1, 'regression-test', 'first request')`,
      [offerRows[0].id, offerRows[0].offer_revision, ruleId]
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_engineering_exceptions (offer_id, offer_revision, rule_id, rule_version, requested_by, justification)
         VALUES ($1, $2, $3, 1, 'regression-test', 'duplicate request')`,
        [offerRows[0].id, offerRows[0].offer_revision, ruleId]
      ),
      /duplicate key|unique/i
    );
    await pool.query(`DELETE FROM ebp_engineering_exceptions WHERE offer_id = $1 AND rule_id = $2`, [offerRows[0].id, ruleId]);
  });

  await t.test('exceptions.status CHECK constraint only accepts REQUESTED/APPROVED/REJECTED', async () => {
    const ruleId = `REG-RULE-EXC-STATUS-${suffix}`;
    await insertDraftRule(ruleId, 1, { status: 'ACTIVE', exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL' });
    const { rows: offerRows } = await pool.query(`SELECT id, offer_revision FROM ebp_manufacturer_offers LIMIT 1`);
    if (!offerRows.length) return;
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_engineering_exceptions (offer_id, offer_revision, rule_id, rule_version, status, requested_by, justification)
         VALUES ($1, $2, $3, 1, 'HALF_APPROVED', 'regression-test', 'x')`,
        [offerRows[0].id, offerRows[0].offer_revision, ruleId]
      ),
      /violates check constraint/
    );
  });

  // ── Engineering Conditions invariants (Decision 08, ADR-0046) ────────────

  await t.test('conditions.status CHECK constraint only accepts the six decided statuses', async () => {
    const { rows: offerRows } = await pool.query(
      `SELECT id, passport_id FROM ebp_manufacturer_offers WHERE status NOT IN ('REJECTED','SUPERSEDED','EXPIRED','WITHDRAWN') AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`
    );
    const { rows: mfrRows } = await pool.query(`SELECT id FROM ebp_manufacturers LIMIT 1`);
    if (!offerRows.length || !mfrRows.length) return;
    // A synthetic, zero-Rule-Result CURRENT run (offer_revision 998 avoids
    // colliding with uq_ebp_validation_runs_one_current) so the
    // decision-eligibility trigger's checks are trivially satisfied, and a
    // CONDITIONALLY_APPROVED decision so the "condition requires a
    // CONDITIONALLY_APPROVED decision" trigger (correction round) doesn't
    // itself block this insert before the CHECK constraint even runs.
    const runInsert = await pool.query(
      `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, trigger, input_versions, created_by, status)
       VALUES ($1, 1, $2, $3, 998, 'REQUIRES_ENGINEERING_REVIEW', 'MANUAL_RERUN', '{}', 'regression-test', 'CURRENT') RETURNING id`,
      [offerRows[0].passport_id, mfrRows[0].id, offerRows[0].id]
    );
    const decisionInsert = await pool.query(
      `INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by) VALUES ($1, 'CONDITIONALLY_APPROVED', 'regression-test') RETURNING id`,
      [runInsert.rows[0].id]
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_engineering_conditions (engineering_decision_id, condition_type, description, requirement, status)
         VALUES ($1, 'X', 'X', 'X', 'HALF_DONE')`,
        [decisionInsert.rows[0].id]
      ),
      /violates check constraint/
    );
    await pool.query(`DELETE FROM ebp_engineering_decisions WHERE id = $1`, [decisionInsert.rows[0].id]);
    await pool.query(`DELETE FROM ebp_validation_runs WHERE id = $1`, [runInsert.rows[0].id]);
  });

  // ── Consistency-audit fix: Phase 3's frozen compliance_status column ────

  await t.test("Phase 3's compliance_status CHECK constraint remains exactly the original 3-value enum (never widened by Phase 4)", async () => {
    const { rows } = await pool.query(
      `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
       WHERE conname = 'ebp_manufacturer_offer_technical_fields_compliance_status_check'`
    );
    assert.equal(rows.length, 1);
    assert.match(rows[0].def, /'PENDING'/);
    assert.match(rows[0].def, /'COMPLIANT'/);
    assert.match(rows[0].def, /'NON_COMPLIANT'/);
    assert.doesNotMatch(rows[0].def, /REQUIRES_EXCEPTION/);
  });

  // ── Activity Events ledger (ADR-0037) ────────────────────────────────────

  await t.test('ebp_activity_events accepts an arbitrary event_type (no CHECK constraint narrows the vocabulary — extensible by design)', async () => {
    const insert = await pool.query(
      `INSERT INTO ebp_activity_events (event_type, entity_type, entity_id, declared_actor)
       VALUES ('SOME_FUTURE_EVENT_TYPE', 'TEST_ENTITY', gen_random_uuid(), 'regression-test') RETURNING event_id`
    );
    assert.ok(insert.rows[0].event_id);
    await pool.query(`DELETE FROM ebp_activity_events WHERE event_id = $1`, [insert.rows[0].event_id]);
  });

  // ── Phase 1/2/3 fixtures remain untouched by Phase 4's presence ──────────

  await t.test('Phase 1/2/3 core tables are still present and queryable', async () => {
    const tables = ['ebp_engineering_passports', 'ebp_manufacturers', 'ebp_manufacturer_offers', 'ebp_manufacturer_offer_technical_fields'];
    for (const tableName of tables) {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ${tableName}`);
      assert.ok(rows[0].c >= 0);
    }
  });
});
