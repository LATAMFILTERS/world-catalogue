'use strict';

// EBP Phase 5 — integration tests against a real Postgres instance running
// the actual migrations/ebp-phase5/ schema (on top of Phase 1-4 fixtures).
// Exercises the full HTTP surface end-to-end (no mocks). Skips with a clear
// message if the database is unreachable.
//
// Run: node --test tests/ebp-phase5/integration.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const phase5Routes = require('../../ebp/phase5/internal.routes');
const { generateCandidate: generateEfmCandidate } = require('../../ebp/phase2/efm-code');
const { generateUniqueBatchCode, generateUniqueOfferCode } = require('../../ebp/phase3/codes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase5';

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
  app.use('/api/ebp/internal/preferred-manufacturers', requireAdmin, phase5Routes.createPreferredManufacturersRouter(pool));
  app.use('/api/ebp/internal/demand-signals', requireAdmin, phase5Routes.createDemandSignalsRouter(pool));
  app.use('/api/ebp/internal/selection-roles', requireAdmin, phase5Routes.createRolesRouter(pool));
  app.use('/api/ebp/internal/analytics', requireAdmin, phase5Routes.createAnalyticsRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api/ebp/internal`;
  return {
    server,
    selectionUrl: `${base}/selection`,
    commercialApprovalUrl: `${base}/commercial-approval`,
    policyUrl: `${base}/selection-policy`,
    preferredMfrUrl: `${base}/preferred-manufacturers`,
    demandUrl: `${base}/demand-signals`,
    rolesUrl: `${base}/selection-roles`,
    analyticsUrl: `${base}/analytics`,
  };
}

function headers(actor, extra = {}) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', 'x-ebp-actor': actor, ...extra };
}

async function createManufacturer(pool, { suffix, name, country, category, subtype }) {
  const mfrCode = generateEfmCandidate();
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, $2, $3, 'UTC', 'QUALIFIED', 'phase5-test') RETURNING id`,
    [mfrCode, name, country]
  );
  const manufacturerId = rows[0].id;
  const locInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone)
     VALUES ($1, 'FACTORY', $2, 'UTC') RETURNING id`,
    [manufacturerId, country]
  );
  await pool.query(
    `INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype, status)
     VALUES ($1, $2, $3, $4, 'QUALIFIED')`,
    [manufacturerId, locInsert.rows[0].id, category, subtype]
  );
  return manufacturerId;
}

async function createOfferWithApprovedEngineering(pool, { passportId, manufacturerId, fob, leadTime, capacity, suffix }) {
  const batchCode = await generateUniqueBatchCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code]);
    return rows.length > 0;
  });
  const batchInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by)
     VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase5-test') RETURNING id`,
    [batchCode, manufacturerId]
  );
  const batchItemInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot)
     VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`,
    [batchInsert.rows[0].id, passportId, `ELP5${suffix}`]
  );
  const offerCode = await generateUniqueOfferCode(async (code) => {
    const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code]);
    return rows.length > 0;
  });
  const offerInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_offers
       (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by,
        identity_mechanism, fob_price, currency, lead_time_days, monthly_capacity, offer_validity_until)
     VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase5-test', 'ADMIN_KEY_SHARED', $5, 'USD', $6, $7, CURRENT_DATE + INTERVAL '90 days')
     RETURNING id, offer_code, offer_revision`,
    [offerCode, batchItemInsert.rows[0].id, manufacturerId, passportId, fob, leadTime, capacity]
  );
  const offer = offerInsert.rows[0];

  // Directly insert a CURRENT Validation Run + APPROVED Engineering Decision
  // — Phase 4's own rule-engine correctness is covered by its own test
  // suite; Phase 5 tests only need a realistic, valid Phase 4 result to
  // build on (computeSelectionEligibility's contract, ADR-0055).
  const runInsert = await pool.query(
    `INSERT INTO ebp_validation_runs
       (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision,
        mechanical_result, mechanically_eligible_for_approval, trigger, input_versions, status, created_by)
     VALUES ($1, 1, $2, $3, 1, 'MECHANICALLY_PASS', TRUE, 'INITIAL', '{}'::jsonb, 'CURRENT', 'phase5-test')
     RETURNING id`,
    [passportId, manufacturerId, offer.id]
  );
  await pool.query(
    `INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by, status)
     VALUES ($1, 'APPROVED', 'phase5-test', 'CURRENT')`,
    [runInsert.rows[0].id]
  );

  return offer;
}

test('EBP Phase 5 — Manufacturer Selection integration', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 5 integration tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const { server, selectionUrl, commercialApprovalUrl, policyUrl, rolesUrl, analyticsUrl } = await startTestServer(pool);

  const suffix = Date.now().toString().slice(-6);
  const ACTOR_OWNER = `test-sel-owner-${suffix}`;
  const ACTOR_COMMERCIAL = `test-sel-commercial-${suffix}`;
  const ACTOR_SEL_APPROVER = `test-sel-approver-${suffix}`;

  await pool.query('DELETE FROM ebp_selection_admin_bootstrap');

  t.after(async () => {
    server.close();
    await pool.query(`DELETE FROM ebp_selection_overrides WHERE requested_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_decisions WHERE decided_by LIKE $1 OR decided_by IS NULL`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_factor_scores WHERE selection_candidate_id IN (SELECT id FROM ebp_selection_candidates WHERE selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE triggered_by LIKE $1))`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_candidates WHERE selection_run_id IN (SELECT id FROM ebp_selection_runs WHERE triggered_by LIKE $1)`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_runs WHERE triggered_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_offer_commercial_approvals WHERE decided_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_policies WHERE created_by LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_selection_role_assignments WHERE declared_actor LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_activity_events WHERE declared_actor LIKE $1`, [`test-sel-%-${suffix}`]);
    await pool.query(`DELETE FROM ebp_alerts WHERE entity_id IN (SELECT id FROM ebp_selection_runs)`).catch(() => {});
    await pool.query('DELETE FROM ebp_selection_admin_bootstrap');
    await pool.end();
  });

  // ── Fixture: Passport (Phase 1) ──────────────────────────────────────────
  const sku = `ELP5TEST${suffix}`;
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [sku]);
  const passportInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase5-test') RETURNING id`,
    [sku]
  );
  const passportId = passportInsert.rows[0].id;

  const skuNoCandidate = `ELP5NOELIG${suffix}`;
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [skuNoCandidate]);
  const passportNoCandidateInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase5-test') RETURNING id`,
    [skuNoCandidate]
  );
  const passportNoCandidateId = passportNoCandidateInsert.rows[0].id;

  // ── 1. Role bootstrap (Decision 05, ADR-0066) ────────────────────────────

  await t.test('bootstraps the first ADMIN_OWNER with no prior role required', async () => {
    const res = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_OWNER, role: 'ADMIN_OWNER' }) });
    assert.equal(res.status, 201);
  });

  await t.test('the bootstrapped ADMIN_OWNER assigns COMMERCIAL_APPROVER and SELECTION_APPROVER', async () => {
    const r1 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_COMMERCIAL, role: 'COMMERCIAL_APPROVER' }) });
    assert.equal(r1.status, 201);
    const r2 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_SEL_APPROVER, role: 'SELECTION_APPROVER' }) });
    assert.equal(r2.status, 201);
    // ACTOR_OWNER also holds SELECTION_APPROVER, to exercise the
    // same-declared-actor-cannot-both-request-and-approve override guard
    // (Decision 05, ADR-0066) below without a role-check 403 masking it.
    const r3 = await fetch(rolesUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ declared_actor: ACTOR_OWNER, role: 'SELECTION_APPROVER' }) });
    assert.equal(r3.status, 201);
  });

  // ── 2. Selection Policy (Decision 07, ADR-0068) ──────────────────────────

  let policyId;
  await t.test('creates and publishes a PLATFORM-scope Selection Policy', async () => {
    const createRes = await fetch(policyUrl, {
      method: 'POST',
      headers: headers(ACTOR_OWNER),
      body: JSON.stringify({
        policy_code: `SELPOL-TEST-${suffix}`, name: 'Test Policy', scope_type: 'PLATFORM',
        weights: { ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 },
        penalties: { approved_exception_penalty: 10 },
        preferred_manufacturer_bonus: { bonus_points: 5 },
        concentration_thresholds: { low_max: 1500, moderate_max: 2500 },
      }),
    });
    assert.equal(createRes.status, 201);
    const policy = await createRes.json();
    policyId = policy.id;
    const publishRes = await fetch(`${policyUrl}/${policyId}/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) });
    assert.equal(publishRes.status, 200);
    const published = await publishRes.json();
    assert.equal(published.status, 'ACTIVE');
  });

  // ── 3. Three Manufacturers, three Offers, varying FOB/lead time/capacity/country ──

  const mfr1 = await createManufacturer(pool, { suffix, name: 'Test Mfr A', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });
  const mfr2 = await createManufacturer(pool, { suffix, name: 'Test Mfr B', country: 'IN', category: 'OIL', subtype: 'SPIN_ON' });
  const mfr3 = await createManufacturer(pool, { suffix, name: 'Test Mfr C', country: 'CN', category: 'OIL', subtype: 'SPIN_ON' });

  const offer1 = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr1, fob: 10, leadTime: 30, capacity: 5000, suffix: `${suffix}A` });
  const offer2 = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr2, fob: 8, leadTime: 45, capacity: 3000, suffix: `${suffix}B` });
  const offer3 = await createOfferWithApprovedEngineering(pool, { passportId, manufacturerId: mfr3, fob: 12, leadTime: 20, capacity: 8000, suffix: `${suffix}C` });

  // ── 4. Offer Commercial Approval (Decision 11, ADR-0072) ─────────────────

  await t.test('an Offer without Commercial Approval is excluded from the official recommendation', async () => {
    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    assert.equal(runRes.status, 201);
    const body = await runRes.json();
    assert.equal(body.run.run_result, 'NO_ELIGIBLE_CANDIDATE');
    // Excluded candidates are retained with their exclusion reason
    // (MANUFACTURER_SELECTION_ENGINE.md §5/§10 "Result Model") — the run
    // still records all three as considered-but-excluded, never silently
    // dropped, and none is eligible.
    assert.equal(body.candidates.length, 3);
    assert.ok(body.candidates.every((c) => !c.eligible));
    assert.ok(body.candidates.every((c) => /Commercial Approval/.test(c.exclusion_reason)));
  });

  await t.test('COMMERCIAL_APPROVER approves all three Offers', async () => {
    for (const offer of [offer1, offer2, offer3]) {
      const res = await fetch(`${commercialApprovalUrl}/${offer.offer_code}`, {
        method: 'POST', headers: headers(ACTOR_COMMERCIAL),
        body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'commercial terms acceptable' }),
      });
      assert.equal(res.status, 201);
    }
  });

  await t.test('a COMMERCIAL_APPROVER decision without the role is rejected', async () => {
    const res = await fetch(`${commercialApprovalUrl}/${offer1.offer_code}`, {
      method: 'POST', headers: headers('no-role-actor'),
      body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'x' }),
    });
    assert.equal(res.status, 403);
  });

  // ── 5. Selection Run: ranking, Primary/Secondary/Backup, factor scores ───

  let selectionRunId;
  await t.test('produces a RECOMMENDATION_READY run with a full ranking once all three Offers are eligible', async () => {
    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    assert.equal(runRes.status, 201);
    const body = await runRes.json();
    assert.equal(body.run.run_result, 'RECOMMENDATION_READY');
    assert.equal(body.candidates.length, 3);
    assert.ok(body.candidates.every((c) => c.eligible));
    selectionRunId = body.run.id;

    const primary = body.candidates.find((c) => c.tier === 'PRIMARY');
    const secondary = body.candidates.find((c) => c.tier === 'SECONDARY');
    const backup = body.candidates.find((c) => c.tier === 'BACKUP');
    assert.ok(primary, 'a Primary must be assigned');
    assert.ok(secondary, 'a Secondary must be assigned');
    assert.ok(backup, 'a Backup must be assigned');
    assert.ok(primary.composite_score_final >= secondary.composite_score_final);
    assert.ok(secondary.composite_score_final >= backup.composite_score_final || backup.backup_diversification_limited !== undefined);
    assert.ok(primary.factor_scores.length > 0, 'every eligible candidate must have factor scores recorded');

    const decision = body.decision;
    assert.equal(decision.status, 'PENDING_REVIEW');
  });

  await t.test('a re-run produces a new Selection Version and marks the prior run STALE', async () => {
    const historyBefore = await (await fetch(`${selectionUrl}/${sku}/history`, { headers: headers(ACTOR_OWNER) })).json();
    const versionsBefore = historyBefore.runs.length;

    const runRes = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    assert.equal(runRes.status, 201);

    const historyAfter = await (await fetch(`${selectionUrl}/${sku}/history`, { headers: headers(ACTOR_OWNER) })).json();
    assert.equal(historyAfter.runs.length, versionsBefore + 1);
    const staleRuns = historyAfter.runs.filter((r) => r.run_result === 'STALE');
    assert.ok(staleRuns.length >= 1, 'the superseded run must be marked STALE, never deleted');

    const current = await (await fetch(`${selectionUrl}/${sku}`, { headers: headers(ACTOR_OWNER) })).json();
    selectionRunId = current.run.id;
  });

  // ── 6. Selection Decision (the human act) ────────────────────────────────

  await t.test('SELECTION_APPROVER approves the current Selection Decision', async () => {
    const res = await fetch(`${selectionUrl}/${sku}/decision`, {
      method: 'POST', headers: headers(ACTOR_SEL_APPROVER), body: JSON.stringify({ decision: 'APPROVED', notes: 'looks good' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'APPROVED');
    assert.ok(body.approved_primary_offer_id);
  });

  // ── 7. Manual Override — two-actor enforcement (Decision 05/06, ADR-0066/0067) ──

  let overrideId;
  await t.test('requesting an override to promote the Backup Offer as Primary', async () => {
    const current = await (await fetch(`${selectionUrl}/${sku}`, { headers: headers(ACTOR_OWNER) })).json();
    const backup = current.candidates.find((c) => c.tier === 'BACKUP');
    const res = await fetch(`${selectionUrl}/${sku}/override`, {
      method: 'POST', headers: headers(ACTOR_SEL_APPROVER),
      body: JSON.stringify({ tier: 'PRIMARY', requested_offer_code: [offer1, offer2, offer3].find((o) => o.id === backup.offer_id).offer_code, reason: 'negotiated volume commitment' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    overrideId = body.id;
    assert.equal(body.status, 'REQUESTED');
  });

  await t.test('the same actor cannot both request and approve an override', async () => {
    // ACTOR_OWNER holds both SELECTION_APPROVER and ADMIN_OWNER — requesting
    // and then approving as the same declared actor must still be rejected
    // by the actor-equality guard (Decision 05, ADR-0066), never merely by
    // a role check that happens to also fail for an unrelated reason.
    const current = await (await fetch(`${selectionUrl}/${sku}`, { headers: headers(ACTOR_OWNER) })).json();
    const secondary = current.candidates.find((c) => c.tier === 'SECONDARY');
    const requestRes = await fetch(`${selectionUrl}/${sku}/override`, {
      method: 'POST', headers: headers(ACTOR_OWNER),
      body: JSON.stringify({ tier: 'SECONDARY', requested_offer_code: [offer1, offer2, offer3].find((o) => o.id === secondary.offer_id).offer_code, reason: 'self-request test' }),
    });
    assert.equal(requestRes.status, 201);
    const selfOverride = await requestRes.json();
    const res = await fetch(`${selectionUrl}/overrides/${selfOverride.id}/approve`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({}) });
    assert.equal(res.status, 409);
  });

  await t.test('a different actor (ADMIN_OWNER) approves the override, which is recorded as OVERRIDDEN', async () => {
    const res = await fetch(`${selectionUrl}/overrides/${overrideId}/approve`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ notes: 'approved by owner' }) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'APPROVED');
  });

  // ── 8. NO_ELIGIBLE_CANDIDATE (Decision 03, ADR-0064) ─────────────────────

  await t.test('a Passport with zero eligible Offers produces NO_ELIGIBLE_CANDIDATE, never an error or a fallback selection', async () => {
    const sku2 = skuNoCandidate;
    const runRes = await fetch(`${selectionUrl}/${sku2}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    assert.equal(runRes.status, 201);
    const body = await runRes.json();
    assert.equal(body.run.run_result, 'NO_ELIGIBLE_CANDIDATE');
    assert.equal(body.candidates.length, 0);
  });

  // ── 9. Concentration analytics ────────────────────────────────────────────

  await t.test('the concentration analytics endpoint returns SKU and country HHI', async () => {
    const res = await fetch(`${analyticsUrl}/selection/concentration`, { headers: headers(ACTOR_OWNER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok('sku_concentration_hhi' in body);
    assert.ok('country_concentration_hhi' in body);
  });
});
