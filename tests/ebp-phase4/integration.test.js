'use strict';

// EBP Phase 4 — integration tests against a real Postgres instance running
// the actual migrations/ebp-phase4/ schema (on top of Phase 1-3 fixtures).
// Exercises the full HTTP surface end-to-end (no mocks). Skips with a clear
// message if the database is unreachable.
//
// Run: node --test tests/ebp-phase4/integration.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const { createValidationRouter, createRuleCatalogRouter, createRolesRouter } = require('../../ebp/phase4/internal.routes');
const { generateCandidate: generateEfmCandidate } = require('../../ebp/phase2/efm-code');
const { generateUniqueBatchCode, generateUniqueOfferCode } = require('../../ebp/phase3/codes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase4';

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
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return {
    server,
    validationUrl: `http://127.0.0.1:${port}/api/ebp/internal/validation`,
    ruleCatalogUrl: `http://127.0.0.1:${port}/api/ebp/internal/rule-catalog`,
    rolesUrl: `http://127.0.0.1:${port}/api/ebp/internal/roles`,
  };
}

function headers(actor, extra = {}) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', 'x-ebp-actor': actor, ...extra };
}


test('EBP Phase 4 — Engineering Compliance Validation integration', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 4 integration tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const { server, validationUrl, ruleCatalogUrl, rolesUrl } = await startTestServer(pool);

  const suffix = Date.now().toString().slice(-6);
  const actorPattern = `test-%-${suffix}`;
  const rulePattern = `RULE-%-${suffix}`;

  t.after(async () => {
    server.close();
    // Cleanup so a later run can bootstrap its own fresh ADMIN_OWNER again
    // (this suite's ADMIN_OWNER bootstrap only ever succeeds once while any
    // ADMIN_OWNER assignment exists — by design, see Decision 01, ADR-0039).
    await pool.query(
      `DELETE FROM ebp_engineering_conditions WHERE engineering_decision_id IN
         (SELECT id FROM ebp_engineering_decisions WHERE decided_by LIKE $1)`,
      [actorPattern]
    );
    await pool.query(`DELETE FROM ebp_engineering_decisions WHERE decided_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_engineering_exceptions WHERE requested_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_rule_results WHERE rule_id LIKE $1`, [rulePattern]);
    await pool.query(`DELETE FROM ebp_validation_runs WHERE created_by LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_rule_versions WHERE rule_id LIKE $1`, [rulePattern]);
    await pool.query(`DELETE FROM ebp_engineering_role_assignments WHERE declared_actor LIKE $1`, [actorPattern]);
    await pool.query(`DELETE FROM ebp_activity_events WHERE declared_actor LIKE $1`, [actorPattern]);
    await pool.end();
  });

  // ── Fixtures: Passport (Phase 1) + Manufacturer (Phase 2) + Offer (Phase 3) ──

  const sku = `ELP4TEST${suffix}`;
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [sku]);

  const passportInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase4-test') RETURNING id`,
    [sku]
  );
  const passportId = passportInsert.rows[0].id;
  await pool.query(
    `INSERT INTO ebp_passport_engineering (passport_id, thread_spec, burst_pressure_kpa) VALUES ($1, 'M18x1.5', 500)`,
    [passportId]
  );
  await pool.query(
    `INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity) VALUES ($1, 'AUTOMOTIVE', TRUE, 24)`,
    [passportId]
  );

  const mfrCode = generateEfmCandidate();
  const mfrInsert = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, 'Phase4 Test Mfr', 'CN', 'Asia/Shanghai', 'QUALIFIED', 'phase4-test') RETURNING id`,
    [mfrCode]
  );
  const manufacturerId = mfrInsert.rows[0].id;

  const batchCode = await generateUniqueBatchCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code]);
    return rows.length > 0;
  });
  const batchInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by)
     VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase4-test') RETURNING id`,
    [batchCode, manufacturerId]
  );
  const batchId = batchInsert.rows[0].id;
  const batchItemInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot)
     VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`,
    [batchId, passportId, sku]
  );
  const batchItemId = batchItemInsert.rows[0].id;

  const offerCode = await generateUniqueOfferCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code]);
    return rows.length > 0;
  });
  const offerInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_offers
       (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by, identity_mechanism, fob_price, currency)
     VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase4-test', 'ADMIN_KEY_SHARED', 12.50, 'USD') RETURNING id`,
    [offerCode, batchItemId, manufacturerId, passportId]
  );
  const offerId = offerInsert.rows[0].id;

  await pool.query(
    `INSERT INTO ebp_manufacturer_offer_technical_fields (offer_id, field_name, offered_value) VALUES
       ($1, 'burst_pressure_kpa', '400'::jsonb),
       ($1, 'thread_spec', '"M18x1.5"'::jsonb)`,
    [offerId]
  );

  const RULE_BURST = `RULE-BURST-MIN-${suffix}`;
  const RULE_THREAD = `RULE-THREAD-MATCH-${suffix}`;
  const RULE_EVIDENCE = `RULE-CERT-EVIDENCE-${suffix}`;
  const ACTOR_OWNER = `test-owner-${suffix}`;
  const ACTOR_APPROVER = `test-approver-${suffix}`;
  const ACTOR_REVIEWER = `test-reviewer-${suffix}`;

  // ── 1. Role bootstrap (Decision 01, ADR-0039) ────────────────────────────

  await t.test('bootstraps the first ADMIN_OWNER with no prior role required', async () => {
    const res = await fetch(rolesUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({ declared_actor: ACTOR_OWNER, role: 'ADMIN_OWNER' }),
    });
    assert.equal(res.status, 201);
  });

  await t.test('a second ADMIN_OWNER assignment now requires the caller to already hold ADMIN_OWNER', async () => {
    const res = await fetch(rolesUrl, {
      method: 'POST',
      headers: headers('some-random-actor'),
      body: JSON.stringify({ declared_actor: 'test-owner-2', role: 'ADMIN_OWNER' }),
    });
    assert.equal(res.status, 403);
  });

  await t.test('the bootstrapped ADMIN_OWNER can assign ENGINEERING_APPROVER and ENGINEERING_REVIEWER', async () => {
    const r1 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_APPROVER, role: 'ENGINEERING_APPROVER' }) });
    assert.equal(r1.status, 201);
    const r2 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_REVIEWER, role: 'ENGINEERING_REVIEWER' }) });
    assert.equal(r2.status, 201);
  });

  // ── 2. Rule Catalog lifecycle (Decision 10, ADR-0048) ────────────────────

  await t.test('creates and publishes a NON_WAIVABLE HIGH MINIMUM rule', async () => {
    const createRes = await fetch(ruleCatalogUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_BURST,
        rule_version: 1,
        rule_name: 'Minimum burst pressure',
        description: 'Offered burst pressure must meet the Passport minimum.',
        comparison_type: 'MINIMUM',
        severity: 'HIGH',
        exception_policy: 'NON_WAIVABLE',
        category: 'BURST_PRESSURE',
        applies_to: { product_category: ['OIL'] },
        default_behavior: { field_name: 'burst_pressure_kpa', target_source: 'PASSPORT_FIELD', target_field: 'burst_pressure_kpa', min: 500 },
      }),
    });
    assert.equal(createRes.status, 201);
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_BURST}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 200);
    const body = await publishRes.json();
    assert.equal(body.status, 'ACTIVE');
  });

  await t.test('creates and publishes a MEDIUM EXACT_MATCH thread rule (target dynamically resolved from the Passport spec)', async () => {
    await fetch(ruleCatalogUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_THREAD,
        rule_version: 1,
        rule_name: 'Thread spec exact match',
        description: 'Offered thread spec must exactly match the Passport requirement.',
        comparison_type: 'EXACT_MATCH',
        severity: 'MEDIUM',
        exception_policy: 'WAIVABLE_WITH_CONDITIONS',
        category: 'THREAD',
        applies_to: { product_category: ['OIL'] },
        default_behavior: { field_name: 'thread_spec', target_source: 'PASSPORT_FIELD', target_field: 'thread_spec' },
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_THREAD}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 200);
  });

  await t.test('creates and publishes a HIGH WAIVABLE REQUIRED_EVIDENCE rule', async () => {
    await fetch(ruleCatalogUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_EVIDENCE,
        rule_version: 1,
        rule_name: 'Certification evidence required',
        description: 'A certification document must be attached.',
        comparison_type: 'REQUIRED_EVIDENCE',
        severity: 'HIGH',
        exception_policy: 'WAIVABLE_WITH_ENGINEERING_APPROVAL',
        category: 'CERTIFICATION',
        applies_to: { product_category: ['OIL'] },
        default_behavior: { field_name: 'burst_pressure_kpa' },
      }),
    });
    const publishRes = await fetch(`${ruleCatalogUrl}/${RULE_EVIDENCE}/1/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 200);
  });

  await t.test('creating a duplicate rule_id + rule_version is rejected (published versions are never edited)', async () => {
    const res = await fetch(ruleCatalogUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        rule_id: RULE_BURST, rule_version: 1, rule_name: 'dup', description: 'dup',
        comparison_type: 'MINIMUM', severity: 'HIGH', category: 'BURST_PRESSURE',
        applies_to: {}, default_behavior: { field_name: 'burst_pressure_kpa', min: 1 },
      }),
    });
    assert.equal(res.status, 409);
  });

  // ── 3. First Validation Run — burst FAILs (blocking, NON_WAIVABLE) ───────

  let firstRunId;
  await t.test('running validation produces MECHANICALLY_FAIL because the NON_WAIVABLE burst rule fails', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/run`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ trigger: 'INITIAL' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.validation_run.mechanical_result, 'MECHANICALLY_FAIL');
    assert.equal(body.validation_run.mechanically_eligible_for_approval, false);
    firstRunId = body.validation_run.id;

    const burstResult = body.rule_results.find((r) => r.rule_id === RULE_BURST);
    assert.equal(burstResult.state, 'FAIL');
    const threadResult = body.rule_results.find((r) => r.rule_id === RULE_THREAD);
    assert.equal(threadResult.state, 'PASS');
    const evidenceResult = body.rule_results.find((r) => r.rule_id === RULE_EVIDENCE);
    assert.equal(evidenceResult.state, 'REQUIRES_EXCEPTION');
    assert.ok(evidenceResult.observation_text.length > 0);

    // An auto-created PENDING_REVIEW decision always exists (Decision 09).
    assert.equal(body.engineering_decision.decision, 'PENDING_REVIEW');
  });

  await t.test('the coarse compliance_status projection was written for fields with a matching rule (consistency-audit fix)', async () => {
    const { rows } = await pool.query(`SELECT field_name, compliance_status FROM ebp_manufacturer_offer_technical_fields WHERE offer_id = $1 ORDER BY field_name`, [offerId]);
    const burstField = rows.find((r) => r.field_name === 'burst_pressure_kpa');
    assert.equal(burstField.compliance_status, 'NON_COMPLIANT');
  });

  await t.test('Activity Events were recorded for the run (ADR-0037, first real implementation)', async () => {
    const { rows } = await pool.query(`SELECT event_type FROM ebp_activity_events WHERE offer_id = $1 ORDER BY event_timestamp`, [offerId]);
    const types = rows.map((r) => r.event_type);
    assert.ok(types.includes('VALIDATION_RUN_CREATED'));
    assert.ok(types.includes('RULE_FAILED'));
    assert.ok(types.includes('VALIDATION_COMPLETED'));
  });

  // ── 4. Fix the failing offer field, re-validate (Decision 12 full coarse invalidation) ──

  await t.test('correcting the offered value and re-running creates a NEW Validation Run, marking the old one STALE', async () => {
    await pool.query(`UPDATE ebp_manufacturer_offer_technical_fields SET offered_value = '600'::jsonb WHERE offer_id = $1 AND field_name = 'burst_pressure_kpa'`, [offerId]);

    const res = await fetch(`${validationUrl}/${offerCode}/run`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ trigger: 'EVIDENCE_CHANGED' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.notEqual(body.validation_run.id, firstRunId);
    assert.equal(body.validation_run.mechanical_result, 'REQUIRES_ENGINEERING_REVIEW');

    const staleRow = await pool.query(`SELECT status, superseded_by FROM ebp_validation_runs WHERE id = $1`, [firstRunId]);
    assert.equal(staleRow.rows[0].status, 'STALE');
    assert.equal(staleRow.rows[0].superseded_by, body.validation_run.id);

    const currentCount = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_validation_runs WHERE offer_id = $1 AND status = 'CURRENT'`, [offerId]);
    assert.equal(currentCount.rows[0].c, 1);
  });

  await t.test('validation history shows both runs in creation order', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/history`, { headers: headers(ACTOR_REVIEWER) });
    const body = await res.json();
    assert.equal(body.runs.length, 2);
    assert.equal(body.runs[0].status, 'STALE');
    assert.equal(body.runs[1].status, 'CURRENT');
  });

  // ── 5. Engineering Exception flow (Decision 07, ADR-0045) ────────────────

  let exceptionId;
  await t.test('a NON_WAIVABLE rule can never receive an exception request', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ rule_id: RULE_BURST, rule_version: 1, justification: 'please waive' }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('requesting an exception for the WAIVABLE evidence rule succeeds for a reviewer', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ rule_id: RULE_EVIDENCE, rule_version: 1, justification: 'Certificate on file, awaiting digitization.' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'REQUESTED');
    exceptionId = body.id;
  });

  await t.test('requesting a second exception for the same offer+revision+rule+version is rejected (Decision 07 scope)', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ rule_id: RULE_EVIDENCE, rule_version: 1, justification: 'duplicate attempt' }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('an actor with no engineering role cannot approve an exception', async () => {
    const res = await fetch(`${validationUrl}/exceptions/${exceptionId}/approve`, { method: 'POST', headers: headers('random-actor') });
    assert.equal(res.status, 403);
  });

  await t.test('an ENGINEERING_REVIEWER (not APPROVER) cannot approve an exception', async () => {
    const res = await fetch(`${validationUrl}/exceptions/${exceptionId}/approve`, { method: 'POST', headers: headers(ACTOR_REVIEWER) });
    assert.equal(res.status, 403);
  });

  await t.test('an ENGINEERING_APPROVER can approve the exception', async () => {
    const res = await fetch(`${validationUrl}/exceptions/${exceptionId}/approve`, { method: 'POST', headers: headers(ACTOR_APPROVER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'APPROVED');
  });

  // ── 6. Engineering Decision (Decision 08/09, ADR-0046/0047) ──────────────

  await t.test('an ENGINEERING_REVIEWER cannot record an Engineering Decision', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/decisions`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ decision: 'APPROVED' }),
    });
    assert.equal(res.status, 403);
  });

  await t.test('CONDITIONALLY_APPROVED without any condition is rejected', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/decisions`, {
      method: 'POST',
      headers: headers(ACTOR_APPROVER),
      body: JSON.stringify({ decision: 'CONDITIONALLY_APPROVED' }),
    });
    assert.equal(res.status, 400);
  });

  let decisionId;
  let conditionId;
  await t.test('an ENGINEERING_APPROVER records CONDITIONALLY_APPROVED with one structured condition', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}/decisions`, {
      method: 'POST',
      headers: headers(ACTOR_APPROVER),
      body: JSON.stringify({
        decision: 'CONDITIONALLY_APPROVED',
        notes: 'Approved pending digitized certificate.',
        conditions: [{
          condition_type: 'EVIDENCE_SUBMISSION',
          description: 'Submit digitized certification document',
          requirement: 'Upload the current certification PDF',
          responsible_party: mfrCode,
          required_evidence: 'Certification PDF',
        }],
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.decision, 'CONDITIONALLY_APPROVED');
    assert.equal(body.conditions.length, 1);
    assert.equal(body.conditions[0].status, 'OPEN');
    decisionId = body.id;
    conditionId = body.conditions[0].id;
  });

  await t.test('the engine itself never grants Engineering Approval — every decision is human-recorded, never auto-set to APPROVED', async () => {
    const { rows } = await pool.query(`SELECT decided_by, decision FROM ebp_engineering_decisions WHERE id = $1`, [decisionId]);
    assert.equal(rows[0].decided_by, ACTOR_APPROVER);
    assert.notEqual(rows[0].decision, 'PENDING_REVIEW');
  });

  await t.test('updating the condition to SATISFIED sets satisfied_at and emits ENGINEERING_CONDITION_SATISFIED', async () => {
    const res = await fetch(`${validationUrl}/conditions/${conditionId}/status`, {
      method: 'POST',
      headers: headers(ACTOR_APPROVER),
      body: JSON.stringify({ status: 'SATISFIED' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'SATISFIED');
    assert.ok(body.satisfied_at);

    const { rows } = await pool.query(`SELECT event_type FROM ebp_activity_events WHERE entity_id = $1 AND event_type = 'ENGINEERING_CONDITION_SATISFIED'`, [conditionId]);
    assert.equal(rows.length, 1);
  });

  // ── 7. Read surfaces: summary DTO + analytics view ───────────────────────

  await t.test('GET /validation/:offer_code returns the full three-way Global Result Model summary', async () => {
    const res = await fetch(`${validationUrl}/${offerCode}`, { headers: headers(ACTOR_REVIEWER) });
    const body = await res.json();
    assert.equal(body.validation_run.status, 'CURRENT');
    assert.equal(body.engineering_decision.decision, 'CONDITIONALLY_APPROVED');
    assert.equal(body.exceptions.length, 1);
    assert.equal(body.exceptions[0].status, 'APPROVED');
    assert.equal(body.conditions.length, 1);
    assert.equal(body.conditions[0].status, 'SATISFIED');
    // Mechanical Compliance Result and Engineering Decision are always
    // distinct fields, never merged into one column (ADR-0051).
    assert.notEqual(body.validation_run.mechanical_result, body.engineering_decision.decision);
  });

  await t.test('the analytics view exposes the current summary with open-exception/condition counts (ADR-0037 §8.3)', async () => {
    const { rows } = await pool.query(`SELECT * FROM ebp_analytics_validation_summary WHERE offer_id = $1`, [offerId]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].engineering_decision, 'CONDITIONALLY_APPROVED');
    assert.equal(Number(rows[0].open_exceptions), 0);
    assert.equal(Number(rows[0].open_conditions), 0);
  });

  await t.test('rejecting an exception request is also tracked distinctly from approval', async () => {
    // A fresh rule + a fresh REQUIRES_EXCEPTION result is needed to exercise
    // the reject path without colliding with the already-APPROVED exception.
    const RULE_REJECT = `RULE-REJECT-${suffix}`;
    await pool.query(
      `INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, exception_policy, category, applies_to, default_behavior, status, created_by)
       VALUES ($1, 1, 'reject-path rule', 'test', 'MINIMUM', 'HIGH', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'DIMENSIONS', '{}'::jsonb, '{"field_name":"nonexistent_field","min":1}'::jsonb, 'ACTIVE', 'phase4-test')`,
      [RULE_REJECT]
    );
    const runRes = await fetch(`${validationUrl}/${offerCode}/run`, { method: 'POST', headers: headers(ACTOR_REVIEWER), body: JSON.stringify({ trigger: 'MANUAL_RERUN' }) });
    assert.equal(runRes.status, 201);

    const reqRes = await fetch(`${validationUrl}/${offerCode}/exceptions`, {
      method: 'POST',
      headers: headers(ACTOR_REVIEWER),
      body: JSON.stringify({ rule_id: RULE_REJECT, rule_version: 1, justification: 'testing reject path' }),
    });
    assert.equal(reqRes.status, 201);
    const { id: rejectExceptionId } = await reqRes.json();

    const rejectRes = await fetch(`${validationUrl}/exceptions/${rejectExceptionId}/reject`, { method: 'POST', headers: headers(ACTOR_APPROVER) });
    assert.equal(rejectRes.status, 200);
    const rejected = await rejectRes.json();
    assert.equal(rejected.status, 'REJECTED');

    const { rows } = await pool.query(`SELECT event_type FROM ebp_activity_events WHERE entity_id = $1`, [rejectExceptionId]);
    assert.ok(rows.some((r) => r.event_type === 'ENGINEERING_EXCEPTION_REJECTED'));
  });
});
