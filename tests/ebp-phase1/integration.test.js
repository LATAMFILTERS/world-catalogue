'use strict';

// EBP Phase 1 — integration tests against a real Postgres instance running
// the actual migrations/ebp-phase1/ schema. Exercises the full HTTP surface
// end-to-end (no mocks). Skips with a clear message if the database is
// unreachable rather than failing the whole run.
//
// Run: node --test tests/ebp-phase1/integration.test.js
// Override the target DB with DATABASE_URL if not using the default local
// test database this session created (postgresql://postgres:postgres@
// localhost:5432/ebp_phase1_test, migrated via migrations/ebp-phase1/
// 001, 002, and 003).

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const createPassportsRouter = require('../../ebp/phase1/passports.routes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';

async function startTestServer(pool) {
  const app = express();
  app.use(express.json());
  app.use('/api/ebp/passports', createPassportsRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}/api/ebp/passports` };
}

test('EBP Phase 1 — Product Engineering Passport integration', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 1 integration tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const suffix = Date.now().toString().slice(-8);
  const skuHD = `ELTEST${suffix}A`;
  const skuLD = `ELTEST${suffix}B`;
  const skuUnseeded = `ELTEST${suffix}C`;
  const skuUnseededOverride = `ELTEST${suffix}D`;
  // A dedicated, uniquely-named category/subtype pair per test run, so this
  // test's matrix-approval UPDATE can never affect any other test's rows
  // (including OIL/SPIN_ON, which other tests rely on staying PROVISIONAL).
  const gateCategory = `GATECAT${suffix}`;
  const gateSubtype = `GATESUB${suffix}`;
  const skuGate = `ELTEST${suffix}E`;

  await pool.query(
    `INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES
       ($1,'HD','OIL','SPIN_ON'), ($2,'LD','OIL','SPIN_ON'), ($3,'HD','OIL','SPIN_ON')
     ON CONFLICT (sku) DO NOTHING`,
    [skuHD, skuLD, skuGate]
  );
  await pool.query(
    `INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability)
     VALUES ($1, $2, 'bypass_valve_applicability', 'REQUIRED'), ($1, $2, 'antidrainback_valve_applicability', 'REQUIRED')
     ON CONFLICT (product_category, product_subtype, field_name) DO NOTHING`,
    [gateCategory, gateSubtype]
  );

  const { server, baseUrl } = await startTestServer(pool);
  t.after(async () => {
    server.close();
    await pool.end();
  });

  let revision1Id;

  await t.test('creates Passport revision 1 (DRAFT) for a real HD SKU, applying the seeded applicability matrix', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: skuHD,
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        duty: 'HEAVY_DUTY',
        engineering: { required_media: 'cellulose' },
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'DRAFT');
    assert.equal(body.engineering_revision, 1);
    assert.equal(body.engineering.bypass_valve_applicability, 'REQUIRED');
    assert.equal(body.engineering.antidrainback_valve_applicability, 'REQUIRED');
    assert.equal(body.engineering.field_applicability_source.bypass_valve_applicability, 'MATRIX');
    assert.equal(body.packaging.individual_box_required, true);
    revision1Id = body.id;
  });

  await t.test('created_by defaults to admin-key-session when x-ebp-actor is not sent, paired with identity_mechanism ADMIN_KEY_SHARED', async () => {
    const res = await fetch(`${baseUrl}/${skuHD}`);
    const body = await res.json();
    assert.equal(body.created_by, 'admin-key-session');
    assert.equal(body.identity_mechanism, 'ADMIN_KEY_SHARED');
  });

  await t.test('created_by records the caller-declared x-ebp-actor label when sent (still not an authenticated identity)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-ebp-actor': 'jane@elimfilters.com' },
      body: JSON.stringify({
        elimfilters_code: skuLD,
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        duty: 'LIGHT_DUTY',
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 12 },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.duty, 'LIGHT_DUTY');
    assert.equal(body.created_by, 'jane@elimfilters.com');
    assert.equal(body.identity_mechanism, 'ADMIN_KEY_SHARED');
  });

  await t.test('rejects a duplicate revision-1 create for the same SKU (409 conflict)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: skuHD,
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        duty: 'HEAVY_DUTY',
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
      }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('rejects creation for an unseeded category/subtype with no explicit applicability override (400)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: skuUnseeded,
        product_category: 'EXOTIC',
        product_subtype: 'UNKNOWN',
        duty: 'HEAVY_DUTY',
        is_pre_sku_draft: true,
        packaging: { packaging_class: 'INDUSTRIAL', elimfilters_target_quantity: 6 },
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.details.join(' | '), /unresolved applicability/);
  });

  let overrideOnlyPassportId;
  await t.test('accepts creation for an unseeded category/subtype once given an explicit applicability override', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: skuUnseededOverride,
        product_category: 'EXOTIC',
        product_subtype: 'UNKNOWN',
        duty: 'HEAVY_DUTY',
        is_pre_sku_draft: true,
        engineering: {
          field_applicability: {
            bypass_valve_applicability: 'NOT_APPLICABLE',
            antidrainback_valve_applicability: 'NOT_APPLICABLE',
          },
        },
        packaging: { packaging_class: 'INDUSTRIAL', elimfilters_target_quantity: 6 },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.engineering.field_applicability.bypass_valve_applicability, 'NOT_APPLICABLE');
    assert.equal(body.engineering.field_applicability_source.bypass_valve_applicability, 'OVERRIDE');
    overrideOnlyPassportId = body.id;
  });

  await t.test('ADR-0014 gate: a fully OVERRIDE-sourced Passport activates immediately, with no matrix dependency at all', async () => {
    const res = await fetch(`${baseUrl}/${overrideOnlyPassportId}/activate`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ACTIVE');
  });

  await t.test('rejects creation for a non-existent SKU that is not flagged as a pre-SKU draft', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: `${skuHD}-DOES-NOT-EXIST`,
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        duty: 'HEAVY_DUTY',
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.details.join(' | '), /does not exist in elimfilters_catalog/);
  });

  // ── ADR-0014 activation gate, isolated on its own category/subtype ────────

  let gatePassportId;
  await t.test('ADR-0014 gate: creating a DRAFT against PROVISIONAL matrix rules is never blocked', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        elimfilters_code: skuGate,
        product_category: gateCategory,
        product_subtype: gateSubtype,
        duty: 'HEAVY_DUTY',
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'DRAFT');
    assert.equal(body.engineering.field_applicability_source.bypass_valve_applicability, 'MATRIX');
    gatePassportId = body.id;
  });

  await t.test('ADR-0014 gate: activation is BLOCKED (409) while the matrix rule is still PROVISIONAL', async () => {
    const res = await fetch(`${baseUrl}/${gatePassportId}/activate`, { method: 'POST' });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.match(body.message, /PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL/);
    assert.match(body.message, /bypass_valve_applicability/);
  });

  await t.test('ADR-0014 gate: activation succeeds once ELIMFILTERS engineering approves the matrix row(s), with no new revision needed', async () => {
    await pool.query(
      `UPDATE ebp_field_applicability_matrix SET approval_status = 'ENGINEERING_APPROVED'
       WHERE product_category = $1 AND product_subtype = $2`,
      [gateCategory, gateSubtype]
    );
    const res = await fetch(`${baseUrl}/${gatePassportId}/activate`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ACTIVE');
  });

  await t.test('applicability-matrix endpoint surfaces approval_status alongside applicability', async () => {
    const res = await fetch(`${baseUrl}/applicability-matrix?product_category=${gateCategory}&product_subtype=${gateSubtype}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    const byName = Object.fromEntries(body.fields.map((f) => [f.field_name, f.approval_status]));
    assert.equal(byName.bypass_valve_applicability, 'ENGINEERING_APPROVED');
  });

  // ── OIL/SPIN_ON approved so the remaining lifecycle tests below can activate ──

  await t.test('approves the OIL/SPIN_ON matrix rows so the primary lifecycle tests below can activate', async () => {
    await pool.query(
      `UPDATE ebp_field_applicability_matrix SET approval_status = 'ENGINEERING_APPROVED'
       WHERE product_category = 'OIL' AND product_subtype = 'SPIN_ON'`
    );
    const res = await fetch(`${baseUrl}/${revision1Id}/activate`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ACTIVE');
  });

  await t.test('a second activation attempt on the same (now-ACTIVE) revision is rejected (409)', async () => {
    const res = await fetch(`${baseUrl}/${revision1Id}/activate`, { method: 'POST' });
    assert.equal(res.status, 409);
  });

  await t.test('GET current returns the ACTIVE revision', async () => {
    const res = await fetch(`${baseUrl}/${skuHD}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ACTIVE');
    assert.equal(body.id, revision1Id);
  });

  let revision2Id;
  await t.test('creates a second revision (DRAFT), recording supersedes_passport_id', async () => {
    const res = await fetch(`${baseUrl}/${skuHD}/revisions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        duty: 'HEAVY_DUTY',
        engineering: { required_media: 'synthetic' },
        packaging: { packaging_class: 'AUTOMOTIVE', elimfilters_target_quantity: 24 },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.engineering_revision, 2);
    assert.equal(body.supersedes_passport_id, revision1Id);
    revision2Id = body.id;
  });

  await t.test('activating revision 2 atomically supersedes revision 1 — no window with 0 or 2 ACTIVE rows', async () => {
    const res = await fetch(`${baseUrl}/${revision2Id}/activate`, { method: 'POST' });
    assert.equal(res.status, 200);

    const listRes = await fetch(`${baseUrl}/${skuHD}/revisions`);
    const { revisions } = await listRes.json();
    const r1 = revisions.find((r) => r.engineering_revision === 1);
    const r2 = revisions.find((r) => r.engineering_revision === 2);
    assert.equal(r1.status, 'SUPERSEDED');
    assert.equal(r2.status, 'ACTIVE');

    const activeCount = revisions.filter((r) => r.status === 'ACTIVE').length;
    assert.equal(activeCount, 1);
  });

  await t.test('retires the active revision', async () => {
    const res = await fetch(`${baseUrl}/${revision2Id}/retire`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'integration test teardown' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'RETIRED');
  });

  await t.test('retiring an already-RETIRED revision is rejected (409)', async () => {
    const res = await fetch(`${baseUrl}/${revision2Id}/retire`, { method: 'POST' });
    assert.equal(res.status, 409);
  });

  await t.test('GET a specific revision by number returns that exact revision', async () => {
    const res = await fetch(`${baseUrl}/${skuHD}/revisions/1`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.engineering_revision, 1);
    assert.equal(body.status, 'SUPERSEDED');
  });

  await t.test('applicability-matrix endpoint returns the seeded rows for OIL/SPIN_ON', async () => {
    const res = await fetch(`${baseUrl}/applicability-matrix?product_category=OIL&product_subtype=SPIN_ON`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.fields.length >= 4);
    const byName = Object.fromEntries(body.fields.map((f) => [f.field_name, f.applicability]));
    assert.equal(byName.bypass_valve_applicability, 'REQUIRED');
  });

  await t.test('GET a non-existent SKU returns 404', async () => {
    const res = await fetch(`${baseUrl}/DOES-NOT-EXIST-SKU`);
    assert.equal(res.status, 404);
  });
});
