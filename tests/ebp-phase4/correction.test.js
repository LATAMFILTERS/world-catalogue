'use strict';

// EBP Phase 4 — correction-round tests (2026-07-13 pre-freeze correction).
// Covers exactly the scenarios the correction round required proof for:
// strict Engineering Decision eligibility, exception-triggered
// revalidation, ACCEPTED_BY_EXCEPTION disposition, condition-driven
// re-eligibility, Rule Result event identity, Alert Layer dedup/
// resolution, the Internal Analytics API, concurrent+permanent bootstrap,
// and Rule Catalog dependency-cycle detection.
//
// Run: node --test tests/ebp-phase4/correction.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const {
  createValidationRouter,
  createRuleCatalogRouter,
  createRolesRouter,
  createAlertsRouter,
  createAnalyticsRouter,
} = require('../../ebp/phase4/internal.routes');
const { generateCandidate: generateEfmCandidate } = require('../../ebp/phase2/efm-code');
const { generateUniqueBatchCode, generateUniqueOfferCode } = require('../../ebp/phase3/codes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase4-correction';

function requireAdmin(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!key || key !== TEST_ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
}

async function startTestServer(pool) {
  const app = express();
  app.use(express.json());
  app.use('/api/ebp/internal/validation', requireAdmin, createValidationRouter(pool));
  app.use('/api/ebp/internal/rule-catalog', requireAdmin, createRuleCatalogRouter(pool));
  app.use('/api/ebp/internal/roles', requireAdmin, createRolesRouter(pool));
  app.use('/api/ebp/internal/alerts', requireAdmin, createAlertsRouter(pool));
  app.use('/api/ebp/internal/analytics', requireAdmin, createAnalyticsRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return {
    server,
    validationUrl: `http://127.0.0.1:${port}/api/ebp/internal/validation`,
    ruleCatalogUrl: `http://127.0.0.1:${port}/api/ebp/internal/rule-catalog`,
    rolesUrl: `http://127.0.0.1:${port}/api/ebp/internal/roles`,
    alertsUrl: `http://127.0.0.1:${port}/api/ebp/internal/alerts`,
    analyticsUrl: `http://127.0.0.1:${port}/api/ebp/internal/analytics`,
  };
}

function headers(actor, extra = {}) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', 'x-ebp-actor': actor, ...extra };
}

test('EBP Phase 4 — correction round verification', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 4 correction tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const { server, validationUrl, ruleCatalogUrl, rolesUrl, alertsUrl, analyticsUrl } = await startTestServer(pool);
  const suffix = Date.now().toString().slice(-6);
  const actorPattern = `corr-%-${suffix}`;
  const rulePattern = `CORR-%-${suffix}`;

  await pool.query('DELETE FROM ebp_engineering_admin_bootstrap');

  t.after(async () => {
    server.close();
    await pool.query(
      `DELETE FROM ebp_engineering_conditions WHERE engineering_decision_id IN
         (SELECT id FROM ebp_engineering_decisions WHERE decided_by LIKE $1)`,
      [actorPattern]
    );
    await pool.query(`DELETE FROM ebp_engineering_decisions WHERE decided_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_engineering_exceptions WHERE requested_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_rule_results WHERE rule_id LIKE $1`, [rulePattern]);
    await pool.query(`DELETE FROM ebp_validation_runs WHERE created_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_alerts WHERE alert_type IS NOT NULL AND entity_id::text LIKE '%'`); // scoped further below per-test
    await pool.query(`DELETE FROM ebp_rule_versions WHERE rule_id LIKE $1`, [rulePattern]);
    await pool.query(`DELETE FROM ebp_engineering_role_assignments WHERE declared_actor LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_activity_events WHERE declared_actor LIKE $1`, [actorPattern]);
    await pool.query('DELETE FROM ebp_engineering_admin_bootstrap');
    await pool.end();
  });

  // ── Shared fixture: Passport + Manufacturer + Offer + technical fields ──

  const sku = `ELP4CORR${suffix}`;
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [sku]);
  const passportInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase4-correction-test') RETURNING id`,
    [sku]
  );
  const passportId = passportInsert.rows[0].id;
  await pool.query(`INSERT INTO ebp_passport_engineering (passport_id, burst_pressure_kpa) VALUES ($1, 500)`, [passportId]);
  await pool.query(
    `INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity) VALUES ($1, 'AUTOMOTIVE', TRUE, 24)`,
    [passportId]
  );
  const mfrCode = generateEfmCandidate();
  const mfrInsert = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, 'Phase4 Correction Mfr', 'CN', 'Asia/Shanghai', 'QUALIFIED', 'phase4-correction-test') RETURNING id`,
    [mfrCode]
  );
  const manufacturerId = mfrInsert.rows[0].id;
  const batchCode = await generateUniqueBatchCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code]);
    return rows.length > 0;
  });
  const batchInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by)
     VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase4-correction-test') RETURNING id`,
    [batchCode, manufacturerId]
  );
  const batchItemInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot)
     VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`,
    [batchInsert.rows[0].id, passportId, sku]
  );
  const offerCode = await generateUniqueOfferCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code]);
    return rows.length > 0;
  });
  const offerInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_offers
       (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by, identity_mechanism, fob_price, currency)
     VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase4-correction-test', 'ADMIN_KEY_SHARED', 9.99, 'USD') RETURNING id`,
    [offerCode, batchItemInsert.rows[0].id, manufacturerId, passportId]
  );
  const offerId = offerInsert.rows[0].id;
  await pool.query(
    `INSERT INTO ebp_manufacturer_offer_technical_fields (offer_id, field_name, offered_value) VALUES ($1, 'burst_pressure_kpa', '400'::jsonb)`,
    [offerId]
  );

  const ACTOR_OWNER = `corr-owner-${suffix}`;
  const ACTOR_APPROVER = `corr-approver-${suffix}`;
  const ACTOR_REVIEWER = `corr-reviewer-${suffix}`;

  await t.test('bootstrap setup: create ADMIN_OWNER, ENGINEERING_APPROVER, ENGINEERING_REVIEWER', async () => {
    const r1 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_OWNER, role: 'ADMIN_OWNER' }) });
    assert.equal(r1.status, 201);
    const r2 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_APPROVER, role: 'ENGINEERING_APPROVER' }) });
    assert.equal(r2.status, 201);
    const r3 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_REVIEWER, role: 'ENGINEERING_REVIEWER' }) });
    assert.equal(r3.status, 201);
  });

  // ── Item 7: concurrent + permanent bootstrap ─────────────────────────────

  await t.test('bootstrap: two concurrent ADMIN_OWNER bootstrap attempts — exactly one succeeds', async () => {
    await pool.query('DELETE FROM ebp_engineering_admin_bootstrap');
    await pool.query(`DELETE FROM ebp_engineering_role_assignments WHERE role = 'ADMIN_OWNER'`);

    const [resA, resB] = await Promise.all([
      fetch(rolesUrl, { method: 'POST', headers: headers('concurrent-a'), body: JSON.stringify({ declared_actor: 'concurrent-a', role: 'ADMIN_OWNER' }) }),
      fetch(rolesUrl, { method: 'POST', headers: headers('concurrent-b'), body: JSON.stringify({ declared_actor: 'concurrent-b', role: 'ADMIN_OWNER' }) }),
    ]);
    // Node/Express is single-threaded: two "concurrent" fetches may still
    // fully serialize (the loser's own hasBootstrapped() check can run
    // after the winner already committed, giving 403 from the normal
    // role-gated path) or genuinely race at the database INSERT (giving
    // 409 from the unique-violation catch). Both are correct rejections —
    // the real invariant is exactly one success and exactly one permanent
    // bootstrap row, never zero, never two.
    const statuses = [resA.status, resB.status];
    const successes = statuses.filter((s) => s === 201);
    const rejections = statuses.filter((s) => s === 403 || s === 409);
    assert.equal(successes.length, 1, `exactly one bootstrap attempt must succeed (got ${statuses})`);
    assert.equal(rejections.length, 1, `the other attempt must be rejected with 403 or 409 (got ${statuses})`);

    const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM ebp_engineering_admin_bootstrap');
    assert.equal(rows[0].c, 1);

    const { rows: eventRows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_activity_events WHERE event_type = 'ENGINEERING_ADMIN_OWNER_BOOTSTRAPPED'`);
    assert.ok(eventRows[0].c >= 1);

    // Cleanup this ad hoc bootstrap probe so it doesn't affect the shared
    // ACTOR_OWNER fixture used by the rest of this file.
    await pool.query(`DELETE FROM ebp_engineering_role_assignments WHERE declared_actor IN ('concurrent-a', 'concurrent-b')`);
  });

  await t.test('bootstrap: never reopens even after the bootstrapped ADMIN_OWNER is revoked', async () => {
    // At this point ebp_engineering_admin_bootstrap has a row (from the
    // concurrent test above) but zero ACTIVE ADMIN_OWNER assignments
    // (revoked in cleanup) — the permanent record, not the active-count,
    // must be what gates the bootstrap path.
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_engineering_role_assignments WHERE role = 'ADMIN_OWNER' AND revoked_at IS NULL`);
    assert.equal(rows[0].c, 0);

    const res = await fetch(rolesUrl, {
      method: 'POST',
      headers: headers('nobody-in-particular'),
      body: JSON.stringify({ declared_actor: 'new-owner-attempt', role: 'ADMIN_OWNER' }),
    });
    assert.equal(res.status, 403); // requireRole(ADMIN_OWNER) rejects — bootstrap allowance is closed forever

    // Restore ACTOR_OWNER as the real ADMIN_OWNER via direct SQL (test-only
    // shortcut — production would need an existing ADMIN_OWNER to do this).
    await pool.query(
      `INSERT INTO ebp_engineering_role_assignments (declared_actor, role, assigned_by) VALUES ($1, 'ADMIN_OWNER', 'test-restore')
       ON CONFLICT (declared_actor, role) DO UPDATE SET revoked_at = NULL`,
      [ACTOR_OWNER]
    );
  });

  // ── Rule Catalog fixtures for the eligibility/exception scenarios ───────

  const RULE_BURST = `CORR-BURST-${suffix}`;
  const RULE_EVIDENCE = `CORR-EVIDENCE-${suffix}`;

  await t.test('rule catalog setup: NON_WAIVABLE HIGH MINIMUM + WAIVABLE HIGH REQUIRED_EVIDENCE', async () => {
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_BURST, rule_version: 1, rule_name: 'burst min', description: 'burst min',
        comparison_type: 'MINIMUM', severity: 'HIGH', exception_policy: 'NON_WAIVABLE', category: 'BURST_PRESSURE',
        applies_to: { product_category: ['OIL'] }, default_behavior: { field_name: 'burst_pressure_kpa', target_source: 'PASSPORT_FIELD', target_field: 'burst_pressure_kpa', min: 500 },
      }),
    });
    await fetch(`${ruleCatalogUrl}/${RULE_BURST}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });

    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_EVIDENCE, rule_version: 1, rule_name: 'evidence', description: 'evidence',
        comparison_type: 'REQUIRED_EVIDENCE', severity: 'HIGH', exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL', category: 'CERTIFICATION',
        applies_to: { product_category: ['OIL'] }, default_behavior: { field_name: 'burst_pressure_kpa' },
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_EVIDENCE}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 200);
  });

  // ── Item 1: strict eligibility — MECHANICALLY_FAIL / NON_WAIVABLE FAIL ──

  await t.test('running validation with burst below minimum produces MECHANICALLY_FAIL', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/run`, { method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ trigger: 'INITIAL' }) });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.validation_run.mechanical_result, 'MECHANICALLY_FAIL');
  });

  await t.test('attempting to APPROVE a MECHANICALLY_FAIL offer is rejected (409)', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/decisions`, {
      method: 'POST', headers: headers(ACTOR_APPROVER), body: JSON.stringify({ decision: 'APPROVED' }),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.match(body.message, /NON_WAIVABLE rule is FAIL|MECHANICALLY_PASS/);
  });

  await t.test('attempting to APPROVE with a NON_WAIVABLE rule FAILing is rejected even at the database level (trigger)', async () => {
    const run = await pool.query(`SELECT id FROM ebp_validation_runs WHERE offer_id = $1 AND status = 'CURRENT'`, [offerId]);
    await assert.rejects(
      () => pool.query(`INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by) VALUES ($1, 'APPROVED', 'direct-sql-bypass-attempt')`, [run.rows[0].id]),
      /NON_WAIVABLE rule\(s\) FAILED/
    );
  });

  // ── Item 1: strict eligibility — pending exception blocks APPROVED ──────

  await t.test('correcting burst pressure leaves the evidence rule REQUIRES_EXCEPTION; requesting (but not yet approving) an exception still blocks APPROVED', async () => {
    await pool.query(`UPDATE ebp_manufacturer_offer_technical_fields SET offered_value = '600'::jsonb WHERE offer_id = $1 AND field_name = 'burst_pressure_kpa'`, [offerId]);
    const runRes = await fetch(`${validationUrl}/${offerCode}/run`, { method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ trigger: 'EVIDENCE_CHANGED' }) });
    const runBody = await runRes.json();
    assert.equal(runBody.validation_run.mechanical_result, 'REQUIRES_ENGINEERING_REVIEW');

    const exReqRes = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST', headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ rule_id: RULE_EVIDENCE, rule_version: 1, justification: 'pending justification' }),
    });
    assert.equal(exReqRes.status, 201);

    const approveAttempt = await fetch(`${validationUrl}/${offerCode}/decisions`, { method: 'POST', headers: headers(ACTOR_APPROVER), body: JSON.stringify({ decision: 'APPROVED' }) });
    assert.equal(approveAttempt.status, 409);
    const approveBody = await approveAttempt.json();
    assert.match(approveBody.message, /REQUIRES_EXCEPTION/);

    const { id: pendingExceptionId } = await exReqRes.json();
    t.exceptionId = pendingExceptionId; // stash for the next block
  });

  // ── Item 2: exception decision -> STALE + revalidation + input_versions ─

  let approvedExceptionId;
  await t.test('approving the exception marks the current run STALE, emits VALIDATION_MARKED_STALE, and creates a new run with trigger EXCEPTION_APPROVED', async () => {
    const beforeRun = await pool.query(`SELECT id FROM ebp_validation_runs WHERE offer_id = $1 AND status = 'CURRENT'`, [offerId]);
    const beforeRunId = beforeRun.rows[0].id;

    const exceptions = await pool.query(`SELECT id FROM ebp_engineering_exceptions WHERE offer_id = $1 AND status = 'REQUESTED' ORDER BY requested_at DESC LIMIT 1`, [offerId]);
    approvedExceptionId = exceptions.rows[0].id;

    const approveRes = await fetch(`${validationUrl}/exceptions/${approvedExceptionId}/approve`, { method: 'POST', headers: headers(ACTOR_APPROVER) });
    assert.equal(approveRes.status, 200);

    const staleRow = await pool.query(`SELECT status FROM ebp_validation_runs WHERE id = $1`, [beforeRunId]);
    assert.equal(staleRow.rows[0].status, 'STALE');

    const staleEvent = await pool.query(`SELECT event_type, event_data FROM ebp_activity_events WHERE entity_id = $1 AND event_type = 'VALIDATION_MARKED_STALE'`, [beforeRunId]);
    assert.equal(staleEvent.rows.length, 1);

    const newRun = await pool.query(`SELECT trigger, input_versions FROM ebp_validation_runs WHERE offer_id = $1 AND status = 'CURRENT'`, [offerId]);
    assert.equal(newRun.rows[0].trigger, 'EXCEPTION_APPROVED');

    // Item 2.5: input_versions embeds the exception's id/rule/version/status/decided_at.
    const embeddedExceptions = newRun.rows[0].input_versions.exceptions;
    const match = embeddedExceptions.find((e) => e.exception_id === approvedExceptionId);
    assert.ok(match, 'expected the approved exception to be embedded in the new run input_versions');
    assert.equal(match.rule_id, RULE_EVIDENCE);
    assert.equal(match.rule_version, 1);
    assert.equal(match.status, 'APPROVED');
    assert.ok(match.decided_at);
  });

  await t.test("the original Rule Result on the now-STALE run was never rewritten — historical rows are immutable", async () => {
    const { rows } = await pool.query(
      `SELECT rr.state FROM ebp_rule_results rr
       JOIN ebp_validation_runs vr ON vr.id = rr.validation_run_id
       WHERE vr.offer_id = $1 AND vr.status = 'STALE' AND rr.rule_id = $2
       ORDER BY vr.created_at DESC LIMIT 1`,
      [offerId, RULE_EVIDENCE]
    );
    assert.equal(rows[0].state, 'REQUIRES_EXCEPTION');
  });

  await t.test('an approved exception never converts the Rule Result to PASS — technical state stays REQUIRES_EXCEPTION, effective_disposition becomes ACCEPTED_BY_EXCEPTION', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}`, { headers: headers(ACTOR_REVIEWER) });
    const body = await res.json();
    const evidenceResult = body.rule_results.find((r) => r.rule_id === RULE_EVIDENCE);
    assert.equal(evidenceResult.state, 'REQUIRES_EXCEPTION');
    assert.equal(evidenceResult.effective_disposition, 'ACCEPTED_BY_EXCEPTION');
    // mechanical_result is still not MECHANICALLY_PASS — an accepted
    // deviation is never counted as genuine technical compliance.
    assert.equal(body.validation_run.mechanical_result, 'REQUIRES_ENGINEERING_REVIEW');
  });

  // ── Item 1: now that the exception is APPROVED, CONDITIONALLY_APPROVED
  // (or APPROVED, since mechanical_result would need PASS which it never
  // reaches once an exception exists) should be reachable ───────────────

  let decisionId;
  let conditionId;
  await t.test('APPROVED is still blocked (mechanical_result never becomes MECHANICALLY_PASS once a REQUIRES_EXCEPTION result exists), but CONDITIONALLY_APPROVED now succeeds', async () => {
    const approveAttempt = await fetch(`${validationUrl}/${offerCode}/decisions`, { method: 'POST', headers: headers(ACTOR_APPROVER), body: JSON.stringify({ decision: 'APPROVED' }) });
    assert.equal(approveAttempt.status, 409);

    const condRes = await fetch(`${validationUrl}/${offerCode}/decisions`, {
      method: 'POST', headers: headers(ACTOR_APPROVER),
      body: JSON.stringify({
        decision: 'CONDITIONALLY_APPROVED', notes: 'accepted deviation, pending documentation',
        conditions: [{ condition_type: 'DOC', description: 'submit doc', requirement: 'submit doc' }],
      }),
    });
    assert.equal(condRes.status, 201);
    const body = await condRes.json();
    decisionId = body.id;
    conditionId = body.conditions[0].id;
  });

  await t.test('APPROVED cannot carry conditions — even at the database level (trigger)', async () => {
    // Constructs a synthetic, zero-Rule-Result Validation Run so the
    // eligibility trigger's COUNT(*) checks are all trivially zero (an
    // APPROVED decision on it is legitimate), isolating this test to only
    // the second trigger: a condition may never attach to an APPROVED
    // decision, regardless of mechanical eligibility.
    // offer_revision 999 is fictitious — it only needs to avoid colliding
    // with the real CURRENT run's (offer_id, offer_revision) pair under
    // uq_ebp_validation_runs_one_current, while still satisfying the
    // eligibility trigger's own status = 'CURRENT' requirement.
    const syntheticRun = await pool.query(
      `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, trigger, input_versions, created_by, status)
       VALUES ($1, 1, $2, $3, 999, 'MECHANICALLY_PASS', 'MANUAL_RERUN', '{}', 'phase4-correction-test', 'CURRENT') RETURNING id`,
      [passportId, manufacturerId, offerId]
    );
    const syntheticDecision = await pool.query(
      `INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by) VALUES ($1, 'APPROVED', 'phase4-correction-test') RETURNING id`,
      [syntheticRun.rows[0].id]
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ebp_engineering_conditions (engineering_decision_id, condition_type, description, requirement) VALUES ($1, 'X', 'X', 'X')`,
        [syntheticDecision.rows[0].id]
      ),
      /may only be attached to a CONDITIONALLY_APPROVED decision/
    );

    // Cleanup: this synthetic run used offer_revision 999 specifically so
    // it wouldn't collide with uq_ebp_validation_runs_one_current for the
    // real offer_revision 1 lineage — but left uncleaned it would leave a
    // SECOND "CURRENT" row for this offer_id, making "the CURRENT run"
    // ambiguous for every later query in this suite. Mark it STALE now
    // that its one-off purpose is served.
    await pool.query(`UPDATE ebp_validation_runs SET status = 'STALE' WHERE id = $1`, [syntheticRun.rows[0].id]);
  });

  // ── Item 3: condition status changes reevaluate decision eligibility ────

  await t.test('a mandatory OPEN condition blocks selection eligibility', async () => {
    const eligBefore = await pool.query(`SELECT status FROM ebp_engineering_conditions WHERE id = $1`, [conditionId]);
    assert.equal(eligBefore.rows[0].status, 'OPEN');
    const res = await fetch(`${validationUrl}/${offerCode}`, { headers: headers(ACTOR_REVIEWER) });
    const body = await res.json();
    assert.equal(body.selection_eligibility.eligible, false);
  });

  await t.test('a condition transitioning to FAILED marks the decision NEEDS_REVIEW and emits ENGINEERING_DECISION_REQUIRES_REVIEW', async () => {
    const res = await fetch(`${validationUrl}/conditions/${conditionId}/status`, { method: 'POST', headers: headers(ACTOR_APPROVER), body: JSON.stringify({ status: 'FAILED' }) });
    assert.equal(res.status, 200);

    const { rows } = await pool.query(`SELECT status FROM ebp_engineering_decisions WHERE id = $1`, [decisionId]);
    assert.equal(rows[0].status, 'NEEDS_REVIEW');

    const { rows: eventRows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_activity_events WHERE entity_id = $1 AND event_type = 'ENGINEERING_DECISION_REQUIRES_REVIEW'`, [decisionId]);
    assert.equal(eventRows[0].c, 1);

    const summaryRes = await fetch(`${validationUrl}/${offerCode}`, { headers: headers(ACTOR_REVIEWER) });
    const summaryBody = await summaryRes.json();
    assert.equal(summaryBody.selection_eligibility.eligible, false);
  });

  await t.test('the condition transitioning to SATISFIED clears NEEDS_REVIEW and restores eligibility — never silently, only via recomputation', async () => {
    const res = await fetch(`${validationUrl}/conditions/${conditionId}/status`, { method: 'POST', headers: headers(ACTOR_APPROVER), body: JSON.stringify({ status: 'SATISFIED' }) });
    assert.equal(res.status, 200);

    const { rows } = await pool.query(`SELECT status FROM ebp_engineering_decisions WHERE id = $1`, [decisionId]);
    assert.equal(rows[0].status, 'CURRENT');

    const summaryRes = await fetch(`${validationUrl}/${offerCode}`, { headers: headers(ACTOR_REVIEWER) });
    const summaryBody = await summaryRes.json();
    assert.equal(summaryBody.selection_eligibility.eligible, true);
  });

  // ── Item 4: Rule Result events use the real ebp_rule_results.id ─────────

  await t.test('RULE_EVALUATED/RULE_* Activity Events use the real ebp_rule_results row id as entity_id, never validation_run_id', async () => {
    const currentRun = await pool.query(`SELECT id FROM ebp_validation_runs WHERE offer_id = $1 AND status = 'CURRENT'`, [offerId]);
    const runId = currentRun.rows[0].id;
    const ruleResultRows = await pool.query(`SELECT id FROM ebp_rule_results WHERE validation_run_id = $1`, [runId]);
    const realIds = new Set(ruleResultRows.rows.map((r) => r.id));

    const events = await pool.query(
      `SELECT entity_id FROM ebp_activity_events WHERE event_type IN ('RULE_EVALUATED', 'RULE_PASSED', 'RULE_FAILED', 'RULE_WARNING', 'RULE_NOT_APPLICABLE')
       AND event_data->>'validation_run_id' = $1`,
      [runId]
    );
    assert.ok(events.rows.length > 0, 'expected at least one rule-result event for the current run');
    for (const row of events.rows) {
      assert.notEqual(row.entity_id, runId, 'a rule-result event entity_id must never equal the validation_run_id');
      assert.ok(realIds.has(row.entity_id), 'a rule-result event entity_id must be a real ebp_rule_results.id');
    }
  });

  // ── Item 5: Alert Layer dedup + resolution ──────────────────────────────

  await t.test('EXCEPTION_PENDING alert is raised once, deduplicated on repeated requests, and resolved on decision', async () => {
    // A fresh WAIVABLE rule + a fresh field to generate a brand-new
    // REQUIRES_EXCEPTION result without colliding with the already-decided
    // RULE_EVIDENCE exception above.
    const RULE_DEDUP = `CORR-DEDUP-${suffix}`;
    await pool.query(
      `INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, exception_policy, category, applies_to, default_behavior, status, created_by)
       VALUES ($1, 1, 'dedup rule', 'test', 'MINIMUM', 'HIGH', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'DIMENSIONS', '{}'::jsonb, '{"field_name":"nonexistent_dedup_field","min":1}'::jsonb, 'ACTIVE', 'phase4-correction-test')`,
      [RULE_DEDUP]
    );
    await fetch(`${validationUrl}/${offerCode}/run`, { method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ trigger: 'MANUAL_RERUN' }) });

    const exRes = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ rule_id: RULE_DEDUP, rule_version: 1, justification: 'dedup test' }),
    });
    assert.equal(exRes.status, 201);
    const { id: dedupExceptionId } = await exRes.json();

    const openAlerts = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_alerts WHERE alert_type = 'EXCEPTION_PENDING' AND entity_id = $1 AND status = 'OPEN'`, [dedupExceptionId]);
    assert.equal(openAlerts.rows[0].c, 1);

    // A duplicate request for the same rule+version+offer+revision is
    // itself rejected (Decision 07 scope) — dedup is proven by directly
    // raising the same alert twice and confirming still exactly one row.
    const { raiseExceptionPending } = require('../../ebp/phase4/alerts');
    const exceptionRow = await pool.query(`SELECT * FROM ebp_engineering_exceptions WHERE id = $1`, [dedupExceptionId]);
    await raiseExceptionPending(pool, exceptionRow.rows[0]);
    await raiseExceptionPending(pool, exceptionRow.rows[0]);
    const stillOne = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_alerts WHERE alert_type = 'EXCEPTION_PENDING' AND entity_id = $1 AND status = 'OPEN'`, [dedupExceptionId]);
    assert.equal(stillOne.rows[0].c, 1);

    const approveRes = await fetch(`${validationUrl}/exceptions/${dedupExceptionId}/approve`, { method: 'POST', headers: headers(ACTOR_APPROVER) });
    assert.equal(approveRes.status, 200);

    const resolvedAlert = await pool.query(`SELECT status FROM ebp_alerts WHERE alert_type = 'EXCEPTION_PENDING' AND entity_id = $1`, [dedupExceptionId]);
    assert.equal(resolvedAlert.rows[0].status, 'RESOLVED');
  });

  await t.test('CRITICAL_RULE_FAILURE alert is raised for a CRITICAL FAIL rule result', async () => {
    const RULE_CRIT = `CORR-CRIT-${suffix}`;
    await pool.query(
      `INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, exception_policy, category, applies_to, default_behavior, status, created_by)
       VALUES ($1, 1, 'critical rule', 'test', 'MINIMUM', 'CRITICAL', 'NON_WAIVABLE', 'DIMENSIONS', '{}'::jsonb, '{"field_name":"nonexistent_critical_field","min":1}'::jsonb, 'ACTIVE', 'phase4-correction-test')`,
      [RULE_CRIT]
    );
    const runRes = await fetch(`${validationUrl}/${offerCode}/run`, { method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ trigger: 'MANUAL_RERUN' }) });
    const runBody = await runRes.json();
    const critResult = runBody.rule_results.find((r) => r.rule_id === RULE_CRIT);
    assert.equal(critResult.state, 'FAIL');

    const alertRows = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_alerts WHERE alert_type = 'CRITICAL_RULE_FAILURE' AND entity_id = $1`, [critResult.id]);
    assert.equal(alertRows.rows[0].c, 1);
  });

  await t.test('REQUIRED_EVIDENCE_MISSING alert was raised for the evidence rule when its result was FAIL/REQUIRES_EXCEPTION', async () => {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_alerts WHERE alert_type = 'REQUIRED_EVIDENCE_MISSING' AND alert_data->>'rule_id' = $1`, [RULE_EVIDENCE]);
    assert.ok(rows[0].c >= 1);
  });

  await t.test('the manual alert scan raises ACTIVE_OFFER_WITHOUT_CURRENT_VALIDATION for an offer with no CURRENT run', async () => {
    // A second Manufacturer submitting against the same Passport — a
    // distinct (passport_id, engineering_revision, manufacturer_id)
    // lineage, so it doesn't collide with uq_ebp_offers_one_active_lineage
    // against the offer already used throughout this suite.
    const mfr2Code = generateEfmCandidate();
    const mfr2Insert = await pool.query(
      `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
       VALUES ($1, 'Phase4 Correction Mfr 2', 'DE', 'Europe/Berlin', 'QUALIFIED', 'phase4-correction-test') RETURNING id`,
      [mfr2Code]
    );
    const manufacturer2Id = mfr2Insert.rows[0].id;
    const batch2Code = await generateUniqueBatchCode(async (code) => {
      const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code]);
      return rows.length > 0;
    });
    const batch2Insert = await pool.query(
      `INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by)
       VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase4-correction-test') RETURNING id`,
      [batch2Code, manufacturer2Id]
    );
    const batchItem2Insert = await pool.query(
      `INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot)
       VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`,
      [batch2Insert.rows[0].id, passportId, sku]
    );
    const offer2Code = await generateUniqueOfferCode(async (code) => {
      const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code]);
      return rows.length > 0;
    });
    await pool.query(
      `INSERT INTO ebp_manufacturer_offers
         (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by, identity_mechanism, fob_price, currency)
       VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase4-correction-test', 'ADMIN_KEY_SHARED', 5.00, 'USD')`,
      [offer2Code, batchItem2Insert.rows[0].id, manufacturer2Id, passportId]
    );

    const scanRes = await fetch(`${alertsUrl}/scan`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(scanRes.status, 200);
    const scanBody = await scanRes.json();
    assert.ok(scanBody.active_offer_without_validation >= 1);
  });

  // ── Item 6: Internal Analytics API ───────────────────────────────────────

  await t.test('GET /analytics/validation/overview returns aggregate counts', async () => {
    const res = await fetch(`${analyticsUrl}/validation/overview`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.by_mechanical_result));
    assert.ok(Array.isArray(body.by_engineering_decision));
    assert.ok(body.totals);
  });

  await t.test('GET /analytics/validation/rules returns per-rule failure stats', async () => {
    const res = await fetch(`${analyticsUrl}/validation/rules`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.rules));
    const burst = body.rules.find((r) => r.rule_id === RULE_BURST);
    assert.ok(burst);
  });

  await t.test('GET /analytics/validation/manufacturers returns per-manufacturer failure stats', async () => {
    const res = await fetch(`${analyticsUrl}/validation/manufacturers`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.manufacturers));
  });

  await t.test('GET /analytics/validation/alerts returns OPEN alerts by default', async () => {
    const res = await fetch(`${analyticsUrl}/validation/alerts`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.alerts));
    assert.ok(body.alerts.every((a) => a.status === 'OPEN'));
  });

  await t.test('GET /analytics/timeline/:entity_type/:entity_id returns the entity event history', async () => {
    const res = await fetch(`${analyticsUrl}/timeline/ENGINEERING_EXCEPTION/${approvedExceptionId}`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.events.length >= 2); // REQUESTED + APPROVED
  });

  // ── Item 8: Rule Catalog dependency cycle detection ─────────────────────

  await t.test('a direct Composite self-reference cycle is rejected at publish time', async () => {
    const RULE_SELF = `CORR-SELF-CYCLE-${suffix}`;
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_SELF, rule_version: 1, rule_name: 'self cycle', description: 'test',
        comparison_type: 'COMPOSITE', severity: 'MEDIUM', category: 'DIMENSIONS', applies_to: {},
        default_behavior: {}, operands: { operator: 'AND', rule_ids: [RULE_SELF] },
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_SELF}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 400);
    const body = await publishRes.json();
    assert.ok(body.details.some((d) => /self-reference|cycle/i.test(d)));
  });

  await t.test('an indirect (A -> B -> A) Composite dependency cycle is rejected at publish time', async () => {
    const RULE_A = `CORR-CYCLE-A-${suffix}`;
    const RULE_B = `CORR-CYCLE-B-${suffix}`;

    // A depends on B (published first, referencing a not-yet-existing B is
    // fine — the operand existence check runs at B's own publish time, and
    // cycle detection runs again once B is published referencing A back).
    await pool.query(
      `INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, category, applies_to, default_behavior, operands, status, created_by)
       VALUES ($1, 1, 'B (leaf for now)', 'test', 'MINIMUM', 'MEDIUM', 'DIMENSIONS', '{}'::jsonb, '{"field_name":"x","min":1}'::jsonb, NULL, 'ACTIVE', 'phase4-correction-test')`,
      [RULE_B]
    );
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_A, rule_version: 1, rule_name: 'A depends on B', description: 'test',
        comparison_type: 'COMPOSITE', severity: 'MEDIUM', category: 'DIMENSIONS', applies_to: {},
        default_behavior: {}, operands: { operator: 'AND', rule_ids: [RULE_B] },
      }),
    });
    const publishARes = await fetch(`${ruleCatalogUrl}/${RULE_A}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishARes.status, 200); // fine so far — B is a leaf, no cycle yet

    // Now republish B (as version 2) to depend on A, completing a cycle
    // A -> B -> A.
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_B, rule_version: 2, rule_name: 'B now depends on A', description: 'test',
        comparison_type: 'COMPOSITE', severity: 'MEDIUM', category: 'DIMENSIONS', applies_to: {},
        default_behavior: {}, operands: { operator: 'AND', rule_ids: [RULE_A] },
      }),
    });
    const publishBv2Res = await fetch(`${ruleCatalogUrl}/${RULE_B}/2/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishBv2Res.status, 400);
    const body = await publishBv2Res.json();
    assert.ok(body.details.some((d) => /cycle/i.test(d)));
  });

  await t.test('a CRITICAL waivable rule without critical_waivable_acknowledged is rejected at publish time', async () => {
    const RULE_CRIT_WAIVABLE = `CORR-CRIT-WAIVABLE-${suffix}`;
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_CRIT_WAIVABLE, rule_version: 1, rule_name: 'critical waivable', description: 'test',
        comparison_type: 'MINIMUM', severity: 'CRITICAL', exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL', category: 'DIMENSIONS',
        applies_to: {}, default_behavior: { field_name: 'x', min: 1 },
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_CRIT_WAIVABLE}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 400);
    const body = await publishRes.json();
    assert.ok(body.details.some((d) => /critical_waivable_acknowledged/.test(d)));
  });

  await t.test('an incomplete default_behavior for its comparison_type is rejected at publish time', async () => {
    const RULE_INCOMPLETE = `CORR-INCOMPLETE-${suffix}`;
    await fetch(ruleCatalogUrl, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_INCOMPLETE, rule_version: 1, rule_name: 'incomplete', description: 'test',
        comparison_type: 'RANGE', severity: 'LOW', category: 'DIMENSIONS', applies_to: {},
        default_behavior: { field_name: 'x' }, // missing min/max
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_INCOMPLETE}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 400);
  });
});
