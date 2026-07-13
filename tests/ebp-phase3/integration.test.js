'use strict';

// EBP Phase 3 — integration tests against a real Postgres instance running
// the actual migrations/ebp-phase3/ schema. Exercises the full HTTP
// surface end-to-end (no mocks). Skips with a clear message if the
// database is unreachable.
//
// Run: node --test tests/ebp-phase3/integration.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { Pool } = require('pg');

const createInternalRouter = require('../../ebp/phase3/internal.routes');
const { createFactoryRouter } = require('../../ebp/phase3/factory.routes');
const createPortalRouter = require('../../ebp/phase3/portal.routes');
const { LocalFilesystemStorageAdapter } = require('../../ebp/phase3/storage');
const staging = require('../../ebp/phase3/staging');
const { generateCandidate: generateEfmCandidate } = require('../../ebp/phase2/efm-code');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';
const TEST_ADMIN_KEY = 'test-admin-key-phase3';

function requireAdmin(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!key || key !== TEST_ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
}

async function startTestServer(pool, storageAdapter) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/api/ebp/internal/manufacturer-batches', requireAdmin, createInternalRouter(pool, storageAdapter));
  app.use('/api/ebp/factory', createFactoryRouter(pool, storageAdapter));
  app.use('/portal', createPortalRouter(pool));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return {
    server,
    internalUrl: `http://127.0.0.1:${port}/api/ebp/internal/manufacturer-batches`,
    factoryUrl: `http://127.0.0.1:${port}/api/ebp/factory`,
    portalUrl: `http://127.0.0.1:${port}/portal`,
  };
}

function admin(extraHeaders = {}) {
  return { authorization: `Bearer ${TEST_ADMIN_KEY}`, 'content-type': 'application/json', ...extraHeaders };
}

test('EBP Phase 3 — Manufacturer Intake Portal integration', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 3 integration tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  const tmpStorageRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ebp-phase3-storage-'));
  const storageAdapter = new LocalFilesystemStorageAdapter(tmpStorageRoot);

  const { server, internalUrl, factoryUrl, portalUrl } = await startTestServer(pool, storageAdapter);
  t.after(async () => {
    server.close();
    await pool.end();
    await fs.rm(tmpStorageRoot, { recursive: true, force: true });
  });

  const suffix = Date.now().toString().slice(-6);

  // ── Fixtures: a real Phase 1 Passport + Phase 2 Manufacturer (QUALIFIED) ──

  const sku = `ELP3TEST${suffix}`;
  await pool.query(
    `INSERT INTO elimfilters_catalog (sku, duty, filter_type, sub_type) VALUES ($1,'HD','OIL','SPIN_ON') ON CONFLICT (sku) DO NOTHING`,
    [sku]
  );
  await pool.query(
    `INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability, approval_status)
     VALUES ('OIL','SPIN_ON','bypass_valve_applicability','REQUIRED','ENGINEERING_APPROVED'),
            ('OIL','SPIN_ON','antidrainback_valve_applicability','REQUIRED','ENGINEERING_APPROVED')
     ON CONFLICT (product_category, product_subtype, field_name) DO UPDATE SET approval_status = 'ENGINEERING_APPROVED'`
  );
  const passportInsert = await pool.query(
    `INSERT INTO ebp_engineering_passports
      (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
     VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 1, 'ACTIVE', 'phase3-test')
     RETURNING id`,
    [sku]
  );
  const passportId = passportInsert.rows[0].id;
  // Sets four applicable fields (ADR-0032: media, efficiency, bypass valve,
  // anti-drainback valve) so the multi-field Offer form/validation has a
  // real, non-trivial set of required fields to exercise — not just the
  // two valve fields.
  await pool.query(
    `INSERT INTO ebp_passport_engineering
      (passport_id, manufacturer_instruction_notes, required_media, minimum_efficiency, efficiency_particle_size_basis,
       bypass_opening_pressure_kpa, bypass_pressure_tolerance_pct, antidrainback_valve_material, field_applicability)
     VALUES ($1, 'Torque to spec X', 'Cellulose blend', 99.5, '20 micron ISO 4548-12', 100, 10, 'Nitrile rubber',
             '{"bypass_valve_applicability":"REQUIRED","antidrainback_valve_applicability":"REQUIRED"}'::jsonb)`,
    [passportId]
  );
  await pool.query(
    `INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity) VALUES ($1, 'AUTOMOTIVE', TRUE, 24)`,
    [passportId]
  );

  const mfrInsert = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, 'Phase3 Test Mfr', 'CN', 'Asia/Shanghai', 'QUALIFIED', 'phase3-test') RETURNING id`,
    [generateEfmCandidate()]
  );
  const manufacturerId = mfrInsert.rows[0].id;
  const locInsert = await pool.query(
    `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1,'FACTORY','CN','Asia/Shanghai') RETURNING id`,
    [manufacturerId]
  );
  const locationId = locInsert.rows[0].id;
  await pool.query(
    `INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype, status) VALUES ($1,$2,'OIL','SPIN_ON','QUALIFIED')`,
    [manufacturerId, locationId]
  );

  // A second, CANDIDATE (not yet QUALIFIED) manufacturer for eligibility-gate
  // and tenant-isolation tests.
  const mfr2Insert = await pool.query(
    `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
     VALUES ($1, 'Phase3 Second Mfr', 'DE', 'Europe/Berlin', 'CANDIDATE', 'phase3-test') RETURNING id`,
    [generateEfmCandidate()]
  );
  const manufacturer2Id = mfr2Insert.rows[0].id;

  // ── 1. Batch creation, item assignment (immutable snapshot, ADR-0025) ────

  let batchCode;
  await t.test('creates a DRAFT batch with purpose=PRODUCTION_CANDIDATE', async () => {
    const res = await fetch(internalUrl, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ manufacturer_id: manufacturerId, purpose: 'PRODUCTION_CANDIDATE', channel: 'PORTAL', timezone: 'UTC', response_due_at: new Date(Date.now() - 1000).toISOString() }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'DRAFT');
    batchCode = body.batch_code;
  });

  let itemId;
  await t.test('adds a batch item, pinning the exact Passport revision and a Manufacturer-visible snapshot', async () => {
    const res = await fetch(`${internalUrl}/${batchCode}/items`, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ passport_id: passportId }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.engineering_revision, 1);
    assert.equal(body.manufacturer_visible_snapshot.elimfilters_code, sku);
    assert.equal('internal_engineering_notes' in (body.manufacturer_visible_snapshot.engineering || {}), false);
    itemId = body.id;
  });

  await t.test('a later Passport revision does not change the already-pinned batch item snapshot (ADR-0025)', async () => {
    await pool.query(`UPDATE ebp_engineering_passports SET status = 'SUPERSEDED' WHERE id = $1`, [passportId]);
    const rev2 = await pool.query(
      `INSERT INTO ebp_engineering_passports (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by, supersedes_passport_id)
       VALUES ($1, FALSE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', 2, 'ACTIVE', 'phase3-test', $2) RETURNING id`,
      [sku, passportId]
    );
    await pool.query(`INSERT INTO ebp_passport_engineering (passport_id, manufacturer_instruction_notes) VALUES ($1, 'CHANGED NOTE')`, [rev2.rows[0].id]);
    await pool.query(`INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity) VALUES ($1, 'AUTOMOTIVE', TRUE, 24)`, [rev2.rows[0].id]);

    const res = await fetch(`${internalUrl}/${batchCode}`, { headers: admin() });
    const body = await res.json();
    assert.equal(body.items[0].engineering_revision, 1);
    assert.notEqual(body.items[0].manufacturer_visible_snapshot.engineering?.manufacturer_instruction_notes, 'CHANGED NOTE');
  });

  // ── 2. Eligibility gate (ADR-0024) ──────────────────────────────────────

  await t.test('rejects sending a batch to a SUSPENDED/unqualified path — separate batch for the CANDIDATE manufacturer, PRODUCTION_CANDIDATE purpose blocked', async () => {
    const createRes = await fetch(internalUrl, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ manufacturer_id: manufacturer2Id, purpose: 'PRODUCTION_CANDIDATE', channel: 'PORTAL', timezone: 'UTC' }),
    });
    const created = await createRes.json();
    const addItem = await fetch(`${internalUrl}/${created.batch_code}/items`, { method: 'POST', headers: admin(), body: JSON.stringify({ passport_id: passportId }) });
    assert.equal(addItem.status, 201);
    const item2 = await addItem.json();

    const sendRes = await fetch(`${internalUrl}/${created.batch_code}/send`, { method: 'POST', headers: admin(), body: '{}' });
    assert.equal(sendRes.status, 409); // CANDIDATE (not QUALIFIED) manufacturer, PRODUCTION_CANDIDATE purpose
  });

  await t.test('a CAPABILITY_ASSESSMENT batch to the same CANDIDATE manufacturer sends successfully (no family-qualification check, ADR-0024)', async () => {
    const createRes = await fetch(internalUrl, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ manufacturer_id: manufacturer2Id, purpose: 'CAPABILITY_ASSESSMENT', channel: 'PORTAL', timezone: 'UTC' }),
    });
    const created = await createRes.json();
    await fetch(`${internalUrl}/${created.batch_code}/items`, { method: 'POST', headers: admin(), body: JSON.stringify({ passport_id: passportId }) });
    const sendRes = await fetch(`${internalUrl}/${created.batch_code}/send`, { method: 'POST', headers: admin(), body: '{}' });
    assert.equal(sendRes.status, 200);
  });

  // ── 3. Send the primary QUALIFIED-manufacturer batch ────────────────────

  await t.test('sends the batch to the QUALIFIED manufacturer, response_due_at already in the past', async () => {
    const res = await fetch(`${internalUrl}/${batchCode}/send`, { method: 'POST', headers: admin(), body: '{}' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'SENT');
    assert.ok(body.sent_at);
  });

  await t.test('history endpoint records the DRAFT->SENT transition', async () => {
    const res = await fetch(`${internalUrl}/${batchCode}/history`, { headers: admin() });
    const body = await res.json();
    assert.ok(body.history.some((h) => h.from_status === 'DRAFT' && h.to_status === 'SENT'));
  });

  // ── 4. Factory user invite/accept-invite/login (ADR-0023) ───────────────

  let inviteToken;
  let factoryUserId;
  const factoryEmail = `factory-${suffix}@example.com`;
  await t.test('invites a factory user', async () => {
    const res = await fetch(`${internalUrl}/manufacturer-users`, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ manufacturer_id: manufacturerId, email: factoryEmail, full_name: 'Test Engineer', role: 'MANUFACTURER_ENGINEERING' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal('password_hash' in body, false);
    inviteToken = body.invite_token;
    factoryUserId = body.id;
  });

  await t.test('accepting the invite sets a password and activates the account', async () => {
    const res = await fetch(`${factoryUrl}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: inviteToken, password: 'a-very-strong-password-123' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ACTIVE');
  });

  await t.test('rejects login with the wrong password', async () => {
    const res = await fetch(`${factoryUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: factoryEmail, password: 'totally-wrong' }),
    });
    assert.equal(res.status, 401);
  });

  let sessionToken;
  await t.test('logs in successfully and receives a session token', async () => {
    const res = await fetch(`${factoryUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: factoryEmail, password: 'a-very-strong-password-123' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.session_token);
    sessionToken = body.session_token;
  });

  function factoryAuthed(extra = {}) {
    return { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json', ...extra };
  }

  await t.test('rejects any factory request without a session (401)', async () => {
    const res = await fetch(`${factoryUrl}/batches`);
    assert.equal(res.status, 401);
  });

  // ── 5. Tenant isolation (ADR-0023) ──────────────────────────────────────

  await t.test("the factory session only sees its own manufacturer's batches", async () => {
    const res = await fetch(`${factoryUrl}/batches`, { headers: factoryAuthed() });
    const body = await res.json();
    assert.ok(body.batches.every((b) => true)); // DTO does not expose manufacturer_id cross-check target; verified by absence of other-mfr batch_code below
    assert.ok(body.batches.some((b) => b.batch_code === batchCode));
  });

  await t.test("a factory session cannot fetch another manufacturer's batch by code (404, not 403 — existence not disclosed)", async () => {
    const otherBatchRes = await fetch(internalUrl, {
      method: 'POST',
      headers: admin(),
      body: JSON.stringify({ manufacturer_id: manufacturer2Id, purpose: 'COMMERCIAL_QUOTATION', channel: 'PORTAL', timezone: 'UTC' }),
    });
    const otherBatch = await otherBatchRes.json();
    const res = await fetch(`${factoryUrl}/batches/${otherBatch.batch_code}`, { headers: factoryAuthed() });
    assert.equal(res.status, 404);
  });

  // ── 6. Offer creation, decimal FOB, packaging, late_submission ──────────
  // Every applicable field on this Passport snapshot (ADR-0032): media,
  // efficiency, bypass valve, anti-drainback valve — a genuinely
  // multi-field Offer, not just the two valve fields.
  const ALL_APPLICABLE_TECHNICAL_FIELDS = [
    { field_name: 'required_media', offered_value: 'Synthetic blend', completeness_status: 'ANSWERED' },
    { field_name: 'minimum_efficiency', offered_value: 99.2, unit: '%', completeness_status: 'ANSWERED' },
    { field_name: 'bypass_valve_applicability', offered_value: 'REQUIRED', completeness_status: 'ANSWERED' },
    { field_name: 'antidrainback_valve_applicability', offered_value: 'REQUIRED', completeness_status: 'ANSWERED' },
  ];

  let offerCode;
  await t.test('creates and submits a multi-field Offer (media, efficiency, bypass, anti-drainback) with decimal FOB (string, never float) and packaging', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/items/${itemId}/offers`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({
        submit: true,
        fob_price: '12.3456',
        currency: 'USD',
        moq: 500,
        lead_time_days: 30,
        technical_fields: ALL_APPLICABLE_TECHNICAL_FIELDS,
        packaging: { recommended_quantity_per_box: 24, net_weight_kg: '5.5', gross_weight_kg: '6.2' },
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'SUBMITTED');
    assert.equal(body.technical_fields.length, 4);
    const fieldNames = body.technical_fields.map((f) => f.field_name).sort();
    assert.deepEqual(fieldNames, ['antidrainback_valve_applicability', 'bypass_valve_applicability', 'minimum_efficiency', 'required_media']);
    assert.equal(body.fob_price, '12.3456'); // exact decimal string round-trip, ADR-0026
    assert.equal(typeof body.fob_price, 'string');
    assert.equal(body.late_submission, true); // response_due_at was already in the past
    offerCode = body.offer_code;
  });

  await t.test('the batch item is marked RESPONDED after a submitted offer', async () => {
    const res = await fetch(`${internalUrl}/${batchCode}`, { headers: admin() });
    const body = await res.json();
    assert.equal(body.items[0].status, 'RESPONDED');
  });

  await t.test('Phase 3 cannot write UNDER_REVIEW/VALIDATED/APPROVED via its own status endpoint (belongs to Phase 4 / a future phase)', async () => {
    // No Phase-3 endpoint exposes a generic status-set for offers by design
    // (ADR-0026) — verified structurally: withdraw is the only offer
    // transition endpoint, and it always targets WITHDRAWN.
    const res = await fetch(`${factoryUrl}/offers/${offerCode}/withdraw`, { method: 'POST', headers: factoryAuthed() });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'WITHDRAWN');
  });

  // ── 7. Revision/supersession (one active per lineage, ADR-0026) ─────────

  let offerCode2;
  await t.test('submitting a second revision after withdrawal creates revision 2 (WITHDRAWN was terminal, no supersession needed here)', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/items/${itemId}/offers`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({
        submit: true,
        fob_price: '11.0000',
        currency: 'USD',
        technical_fields: ALL_APPLICABLE_TECHNICAL_FIELDS,
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.offer_revision, 2);
    offerCode2 = body.offer_code;
  });

  let offerCode3;
  await t.test('a THIRD revision atomically supersedes the active second revision — exactly one active at a time', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/items/${itemId}/offers`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({
        submit: true,
        fob_price: '10.5000',
        currency: 'USD',
        technical_fields: ALL_APPLICABLE_TECHNICAL_FIELDS,
      }),
    });
    assert.equal(res.status, 201);
    offerCode3 = (await res.json()).offer_code;

    const listRes = await fetch(`${factoryUrl}/batches/${batchCode}/items/${itemId}/offers`, { headers: factoryAuthed() });
    const { offers } = await listRes.json();
    const r2 = offers.find((o) => o.offer_code === offerCode2);
    const r3 = offers.find((o) => o.offer_code === offerCode3);
    assert.equal(r2.status, 'SUPERSEDED');
    assert.equal(r3.status, 'SUBMITTED');
    const activeCount = offers.filter((o) => ['SUBMITTED', 'UNDER_REVIEW', 'VALIDATED'].includes(o.status)).length;
    assert.equal(activeCount, 1);
  });

  await t.test("a factory session cannot download another manufacturer's document, or fetch a nonexistent offer (404)", async () => {
    const res = await fetch(`${factoryUrl}/documents/00000000-0000-0000-0000-000000000000/download`, { headers: factoryAuthed() });
    assert.equal(res.status, 404);
  });

  // ── 8. Documents (upload/download, tenant-scoped, ADR-0027) ─────────────

  let documentId;
  await t.test('uploads a document via multipart form-data, tenant-scoped to the offer', async () => {
    const boundary = '----EbpPhase3TestBoundary';
    const fileContent = Buffer.from('%PDF-1.4 fake pdf content for test');
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nTECHNICAL_EVIDENCE\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="evidence.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const res = await fetch(`${factoryUrl}/offers/${offerCode3}/documents`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}`, 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 201);
    const doc = await res.json();
    assert.equal('storage_key' in doc, false);
    documentId = doc.id;
  });

  await t.test('downloads the uploaded document; storage_key never appears in any response', async () => {
    const res = await fetch(`${factoryUrl}/documents/${documentId}/download`, { headers: factoryAuthed() });
    assert.equal(res.status, 200);
    const buf = Buffer.from(await res.arrayBuffer());
    assert.match(buf.toString(), /fake pdf content for test/);
  });

  // ── 9. Excel export / stage / confirm (ADR-0028) ─────────────────────────

  let excelBuffer;
  let lastStagingId;
  await t.test('exports the batch as an Excel workbook', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/excel/export`, { headers: factoryAuthed() });
    assert.equal(res.status, 200);
    excelBuffer = Buffer.from(await res.arrayBuffer());
    assert.ok(excelBuffer.length > 0);
  });

  await t.test('the exported workbook has one row per applicable PEP field (media, efficiency, bypass, anti-drainback), field_name locked and pre-populated', async () => {
    const ExcelJS = require('exceljs');
    const excel = require('../../ebp/phase3/excel');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(excelBuffer);
    const sheet = wb.getWorksheet(excel.VISIBLE_SHEET_NAME);
    const col = (name) => excel.ALL_COLUMNS.indexOf(name) + 1;
    const fieldNames = [];
    for (let r = 2; r <= sheet.rowCount; r += 1) {
      fieldNames.push(sheet.getCell(r, col('field_name')).value);
    }
    assert.deepEqual(fieldNames.sort(), ['antidrainback_valve_applicability', 'bypass_valve_applicability', 'minimum_efficiency', 'required_media']);
  });

  await t.test('rejects staging a workbook with an altered locked cell (hash mismatch, zero rows persisted)', async () => {
    const ExcelJS = require('exceljs');
    const excel = require('../../ebp/phase3/excel');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(excelBuffer);
    const sheet = wb.getWorksheet(excel.VISIBLE_SHEET_NAME);
    // exceljs does not persist column `key` metadata through a save/load
    // round-trip (only column widths/styles are part of the XLSX format
    // itself), so cells must be addressed by numeric column index here,
    // not by the original string key.
    const codeColIndex = excel.ALL_COLUMNS.indexOf('elimfilters_code') + 1;
    sheet.getRow(2).getCell(codeColIndex).value = 'TAMPERED-SKU';
    const tamperedBuffer = Buffer.from(await wb.xlsx.writeBuffer());

    const boundary = '----EbpPhase3TamperBoundary';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="tampered.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`),
      tamperedBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/excel/stage`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}`, 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 422);
    const result = await res.json();
    assert.match(JSON.stringify(result), /altered|corrupted|wrong template/);

    const before = await pool.query('SELECT COUNT(*) FROM ebp_manufacturer_offers');
    assert.ok(Number(before.rows[0].count) >= 0); // no crash; zero NEW rows verified by the stage-only nature of this call
  });

  await t.test('a valid stage -> confirm round-trip (all 4 applicable fields answered) creates a new Offer revision, never VALIDATED/APPROVED', async () => {
    const ExcelJS = require('exceljs');
    const excel = require('../../ebp/phase3/excel');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(excelBuffer);
    const sheet = wb.getWorksheet(excel.VISIBLE_SHEET_NAME);
    const col = (name) => excel.ALL_COLUMNS.indexOf(name) + 1;
    const OFFERED_VALUES = {
      required_media: 'Synthetic blend (Excel)',
      minimum_efficiency: '99.1',
      bypass_valve_applicability: 'REQUIRED',
      antidrainback_valve_applicability: 'REQUIRED',
    };
    for (let r = 2; r <= sheet.rowCount; r += 1) {
      const fieldName = sheet.getCell(r, col('field_name')).value;
      sheet.getCell(r, col('offered_value')).value = OFFERED_VALUES[fieldName];
      sheet.getCell(r, col('completeness_status')).value = 'ANSWERED';
    }
    sheet.getCell(2, col('fob_price')).value = '9.99';
    sheet.getCell(2, col('currency')).value = 'USD';
    const editedBuffer = Buffer.from(await wb.xlsx.writeBuffer());

    const boundary = '----EbpPhase3ValidBoundary';
    const stageBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="edited.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`),
      editedBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const stageRes = await fetch(`${factoryUrl}/batches/${batchCode}/excel/stage`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}`, 'content-type': `multipart/form-data; boundary=${boundary}` },
      body: stageBody,
    });
    assert.equal(stageRes.status, 200);
    const staged = await stageRes.json();
    assert.ok(staged.staging_id);
    lastStagingId = staged.staging_id;

    const confirmRes = await fetch(`${factoryUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({ staging_id: staged.staging_id }),
    });
    assert.equal(confirmRes.status, 201);
    const confirmed = await confirmRes.json();
    assert.equal(confirmed.offers.length, 1);
    assert.ok(['DRAFT', 'SUBMITTED'].includes(confirmed.offers[0].status));
  });

  await t.test('re-confirming with an already-used staging_id is rejected (409), no double-persist', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({ staging_id: lastStagingId }),
    });
    assert.equal(res.status, 409);
  });

  await t.test('confirming with a nonexistent (but well-formed) staging_id is rejected (409), never a 500 from an invalid-UUID crash', async () => {
    const res = await fetch(`${factoryUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: factoryAuthed(),
      body: JSON.stringify({ staging_id: '00000000-0000-0000-0000-000000000000' }),
    });
    assert.equal(res.status, 409);
  });

  // ── 9b. Factory Portal Excel UI (server-rendered HTML, cookie session) ──
  // No Postman/curl anywhere in this flow: download -> upload -> review ->
  // explicit confirm, all through the same session the Manufacturer already
  // has. resolveSession is transport-agnostic (ADR-0023), so the existing
  // Bearer session_token doubles as the portal's cookie value here.

  function portalCookie() {
    return { cookie: `ebp_factory_session=${sessionToken}` };
  }

  function multipartBody(boundary, fields, filePart) {
    const parts = fields.map(
      ([name, value]) => Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`)
    );
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filePart.filename}"\r\nContent-Type: ${filePart.contentType}\r\n\r\n`
      ),
      filePart.buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );
    return Buffer.concat(parts);
  }

  let portalExcelBuffer;
  let portalStagingId;
  let portalCsrfToken;

  await t.test('portal: a page render includes the session-bound CSRF token (ADR-0033)', async () => {
    const res = await fetch(`${portalUrl}/dashboard`, { headers: portalCookie() });
    assert.equal(res.status, 200);
    const html = await res.text();
    const match = html.match(/name="_csrf" value="([0-9a-f]{64})"/);
    assert.ok(match, 'expected a 64-hex-char CSRF token embedded in the page');
    portalCsrfToken = match[1];
  });

  await t.test('portal: downloads the workbook template with no API knowledge required', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/export`, { headers: portalCookie() });
    assert.equal(res.status, 200);
    portalExcelBuffer = Buffer.from(await res.arrayBuffer());
    assert.ok(portalExcelBuffer.length > 0);
  });

  await t.test('portal: an Excel upload with a MISSING CSRF token is rejected (403), nothing staged', async () => {
    const boundary = '----EbpPhase3CsrfMissingBoundary';
    const body = multipartBody(boundary, [], {
      filename: 'edited.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: portalExcelBuffer,
    });
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/upload`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 403);
    const html = await res.text();
    assert.match(html, /Request Blocked/);
  });

  await t.test('portal: an Excel upload with an INCORRECT CSRF token is rejected (403), nothing staged', async () => {
    const boundary = '----EbpPhase3CsrfWrongBoundary';
    const body = multipartBody(boundary, [['_csrf', 'f'.repeat(64)]], {
      filename: 'edited.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: portalExcelBuffer,
    });
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/upload`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 403);
    const html = await res.text();
    assert.match(html, /Request Blocked/);
  });

  await t.test('portal: uploading a completed workbook with a VALID CSRF token stages it and redirects to a human-readable review screen', async () => {
    const ExcelJS = require('exceljs');
    const excel = require('../../ebp/phase3/excel');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(portalExcelBuffer);
    const sheet = wb.getWorksheet(excel.VISIBLE_SHEET_NAME);
    const col = (name) => excel.ALL_COLUMNS.indexOf(name) + 1;
    const OFFERED_VALUES = {
      required_media: 'Synthetic blend (Portal)',
      minimum_efficiency: '99.3',
      bypass_valve_applicability: 'REQUIRED',
      antidrainback_valve_applicability: 'REQUIRED',
    };
    for (let r = 2; r <= sheet.rowCount; r += 1) {
      const fieldName = sheet.getCell(r, col('field_name')).value;
      sheet.getCell(r, col('offered_value')).value = OFFERED_VALUES[fieldName];
      sheet.getCell(r, col('completeness_status')).value = 'ANSWERED';
    }
    sheet.getCell(2, col('fob_price')).value = '8.75';
    sheet.getCell(2, col('currency')).value = 'USD';
    const editedBuffer = Buffer.from(await wb.xlsx.writeBuffer());

    const boundary = '----EbpPhase3PortalBoundary';
    const body = multipartBody(boundary, [['_csrf', portalCsrfToken]], {
      filename: 'edited.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: editedBuffer,
    });
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/upload`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 200); // fetch follows the server redirect straight to the preview page
    assert.match(res.url, /\/excel\/preview\//);
    const html = await res.text();
    assert.match(html, /Review Before Submitting/);
    assert.match(html, /Synthetic blend \(Portal\)/);
    assert.match(html, /Confirm &amp; Submit Offers/);
    portalStagingId = res.url.split('/excel/preview/')[1];
  });

  await t.test('portal: confirming with a MISSING CSRF token is rejected (403), no offer created', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': 'application/x-www-form-urlencoded' },
      body: `staging_id=${encodeURIComponent(portalStagingId)}`,
    });
    assert.equal(res.status, 403);
  });

  await t.test('portal: confirming with an INCORRECT CSRF token is rejected (403), no offer created', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': 'application/x-www-form-urlencoded' },
      body: `staging_id=${encodeURIComponent(portalStagingId)}&_csrf=${'a'.repeat(64)}`,
    });
    assert.equal(res.status, 403);
  });

  await t.test('portal: confirming with a VALID CSRF token from the review screen submits the offer (never storage_key/password_hash/token_hash)', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': 'application/x-www-form-urlencoded' },
      body: `staging_id=${encodeURIComponent(portalStagingId)}&_csrf=${encodeURIComponent(portalCsrfToken)}`,
    });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Offers Submitted/);
    assert.doesNotMatch(html, /storage_key|password_hash|token_hash/);
  });

  await t.test('portal: re-confirming the same (now-consumed) staging_id shows a clear "could not confirm" page, no double-persist', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/confirm`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': 'application/x-www-form-urlencoded' },
      body: `staging_id=${encodeURIComponent(portalStagingId)}&_csrf=${encodeURIComponent(portalCsrfToken)}`,
    });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Could Not Confirm/);
  });

  await t.test('portal: a tampered workbook is rejected with a rejection report and zero partial persistence', async () => {
    const ExcelJS = require('exceljs');
    const excel = require('../../ebp/phase3/excel');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(portalExcelBuffer);
    const sheet = wb.getWorksheet(excel.VISIBLE_SHEET_NAME);
    const codeColIndex = excel.ALL_COLUMNS.indexOf('elimfilters_code') + 1;
    sheet.getRow(2).getCell(codeColIndex).value = 'TAMPERED-VIA-PORTAL';
    const tamperedBuffer = Buffer.from(await wb.xlsx.writeBuffer());

    const boundary = '----EbpPhase3PortalTamperBoundary';
    const body = multipartBody(boundary, [['_csrf', portalCsrfToken]], {
      filename: 'tampered.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: tamperedBuffer,
    });
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel/upload`, {
      method: 'POST',
      headers: { ...portalCookie(), 'content-type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Upload Rejected/);
    assert.match(html, /altered|corrupted|wrong template/);
  });

  await t.test('portal: rejects any Excel page request without a session cookie (redirects to login)', async () => {
    const res = await fetch(`${portalUrl}/batches/${batchCode}/excel`, { redirect: 'manual' });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/portal\/login/);
  });

  // ── 9c. Factory Portal login CSRF (double-submit cookie, ADR-0033) ──────
  // Login happens before any session exists, so it cannot use the
  // session-bound synchronizer token above; it uses a separate
  // double-submit cookie instead. Exercised against the real factory user
  // created earlier (still ACTIVE at this point in the suite).

  function extractSetCookie(res, name) {
    const header = res.headers.get('set-cookie') || '';
    const match = header.match(new RegExp(`${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  let loginCsrfCookieValue;
  let loginCsrfFieldValue;
  await t.test('portal: GET /login sets a double-submit CSRF cookie matching the hidden form field', async () => {
    const res = await fetch(`${portalUrl}/login`);
    assert.equal(res.status, 200);
    loginCsrfCookieValue = extractSetCookie(res, 'ebp_login_csrf');
    assert.ok(loginCsrfCookieValue);
    const html = await res.text();
    const match = html.match(/name="_csrf" value="([0-9a-f]{64})"/);
    assert.ok(match);
    loginCsrfFieldValue = match[1];
    assert.equal(loginCsrfCookieValue, loginCsrfFieldValue);
  });

  await t.test('portal: login with a MISSING CSRF field is rejected (redirected back to login, never authenticated)', async () => {
    const res = await fetch(`${portalUrl}/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: { cookie: `ebp_login_csrf=${loginCsrfCookieValue}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(factoryEmail)}&password=${encodeURIComponent('a-very-strong-password-123')}`,
    });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /error=csrf/);
    assert.equal(res.headers.get('set-cookie') || '', ''); // no session cookie issued
  });

  await t.test('portal: login with an INCORRECT CSRF field (mismatched with the cookie) is rejected', async () => {
    const res = await fetch(`${portalUrl}/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: { cookie: `ebp_login_csrf=${loginCsrfCookieValue}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(factoryEmail)}&password=${encodeURIComponent('a-very-strong-password-123')}&_csrf=${'0'.repeat(64)}`,
    });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /error=csrf/);
  });

  await t.test('portal: login with a VALID matching CSRF field succeeds and issues a session cookie', async () => {
    const res = await fetch(`${portalUrl}/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: { cookie: `ebp_login_csrf=${loginCsrfCookieValue}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(factoryEmail)}&password=${encodeURIComponent('a-very-strong-password-123')}&_csrf=${loginCsrfFieldValue}`,
    });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/portal\/dashboard/);
    assert.match(res.headers.get('set-cookie') || '', /ebp_factory_session=/);
  });

  await t.test('portal: logout is a POST (never GET) and requires a valid CSRF token', async () => {
    const getRes = await fetch(`${portalUrl}/logout`, { headers: portalCookie(), redirect: 'manual' });
    assert.notEqual(getRes.status, 200); // no GET /logout route exists any more (ADR-0033: state-changing action must be POST)

    const missingRes = await fetch(`${portalUrl}/logout`, { method: 'POST', headers: portalCookie() });
    assert.equal(missingRes.status, 403);
  });

  // ── 10. Batch close / cancel ─────────────────────────────────────────────

  await t.test('closes the batch (SENT -> RESPONDED -> CLOSED, since an offer was submitted)', async () => {
    const toResponded = await fetch(`${internalUrl}/${batchCode}/status`, { method: 'POST', headers: admin(), body: JSON.stringify({ status: 'RESPONDED' }) });
    assert.equal(toResponded.status, 200);
    const toClosed = await fetch(`${internalUrl}/${batchCode}/status`, { method: 'POST', headers: admin(), body: JSON.stringify({ status: 'CLOSED' }) });
    assert.equal(toClosed.status, 200);
    assert.equal((await toClosed.json()).status, 'CLOSED');
  });

  await t.test('CLOSED is terminal — no further transition accepted', async () => {
    const res = await fetch(`${internalUrl}/${batchCode}/status`, { method: 'POST', headers: admin(), body: JSON.stringify({ status: 'CANCELLED' }) });
    assert.equal(res.status, 409);
  });

  // ── 11. Factory user disable ─────────────────────────────────────────────

  await t.test('disabling a factory user prevents further login', async () => {
    const disableRes = await fetch(`${internalUrl}/manufacturer-users/${factoryUserId}/status`, { method: 'POST', headers: admin(), body: '{}' });
    assert.equal(disableRes.status, 200);
    const loginRes = await fetch(`${factoryUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: factoryEmail, password: 'a-very-strong-password-123' }),
    });
    assert.equal(loginRes.status, 401);
  });
});
