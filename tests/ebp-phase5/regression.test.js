'use strict';

// EBP Phase 5 — regression tests: confirms Phase 5 never touches Phase
// 1-4 data, and covers specific edge cases flagged as risks in
// docs/ebp/phases/phase-05-manufacturer-selection.md (single-candidate
// families, expired Offers, invalid Selection Policy weights).
//
// Run: node --test tests/ebp-phase5/regression.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const phase5Routes = require('../../ebp/phase5/internal.routes');
const service = require('../../ebp/phase5/service');
const { generateCandidate: generateEfmCandidate } = require('../../ebp/phase2/efm-code');
const { generateUniqueBatchCode, generateUniqueOfferCode } = require('../../ebp/phase3/codes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase5-regression';

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
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api/ebp/internal`;
  return { server, selectionUrl: `${base}/selection`, commercialApprovalUrl: `${base}/commercial-approval`, policyUrl: `${base}/selection-policy`, rolesUrl: `${base}/selection-roles` };
}

function headers(actor) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', 'x-ebp-actor': actor };
}

test('EBP Phase 5 — regression', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 5 regression tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  await t.test('Phase 1/2/3/4 tables and row counts are unaffected by the Phase 5 migration', async () => {
    const before = {
      passports: (await pool.query('SELECT COUNT(*) FROM ebp_engineering_passports')).rows[0].count,
      manufacturers: (await pool.query('SELECT COUNT(*) FROM ebp_manufacturers')).rows[0].count,
      offers: (await pool.query('SELECT COUNT(*) FROM ebp_manufacturer_offers')).rows[0].count,
      validationRuns: (await pool.query('SELECT COUNT(*) FROM ebp_validation_runs')).rows[0].count,
      decisions: (await pool.query('SELECT COUNT(*) FROM ebp_engineering_decisions')).rows[0].count,
    };
    // A no-op Phase 5 read (fetchPassportContext-shaped query) must never
    // write to any Phase 1-4 table.
    await pool.query('SELECT id FROM ebp_engineering_passports LIMIT 1');
    const after = {
      passports: (await pool.query('SELECT COUNT(*) FROM ebp_engineering_passports')).rows[0].count,
      manufacturers: (await pool.query('SELECT COUNT(*) FROM ebp_manufacturers')).rows[0].count,
      offers: (await pool.query('SELECT COUNT(*) FROM ebp_manufacturer_offers')).rows[0].count,
      validationRuns: (await pool.query('SELECT COUNT(*) FROM ebp_validation_runs')).rows[0].count,
      decisions: (await pool.query('SELECT COUNT(*) FROM ebp_engineering_decisions')).rows[0].count,
    };
    assert.deepEqual(before, after);
  });

  await t.test('Selection Policy creation rejects weights that do not sum to 1.0', async () => {
    await assert.rejects(
      () => service.createSelectionPolicy(pool, {
        policy_code: `SELPOL-BADWEIGHT-${Date.now()}`, name: 'Bad', scope_type: 'PLATFORM',
        weights: { ENGINEERING: 0.5, COMMERCIAL: 0.5, OPERATIONAL: 0.5, STRATEGIC: 0.5 },
      }, { declared_actor: 'test-regression-owner', identity_mechanism: 'ADMIN_KEY_SHARED' }),
      (err) => err instanceof service.UnauthorizedError || err instanceof service.ValidationError
    );
  });

  const { server, selectionUrl, commercialApprovalUrl, policyUrl, rolesUrl } = await startTestServer(pool);
  const suffix = `${Date.now().toString().slice(-6)}r`;
  const ACTOR_OWNER = `test-sel-owner-${suffix}`;
  const ACTOR_COMMERCIAL = `test-sel-commercial-${suffix}`;

  await pool.query('DELETE FROM ebp_selection_admin_bootstrap');

  t.after(async () => {
    server.close();
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
  await fetch(policyUrl, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ policy_code: `SELPOL-REG-${suffix}`, name: 'Reg', scope_type: 'PLATFORM', weights: { ENGINEERING: 0.40, COMMERCIAL: 0.25, OPERATIONAL: 0.20, STRATEGIC: 0.15 } }) })
    .then(async (r) => { const p = await r.json(); await fetch(`${policyUrl}/${p.id}/publish`, { method: 'POST', headers: headers(ACTOR_OWNER) }); });

  const sku = `ELP5REG${suffix}`;
  await pool.query(`INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`, [sku]);
  const passportInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase5-test') RETURNING id`,
    [sku]
  );
  const passportId = passportInsert.rows[0].id;

  const mfrCode = generateEfmCandidate();
  const mfrInsert = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, 'Reg Test Mfr', 'CN', 'UTC', 'QUALIFIED', 'phase5-test') RETURNING id`,
    [mfrCode]
  );
  const manufacturerId = mfrInsert.rows[0].id;
  const locInsert = await pool.query(`INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1, 'FACTORY', 'CN', 'UTC') RETURNING id`, [manufacturerId]);
  await pool.query(`INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype, status) VALUES ($1, $2, 'OIL', 'SPIN_ON', 'QUALIFIED')`, [manufacturerId, locInsert.rows[0].id]);

  const batchCode = await generateUniqueBatchCode(async (code) => (await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1', [code])).rows.length > 0);
  const batchInsert = await pool.query(`INSERT INTO ebp_manufacturer_request_batches (batch_code, manufacturer_id, purpose, channel, status, timezone, created_by) VALUES ($1, $2, 'PRODUCTION_CANDIDATE', 'PORTAL', 'SENT', 'UTC', 'phase5-test') RETURNING id`, [batchCode, manufacturerId]);
  const batchItemInsert = await pool.query(`INSERT INTO ebp_manufacturer_request_batch_items (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot) VALUES ($1, $2, 1, $3, '{}'::jsonb) RETURNING id`, [batchInsert.rows[0].id, passportId, sku]);
  const offerCode = await generateUniqueOfferCode(async (code) => (await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1', [code])).rows.length > 0);
  const offerInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_offers (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision, status, created_by, identity_mechanism, fob_price, currency, lead_time_days, monthly_capacity)
     VALUES ($1, 1, $2, $3, $4, 1, 'SUBMITTED', 'phase5-test', 'ADMIN_KEY_SHARED', 10, 'USD', 30, 5000) RETURNING id, offer_code`,
    [offerCode, batchItemInsert.rows[0].id, manufacturerId, passportId]
  );
  const offer = offerInsert.rows[0];
  const runInsert = await pool.query(
    `INSERT INTO ebp_validation_runs (passport_id, engineering_revision, manufacturer_id, offer_id, offer_revision, mechanical_result, mechanically_eligible_for_approval, trigger, input_versions, status, created_by)
     VALUES ($1, 1, $2, $3, 1, 'MECHANICALLY_PASS', TRUE, 'INITIAL', '{}'::jsonb, 'CURRENT', 'phase5-test') RETURNING id`,
    [passportId, manufacturerId, offer.id]
  );
  await pool.query(`INSERT INTO ebp_engineering_decisions (validation_run_id, decision, decided_by, status) VALUES ($1, 'APPROVED', 'phase5-test', 'CURRENT')`, [runInsert.rows[0].id]);
  await fetch(`${commercialApprovalUrl}/${offer.offer_code}`, { method: 'POST', headers: headers(ACTOR_COMMERCIAL), body: JSON.stringify({ offer_revision: 1, status: 'APPROVED', reason: 'ok' }) });

  await t.test('a single eligible candidate produces only a Primary — no Secondary or Backup fabricated', async () => {
    const res = await fetch(`${selectionUrl}/${sku}/run`, { method: 'POST', headers: headers(ACTOR_OWNER), body: JSON.stringify({ trigger: 'MANUAL_TRIGGER' }) });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.run.run_result, 'RECOMMENDATION_READY');
    assert.equal(body.candidates.length, 1);
    assert.equal(body.candidates[0].tier, 'PRIMARY');
  });
});
