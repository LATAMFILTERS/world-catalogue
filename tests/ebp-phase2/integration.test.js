'use strict';

// EBP Phase 2 — integration tests against a real Postgres instance running
// the actual migrations/ebp-phase2/ schema. Exercises the full HTTP surface
// end-to-end (no mocks). Skips with a clear message if the database is
// unreachable rather than failing the whole run.
//
// Run: node --test tests/ebp-phase2/integration.test.js
// Override the target DB with DATABASE_URL if not using the default local
// test database this session created (postgresql://postgres:postgres@
// localhost:5432/ebp_phase1_test, migrated via migrations/ebp-phase2/001).

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { Pool } = require('pg');

const createManufacturersRouter = require('../../ebp/phase2/manufacturers.routes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase2';

// Mirrors server.js's requireAdmin exactly (Bearer token compared to a
// fixed key) so the "403 without ADMIN_KEY" test exercises the real gating
// pattern, not a stand-in.
function requireAdmin(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!key || key !== TEST_ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
}

async function startTestServer(pool) {
  const app = express();
  app.use(express.json());
  app.use('/api/ebp/manufacturers', requireAdmin, createManufacturersRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}/api/ebp/manufacturers` };
}

function authed(extraHeaders = {}) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', ...extraHeaders };
}

test('EBP Phase 2 — Manufacturer Registry integration', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 2 integration tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const { server, baseUrl } = await startTestServer(pool);
  t.after(async () => {
    server.close();
    await pool.end();
  });

  // ── requireAdmin gating ────────────────────────────────────────────────

  await t.test('rejects any request without a valid ADMIN_KEY bearer token (403)', async () => {
    const res = await fetch(baseUrl);
    assert.equal(res.status, 403);
  });

  await t.test('rejects a request with an incorrect ADMIN_KEY (403)', async () => {
    const res = await fetch(baseUrl, { headers: { authorization: 'Bearer wrong-key' } });
    assert.equal(res.status, 403);
  });

  // ── Manufacturer creation with auto-generated EFM code ─────────────────

  let manufacturerCode;
  let manufacturerId;

  await t.test('creates a manufacturer with an auto-generated EFM-XXXX code, status CANDIDATE', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ legal_name: 'Acme Filtration Co.', trade_name: 'Acme', country_code: 'CN', timezone: 'Asia/Shanghai' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.match(body.manufacturer_code, /^EFM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    assert.equal(body.status, 'CANDIDATE');
    assert.equal(body.legal_name, 'Acme Filtration Co.');
    assert.equal(body.created_by, 'admin-key-session');
    assert.equal(body.identity_mechanism, 'ADMIN_KEY_SHARED');
    manufacturerCode = body.manufacturer_code;
    manufacturerId = body.id;
  });

  await t.test('the client cannot submit its own manufacturer_code at creation — it is always server-generated', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ legal_name: 'Should Ignore Client Code', country_code: 'US', timezone: 'America/Chicago', manufacturer_code: 'EFM-ZZZZ' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.notEqual(body.manufacturer_code, 'EFM-ZZZZ');
    assert.match(body.manufacturer_code, /^EFM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
  });

  await t.test('rejects creation with a missing required field (400)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ country_code: 'CN', timezone: 'Asia/Shanghai' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.details.includes('legal_name is required'));
  });

  await t.test('honors a caller-declared x-ebp-actor label on created_by (still not an authenticated identity)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authed({ 'x-ebp-actor': 'engineer@elimfilters.com' }),
      body: JSON.stringify({ legal_name: 'Second Test Mfr', country_code: 'DE', timezone: 'Europe/Berlin' }),
    });
    const body = await res.json();
    assert.equal(body.created_by, 'engineer@elimfilters.com');
    assert.equal(body.identity_mechanism, 'ADMIN_KEY_SHARED');
  });

  // ── Get / list ───────────────────────────────────────────────────────────

  await t.test('GET by manufacturer_code returns the internal DTO', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}`, { headers: authed() });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.manufacturer_code, manufacturerCode);
  });

  await t.test('GET a non-existent manufacturer_code returns 404', async () => {
    const res = await fetch(`${baseUrl}/EFM-0000`, { headers: authed() });
    assert.equal(res.status, 404);
  });

  await t.test('LIST filters by status and country_code', async () => {
    const res = await fetch(`${baseUrl}?status=CANDIDATE&country_code=CN`, { headers: authed() });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.manufacturers.every((m) => m.status === 'CANDIDATE' && m.country_code === 'CN'));
    assert.ok(body.manufacturers.some((m) => m.manufacturer_code === manufacturerCode));
  });

  // ── Update allowed mutable fields only ──────────────────────────────────

  await t.test('PATCH updates allowed mutable fields', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}`, {
      method: 'PATCH',
      headers: authed(),
      body: JSON.stringify({ website: 'https://acme.example', internal_notes: 'Reviewed 2026-07-13' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.website, 'https://acme.example');
    assert.equal(body.internal_notes, 'Reviewed 2026-07-13');
  });

  await t.test('PATCH rejects an attempt to change status or manufacturer_code via the generic update endpoint (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}`, {
      method: 'PATCH',
      headers: authed(),
      body: JSON.stringify({ status: 'QUALIFIED' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('manufacturer_code is immutable at the DB level even if bypassed at the application layer', async () => {
    await assert.rejects(
      () => pool.query('UPDATE ebp_manufacturers SET manufacturer_code = $1 WHERE id = $2', ['EFM-9999', manufacturerId]),
      (err) => {
        assert.match(err.message, /manufacturer_code is immutable/);
        return true;
      }
    );
  });

  // ── Status transitions (ADR-0020) ───────────────────────────────────────

  await t.test('rejects an invalid status transition (CANDIDATE -> QUALIFIED directly) with 409', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'QUALIFIED', reason: 'skip ahead' }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('accepts a valid status transition CANDIDATE -> UNDER_REVIEW, recording reason', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'UNDER_REVIEW', reason: 'initial engineering review started' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'UNDER_REVIEW');
    assert.equal(body.status_reason, 'initial engineering review started');
  });

  await t.test('history endpoint records the transition with declared_actor/identity_mechanism/reason/timestamp', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/history`, { headers: authed() });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.history.length >= 2); // creation + this transition
    const last = body.history[body.history.length - 1];
    assert.equal(last.from_status, 'CANDIDATE');
    assert.equal(last.to_status, 'UNDER_REVIEW');
    assert.equal(last.reason, 'initial engineering review started');
    assert.equal(last.identity_mechanism, 'ADMIN_KEY_SHARED');
    assert.ok(last.declared_actor);
    assert.ok(last.changed_at);
  });

  await t.test('advances to QUALIFIED via UNDER_REVIEW (now a valid transition)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'QUALIFIED', reason: 'approved after review' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'QUALIFIED');
  });

  // ── Contacts — single active primary enforced ───────────────────────────

  let primaryContactId;
  await t.test('adds a primary contact', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/contacts`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ full_name: 'Li Wei', email: 'li.wei@acme.example', is_primary: true, is_technical: true }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.is_primary, true);
    primaryContactId = body.id;
  });

  await t.test('rejects a second active primary contact for the same manufacturer (409)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/contacts`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ full_name: 'Zhang San', email: 'zhang.san@acme.example', is_primary: true }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('allows a second contact once it is not primary', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/contacts`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ full_name: 'Zhang San', email: 'zhang.san@acme.example', is_primary: false, is_commercial: true }),
    });
    assert.equal(res.status, 201);
  });

  await t.test('deactivating the primary contact, then adding a new active primary, succeeds', async () => {
    const deactivate = await fetch(`${baseUrl}/${manufacturerCode}/contacts/${primaryContactId}`, {
      method: 'PATCH',
      headers: authed(),
      body: JSON.stringify({ is_active: false }),
    });
    assert.equal(deactivate.status, 200);

    const res = await fetch(`${baseUrl}/${manufacturerCode}/contacts`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ full_name: 'Wang Fang', email: 'wang.fang@acme.example', is_primary: true }),
    });
    assert.equal(res.status, 201);
  });

  await t.test('rejects an invalid email on contact creation (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/contacts`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ full_name: 'Bad Email', email: 'not-an-email' }),
    });
    assert.equal(res.status, 400);
  });

  // ── Locations ────────────────────────────────────────────────────────────

  let factoryLocationId;
  await t.test('adds a FACTORY location', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/locations`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_type: 'FACTORY', country_code: 'CN', city: 'Ningbo', timezone: 'Asia/Shanghai' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.location_type, 'FACTORY');
    factoryLocationId = body.id;
  });

  await t.test('adds a second HEADQUARTERS location (multiple locations per manufacturer supported)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/locations`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_type: 'HEADQUARTERS', country_code: 'CN', city: 'Shanghai', timezone: 'Asia/Shanghai' }),
    });
    assert.equal(res.status, 201);
  });

  await t.test('updates a location', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/locations/${factoryLocationId}`, {
      method: 'PATCH',
      headers: authed(),
      body: JSON.stringify({ city: 'Ningbo Free Trade Zone' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.city, 'Ningbo Free Trade Zone');
  });

  await t.test('rejects an invalid location_type (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/locations`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_type: 'CASTLE', country_code: 'CN', timezone: 'Asia/Shanghai' }),
    });
    assert.equal(res.status, 400);
  });

  // ── Certifications — effective-validity view (ADR-0019) ─────────────────

  let currentCertId;
  let expiredCertId;

  await t.test('registers a certification (PENDING_VERIFICATION)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/certifications`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_id: factoryLocationId, certification_code: 'ISO9001', issuing_body: 'TUV Rheinland', issued_on: '2024-01-01', expires_on: '2030-01-01' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'PENDING_VERIFICATION');
    assert.equal(body.effective_status, 'PENDING_VERIFICATION');
    currentCertId = body.id;
  });

  await t.test('rejects a certification with a location_id not belonging to this manufacturer (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/certifications`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_id: '00000000-0000-0000-0000-000000000000', certification_code: 'ISO9001', issuing_body: 'TUV', issued_on: '2024-01-01' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('verifying the certification moves it to VERIFIED, and effective_status matches while unexpired', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/certifications/${currentCertId}/verify`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'VERIFIED' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'VERIFIED');
    assert.equal(body.effective_status, 'VERIFIED');
  });

  await t.test('a VERIFIED certification past its expiry date reports effective_status EXPIRED, never VERIFIED (ADR-0019)', async () => {
    const insert = await pool.query(
      `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, certification_code, issuing_body, issued_on, expires_on, status)
       VALUES ($1, 'ISO14001', 'SGS', '2015-01-01', '2020-01-01', 'VERIFIED') RETURNING id`,
      [manufacturerId]
    );
    expiredCertId = insert.rows[0].id;

    const res = await fetch(`${baseUrl}/${manufacturerCode}/certifications/${expiredCertId}/verify`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'VERIFIED' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'VERIFIED'); // raw column: last human-set value
    assert.equal(body.effective_status, 'EXPIRED'); // computed: actually expired
  });

  await t.test('rejects an invalid verification status (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/certifications/${currentCertId}/verify`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'PENDING_VERIFICATION' }),
    });
    assert.equal(res.status, 400);
  });

  // ── Capabilities ─────────────────────────────────────────────────────────

  let capabilityId;
  await t.test('declares a capability (DECLARED)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/capabilities`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_id: factoryLocationId, capability_type: 'MONTHLY_CAPACITY', capability_value: { units_per_month: 50000 } }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.review_status, 'DECLARED');
    capabilityId = body.id;
  });

  await t.test('verifies a declared capability, recording verified_by from the declared actor', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/capabilities/${capabilityId}/verify`, {
      method: 'POST',
      headers: authed({ 'x-ebp-actor': 'ops@elimfilters.com' }),
      body: JSON.stringify({ review_status: 'VERIFIED' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.review_status, 'VERIFIED');
    assert.equal(body.verified_by, 'ops@elimfilters.com');
  });

  // ── Qualifications — manufacturer x location x family (ADR-0016/0017/0018) ──

  let qualificationId;
  await t.test('creates a qualification for (manufacturer, location, OIL/SPIN_ON) with structured conditions', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/qualifications`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({
        location_id: factoryLocationId,
        product_category: 'OIL',
        product_subtype: 'SPIN_ON',
        conditions: [
          { condition_type: 'MAX_OUTER_DIAMETER_MM', parameters: { max_mm: 110 } },
          { condition_type: 'INITIAL_SAMPLE_REQUIRED', parameters: { sample_quantity: 5 } },
        ],
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'CANDIDATE');
    assert.equal(body.product_category, 'OIL');
    assert.equal(body.conditions.length, 2);
    qualificationId = body.id;
  });

  await t.test('rejects a qualification whose location_id does not belong to this manufacturer (400)', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/qualifications`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ location_id: '00000000-0000-0000-0000-000000000000', product_category: 'OIL', product_subtype: 'SPIN_ON' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('rejects an invalid qualification status transition (CANDIDATE -> SUSPENDED) with 409', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/qualifications/${qualificationId}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'SUSPENDED' }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('advances the qualification CANDIDATE -> CONDITIONAL -> QUALIFIED', async () => {
    const r1 = await fetch(`${baseUrl}/${manufacturerCode}/qualifications/${qualificationId}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'CONDITIONAL', reason: 'pending initial sample' }),
    });
    assert.equal(r1.status, 200);
    assert.equal((await r1.json()).status, 'CONDITIONAL');

    const r2 = await fetch(`${baseUrl}/${manufacturerCode}/qualifications/${qualificationId}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'QUALIFIED', reason: 'initial sample approved' }),
    });
    assert.equal(r2.status, 200);
    const body = await r2.json();
    assert.equal(body.status, 'QUALIFIED');
    assert.equal(body.conditions.length, 2);
  });

  await t.test('REVOKED is terminal for a qualification — no further transition is accepted', async () => {
    const revoke = await fetch(`${baseUrl}/${manufacturerCode}/qualifications/${qualificationId}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'REVOKED', reason: 'contamination incident' }),
    });
    assert.equal(revoke.status, 200);

    const after = await fetch(`${baseUrl}/${manufacturerCode}/qualifications/${qualificationId}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'CANDIDATE' }),
    });
    assert.equal(after.status, 409);
  });

  // ── Suspension / retirement (ADR-0020) ──────────────────────────────────

  await t.test('suspends the QUALIFIED manufacturer, then retires it (soft, never deleted)', async () => {
    const suspend = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'SUSPENDED', reason: 'awaiting re-audit' }),
    });
    assert.equal(suspend.status, 200);

    const reactivate = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'UNDER_REVIEW', reason: 're-audit started' }),
    });
    assert.equal(reactivate.status, 200);

    const retire = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'RETIRED', reason: 'manufacturer ceased operations' }),
    });
    assert.equal(retire.status, 200);
    const body = await retire.json();
    assert.equal(body.status, 'RETIRED');
    assert.ok(body.retired_at);

    const stillThere = await pool.query('SELECT id FROM ebp_manufacturers WHERE id = $1', [manufacturerId]);
    assert.equal(stillThere.rows.length, 1, 'RETIRED must be a soft status, the row is never DELETEd');
  });

  await t.test('RETIRED is terminal — no further status transition is accepted', async () => {
    const res = await fetch(`${baseUrl}/${manufacturerCode}/status`, {
      method: 'POST',
      headers: authed(),
      body: JSON.stringify({ status: 'UNDER_REVIEW' }),
    });
    assert.equal(res.status, 409);
  });
});
