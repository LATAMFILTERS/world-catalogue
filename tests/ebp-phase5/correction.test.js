'use strict';

// EBP Phase 5 — architecture-review correction round tests (2026-07-13):
// exception penalty (Technical Priority Rule), tie-break "engine never
// guesses," SELECTION_SUPERSEDED/SELECTION_MARKED_STALE events, Alert Layer
// resolution, and mixed-currency INSUFFICIENT_DATA. Real Postgres, no mocks.
//
// Run: node --test tests/ebp-phase5/correction.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const phase5Routes = require('../../ebp/phase5/internal.routes');
const { generateUniqueManufacturerCode } = require('../../ebp/phase2/efm-code');
const { generateUniqueBatchCode, generateUniqueOfferCode } = require('../../ebp/phase3/codes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase5-correction';

function requireAdmin(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!key || key !== TEST_ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
}

async function startTestServer(pool) {
  const app = express();
  app.use(express.json());
  app.use('/api/ebp/internal/selection', requireAdmin, phase5Routes.createSelectionRouter(pool));
  app.use('/api/ebp/internal/commercial-approval', requireAdmin, phase5Routes.createCommercialApprovalRouter(pool));
  app.use('/api/ebp/internal/selection-policy', requireAdmin, phase5Routes.createSelectionPolicyRouter(pool));
  app.use('/api/ebp/internal/selection-roles', requireAdmin, phase5Routes.createRolesRouter(pool));
  app.use('/api/ebp/internal/alerts', requireAdmin, phase5Routes.createAlertsRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api/ebp/internal`;
  return { server, selectionUrl: `${base}/selection`, commercialApprovalUrl: `${base}/commercial-approval`, policyUrl: `${base}/selection-policy`, rolesUrl: `${base}/selection-roles`, alertsUrl: `${base}/alerts` };
}

function headers(actor) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', 'x-ebp-actor': actor };
}

async function createManufacturer(pool, { name, country, category, subtype }) {
  const mfrCode = await generateUniqueManufacturerCode(
    async (candidate) => (await pool.query('SELECT 1 FROM ebp_manufacturers WHERE manufacturer_code = $1', [candidate])).rows.length > 0
  );
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, $2, $3, 'UTC', 'QUALIFIED', 'phase5-correction-test') RETURNING id`,
    [mfrCode, name, country]
  );
  const manufacturerId = rows[0].id;
  const locInsert = await pool.query(`INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1, 'FACTORY', $2, 'UTC') RETURNING id`, [manufacturerId, country]);
  await pool.query(`INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype, status) VALUES ($1, $2, $3, $4, 'QUALIFIED')`, [manufacturerId, locInsert.rows[0].id, category, subtype]);
  return manufacturerId;
}

async function createOfferWithApprovedEngineering(pool, { passportId, manufacturerId, fob, currency = 'USD', leadTime, capacity, suffix }) {
  const batchCode = await generateUniqueBatchCode(async (code) => (await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code])).rows.length > 0);
  const batchInsert = await pool.query(`INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by) VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase5-correction-test') RETURNING id`, [batchCode, manufacturerId]);
  const batchItemInsert = await pool.query(`INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot) VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`, [batchInsert.rows[0].id, passportId, `ELP5C${suffix}`]);
  const offerCode = await generateUniqueOfferCode(async (code) => (await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code])).rows.length > 0);
  const offerInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_offers (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by, identity_mechanism, fob_price, currency, lead_time_days, monthly_capacity, offer_validity_until)
     VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase5-correction-test', 'ADMIN_KEY_SHARED', $5, $6, $7, $8, CURRENT_DATE + INTERVAL '90 days') RETURNING id, offer_code, offer_revision`,
    [offerCode, batchItemInsert.rows[0].id, manufacturerId, passportId, fob, currency, leadTime, capacity]
  );
  const offer = offerInsert.rows[0];
  const runInsert = await pool.query(
    `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, mechanically_eligible_for_approval, trigger, input_versions, status, created_by)
     VALUES ($1, 1, $2, $3, 1, 'MECHANICALLY_PASS', TRUE, 'INITIAL', '{}'::jsonb, 'CURRENT', 'phase5-correction-test') RETURNING id`,
    [passportId, manufacturerId, offer.id]
  );
  await pool.query(`INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by, status) VALUES ($1, 'APPROVED', 'phase5-correction-test', 'CURRENT')`, [runInsert.rows[0].id]);
  return offer;
}

async function createPassport(pool, sku) {
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [sku]);
  const { rows } = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase5-correction-test') RETURNING id`,
    [sku]
  );
  return rows[0].id;
}

test('EBP Phase 5 — architecture-review correction round', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 5 correction tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const { server, selectionUrl, commercialApprovalUrl, policyUrl, rolesUrl, alertsUrl } = await startTestServer(pool);
  const suffix = `${Date.now().toString().slice(-6)}c`;
  const ACTOR_OWNER = `test-sel-owner-${suffix}`;
  const ACTOR_COMMERCIAL = `test-sel-commercial-${suffix}`;

  await pool.query('DELETE FROM ebp_selection_admin_bootstrap');

  t.after(async () => {
    server.close();
    await pool.query(`DELETE FROM ebp_engineering_exceptions WHERE rule_id LIKE $1`, [`RULE-CORRTEST-${suffix}`]);
    await pool.query(`DELETE FROM ebp_rule_versions WHERE rule_id LIKE $1`, [`RULE-CORRTEST-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_decisions WHERE decided_by LIKE $1 OR decided_by IS NULL`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_factor_scores WHERE selection_candidate_id IN (SELECT id FROM ebp_selection_candidates WHERE selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE triggered_by LIKE $1))`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_candidates WHERE selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE triggered_by LIKE $1)`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_runs WHERE triggered_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_offer_commercial_approvals WHERE decided_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_policies WHERE created_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_role_assignments WHERE declared_actor LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_activity_events WHERE declared_actor LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query('DELETE FROM ebp_selection_admin_bootstrap');
    await pool.end();
  });

  await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_OWNER, role: 'ADMIN_OWNER' }) });
  await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_COMMERCIAL, role: 'COMMERCIAL_APPROVER' }) });
  const policyRes = await fetch(policyUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ policy_code: `SELPOL-CORR-${suffix}`, name: 'Correction', scope_type: 'PLATFORM', weights: { ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 }, penalties: { approved_exception_penalty: 15 } }) });
  const policy = await policyRes.json();
  await fetch(`${policyUrl}/${policy.id}/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });

  // ── 1. Technical Priority Rule: an Offer with an APPROVED Exception scores lower ──

  await t.test('an Offer carrying an APPROVED Exception scores lower than an identical clean Offer', async () => {
    const sku = `ELP5EXC${suffix}`;
    const passportId = await createPassport(pool, sku);
    const mfrClean = await createManufacturer(pool, { name: 'Clean Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const mfrException = await createManufacturer(pool, { name: 'Exception Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const cleanOffer = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrClean, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}CLEAN` });
    const exceptionOffer = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrException, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}EXC` });

    // Record a real Phase 4 APPROVED Exception against exceptionOffer.
    const ruleVersionInsert = await pool.query(
      `INSERT INTO ebp_rule_versions (rule_id, rule_version, rule_name, description, comparison_type, severity, exception_policy, category, applies_to, default_behavior, status, created_by)
       VALUES ($1, 1, 'Test rule', 'Test rule for correction-round Exception fixture.', 'MINIMUM', 'HIGH', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'DOCUMENTATION', '{}'::jsonb, '{}'::jsonb, 'ACTIVE', 'phase5-correction-test') RETURNING rule_id, rule_version`,
      [`RULE-CORRTEST-${suffix}`]
    );
    const rv = ruleVersionInsert.rows[0];
    await pool.query(
      `INSERT INTO ebp_engineering_exceptions (offer_id, offer_revision, rule_id, rule_version, requested_by, status, approved_by, approved_at, justification)
       VALUES ($1, 1, $2, $3, 'phase5-correction-test', 'APPROVED', 'phase5-correction-test', NOW(), 'test justification')`,
      [exceptionOffer.id, rv.rule_id, rv.rule_version]
    );

    await fetch(`${commercialApprovalUrl}/${cleanOffer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });
    await fetch(`${commercialApprovalUrl}/${exceptionOffer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const body = await runRes.json();
    assert.equal(runRes.status, 201);
    assert.equal(body.run.run_result, 'RECOMMENDATION_READY');

    const cleanCandidate = body.candidates.find((c) => c.offer_id === cleanOffer.id);
    const exceptionCandidate = body.candidates.find((c) => c.offer_id === exceptionOffer.id);
    const cleanEngFactor = cleanCandidate.factor_scores.find((f) => f.factor_code === 'ENGINEERING_ELIGIBILITY');
    const exceptionEngFactor = exceptionCandidate.factor_scores.find((f) => f.factor_code === 'ENGINEERING_ELIGIBILITY');

    assert.equal(Number(cleanEngFactor.penalty), 0);
    assert.equal(Number(exceptionEngFactor.penalty), 15);
    assert.ok(Number(exceptionEngFactor.normalized_value) < Number(cleanEngFactor.normalized_value), 'the Exception-carrying Offer must score lower on the Engineering factor');
    assert.ok(Number(exceptionCandidate.composite_score_final) < Number(cleanCandidate.composite_score_final), 'the Exception-carrying Offer must have a lower overall composite score, all else equal');
    assert.equal(exceptionEngFactor.reason_code, 'SEL_REASON_TECHNICAL_EXCEPTION_PENALTY');
  });

  // ── 2. Tie-break: the engine never guesses ──────────────────────────────

  await t.test('a full eight-step tie produces TIE_REQUIRES_HUMAN_REVIEW with no tier assigned to any candidate', async () => {
    const sku = `ELP5TIE${suffix}`;
    const passportId = await createPassport(pool, sku);
    const mfr1 = await createManufacturer(pool, { name: 'Tie Mfr A', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const mfr2 = await createManufacturer(pool, { name: 'Tie Mfr B', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const offerA = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr1, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}TIEA` });
    const offerB = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr2, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}TIEB` });
    await fetch(`${commercialApprovalUrl}/${offerA.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });
    await fetch(`${commercialApprovalUrl}/${offerB.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const body = await runRes.json();
    assert.equal(body.run.run_result, 'TIE_REQUIRES_HUMAN_REVIEW');
    assert.ok(body.candidates.every((c) => c.tier === 'NONE'), 'the engine must never guess a tier assignment on an unresolved tie');

    const alertsRes = await fetch(`${alertsUrl}?alert_type=TIE_REQUIRES_REVIEW`, { headers: headers(ACTOR_OWNER) });
    const alertsBody = await alertsRes.json();
    assert.ok(alertsBody.alerts.some((a) => a.entity_id === body.run.id), 'a TIE_REQUIRES_REVIEW alert must be raised for this run');
  });

  // ── 3. SELECTION_SUPERSEDED / SELECTION_MARKED_STALE events ─────────────

  await t.test('re-selection emits both SELECTION_MARKED_STALE and SELECTION_SUPERSEDED for the superseded run', async () => {
    const sku = `ELP5EVT${suffix}`;
    const passportId = await createPassport(pool, sku);
    const mfr = await createManufacturer(pool, { name: 'Event Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const offer = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}EVT` });
    await fetch(`${commercialApprovalUrl}/${offer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

    const firstRunRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const firstRun = (await firstRunRes.json()).run;

    await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });

    const { rows: events } = await pool.query(
      `SELECT event_type FROM ebp_activity_events WHERE entity_id = $1 AND event_type IN ('SELECTION_MARKED_STALE', 'SELECTION_SUPERSEDED')`,
      [firstRun.id]
    );
    const types = events.map((e) => e.event_type).sort();
    assert.deepEqual(types, ['SELECTION_MARKED_STALE', 'SELECTION_SUPERSEDED']);
  });

  // ── 4. Alert resolution: NO_ELIGIBLE_MANUFACTURER closes once eligibility is restored ──

  await t.test('NO_ELIGIBLE_MANUFACTURER resolves once a later Selection Run finds an eligible Primary', async () => {
    const sku = `ELP5ALERT${suffix}`;
    const passportId = await createPassport(pool, sku);

    const noEligibleRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const noEligibleBody = await noEligibleRes.json();
    assert.equal(noEligibleBody.run.run_result, 'NO_ELIGIBLE_CANDIDATE');

    const openAlerts = await (await fetch(`${alertsUrl}?alert_type=NO_ELIGIBLE_MANUFACTURER&status=OPEN`, { headers: headers(ACTOR_OWNER) })).json();
    assert.ok(openAlerts.alerts.some((a) => a.entity_id === passportId), 'NO_ELIGIBLE_MANUFACTURER must be open while no eligible Offer exists');

    const mfr = await createManufacturer(pool, { name: 'Alert Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const offer = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}ALERT` });
    await fetch(`${commercialApprovalUrl}/${offer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });
    const readyRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const readyBody = await readyRes.json();
    assert.equal(readyBody.run.run_result, 'RECOMMENDATION_READY');

    const stillOpenAlerts = await (await fetch(`${alertsUrl}?alert_type=NO_ELIGIBLE_MANUFACTURER&status=OPEN`, { headers: headers(ACTOR_OWNER) })).json();
    assert.ok(!stillOpenAlerts.alerts.some((a) => a.entity_id === passportId), 'NO_ELIGIBLE_MANUFACTURER must resolve once an eligible Primary is found');
  });

  // ── 5. Mixed currency -> INSUFFICIENT_DATA (never a fake FX conversion) ──

  await t.test('mixed currencies among eligible Offers produce INSUFFICIENT_DATA, never a silent cross-currency ranking', async () => {
    const sku = `ELP5CCY${suffix}`;
    const passportId = await createPassport(pool, sku);
    const mfrUsd = await createManufacturer(pool, { name: 'USD Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const mfrEur = await createManufacturer(pool, { name: 'EUR Mfr', country: 'DE', category: 'OIL', subtype: 'SPIN_ON' });
    const offerUsd = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrUsd, fob: 10, currency: 'USD', leadTime: 30, capacity: 5000, suffix: `${suffix}USD` });
    const offerEur = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrEur, fob: 9, currency: 'EUR', leadTime: 30, capacity: 5000, suffix: `${suffix}EUR` });
    await fetch(`${commercialApprovalUrl}/${offerUsd.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });
    await fetch(`${commercialApprovalUrl}/${offerEur.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const body = await runRes.json();
    assert.equal(body.run.run_result, 'INSUFFICIENT_DATA');
    assert.equal(body.candidates.length, 0);
  });

  // ── 6. Concurrency: no self-deadlock, no data corruption ────────────────

  await t.test('ten concurrent Selection Runs against the same Passport never deadlock and never corrupt the Selection Version sequence', async () => {
    const service = require('../../ebp/phase5/service');
    const sku = `ELP5RACE${suffix}`;
    const passportId = await createPassport(pool, sku);
    const mfr = await createManufacturer(pool, { name: 'Race Mfr', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const offer = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}RACE` });
    await fetch(`${commercialApprovalUrl}/${offer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

    const actor = { declared_actor: ACTOR_OWNER, identity_mechanism: 'ADMIN_KEY_SHARED' };
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => service.runSelection(pool, passportId, 'MANUAL_TRIGGER', actor))
    );
    // Every call must settle (never hang — the connection-pool self-deadlock
    // this test exists to catch would otherwise time out the whole suite).
    assert.equal(results.length, 10);
    const rejected = results.filter((r) => r.status === 'rejected');
    // Losers of the race must see a clean ConflictError, never a raw
    // Postgres constraint-violation leak.
    for (const r of rejected) {
      assert.match(r.reason.message, /concurrent Selection Run/);
    }

    const { rows: runs } = await pool.query('SELECT selection_version, run_result FROM ebp_selection_runs WHERE passport_id = $1', [passportId]);
    const versions = runs.map((r) => r.selection_version);
    assert.equal(new Set(versions).size, versions.length, 'no duplicate selection_version — the UNIQUE constraint must never be silently bypassed');
    const { rows: currentRuns } = await pool.query(`SELECT COUNT(*)::int AS c FROM ebp_selection_runs WHERE passport_id = $1 AND run_result <> 'STALE'`, [passportId]);
    assert.equal(currentRuns[0].c, 1, 'exactly one non-STALE Selection Run must exist after the race resolves');
  });

  // ── 7. GEOGRAPHIC_DIVERSIFICATION is real, pool-derived data — never a hardcoded constant ──

  await t.test('GEOGRAPHIC_DIVERSIFICATION reflects real pool composition and a rarer-country candidate outranks an otherwise-identical common-country candidate', async () => {
    const sku = `ELP5DIV${suffix}`;
    const passportId = await createPassport(pool, sku);
    // Two manufacturers share CN, one is alone in DE — all three offers are
    // otherwise identical (same FOB/lead time/capacity/no exceptions), so
    // only GEOGRAPHIC_DIVERSIFICATION (STRATEGIC category) can distinguish them.
    const mfrCnA = await createManufacturer(pool, { name: 'Div CN A', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const mfrCnB = await createManufacturer(pool, { name: 'Div CN B', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
    const mfrDe = await createManufacturer(pool, { name: 'Div DE', country: 'DE', category: 'OIL', subtype: 'SPIN_ON' });
    const offerCnA = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrCnA, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}DIVA` });
    const offerCnB = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrCnB, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}DIVB` });
    const offerDe = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfrDe, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}DIVC` });
    for (const o of [offerCnA, offerCnB, offerDe]) {
      await fetch(`${commercialApprovalUrl}/${o.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });
    }

    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    const body = await runRes.json();
    const eligible = body.candidates.filter((c) => c.eligible);
    assert.equal(eligible.length, 3);

    const geoScores = {};
    for (const c of eligible) {
      const geo = c.factor_scores.find((s) => s.factor_code === 'GEOGRAPHIC_DIVERSIFICATION');
      geoScores[c.offer_id] = Number(geo.normalized_value);
    }

    // The two CN offers share an identical, non-rarest-share diversification
    // score with each other...
    assert.equal(geoScores[offerCnA.id], geoScores[offerCnB.id]);
    // ...and the lone DE offer scores strictly higher (it is rarer in the
    // pool, both by manufacturer and by country) — never a flat 50 for
    // every candidate regardless of pool composition.
    assert.ok(geoScores[offerDe.id] > geoScores[offerCnA.id], `expected DE offer's diversification score (${geoScores[offerDe.id]}) to exceed the CN offers' (${geoScores[offerCnA.id]})`);

    // With every other factor identical, the higher STRATEGIC-category score
    // must carry through to a strictly higher composite_score_final —
    // proving this is not a cosmetic/unused field.
    const deCandidate = eligible.find((c) => c.offer_id === offerDe.id);
    const cnCandidateA = eligible.find((c) => c.offer_id === offerCnA.id);
    assert.ok(Number(deCandidate.composite_score_final) > Number(cnCandidateA.composite_score_final));
  });
});
