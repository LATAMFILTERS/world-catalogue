import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { collectAuthorized, buildBatch, prBody, buildAuthorizationBatch } from '../../scripts/hermes/catalogue-authorization-batch.mjs';

const require = createRequire(import.meta.url);
const { validateBatch, entryFor, applyBatch } = require('../../scripts/migrations/run_284_apply_authorized_equipment_applications.js');
const SHA = 'a'.repeat(64);

const decision = (code, extra = {}) => ({
  entity_code: code, approval_required: true, case_id: 'gap-abc123', equipment: { brand: 'Volvo', model: 'FH16', engine: 'D16K' }, position: 'Oil filter',
  duty: 'HEAVY_DUTY', prefix: 'EL8', oem_code: '21707134', state: 'ALREADY_IN_CATALOGUE', proposed_sku: 'EL82100',
  evidence: [{ ref: 'oem', code: '21707134', evidence_url: 'https://volvo.example/parts/21707134', evidence_sha256: SHA }],
  researched_by: 'claude', researched_at: '2026-10-28T10:00:00Z', decision: 'AUTHORIZED', decided_by: 'Victor Abreu', decided_at: '2026-10-29T12:00:00Z', ...extra
});

test('only AUTHORIZED existing-SKU Heavy Duty proposals enter phase 1; new SKUs and Light Duty wait for phase 2', () => {
  const { items, phase2 } = collectAuthorized([
    decision('HERMES_SKU_AAA'),
    decision('HERMES_SKU_NEW', { state: 'READY_FOR_AUTHORIZATION' }),
    decision('HERMES_SKU_LD', { duty: 'LIGHT_DUTY' }),
    decision('HERMES_SKU_REJ', { decision: 'REJECTED' }),
    decision('HERMES_SKU_DONE')
  ], { handled: { HERMES_SKU_DONE: { outcome: 'PR_OPENED' } } });
  assert.deepEqual(items.map((i) => [i.proposal_code, i.sku, i.evidence.source_url]), [['HERMES_SKU_AAA', 'EL82100', 'https://volvo.example/parts/21707134']]);
  assert.deepEqual(phase2, [{ code: 'HERMES_SKU_NEW', reason: 'NEW_SKU_PHASE_2' }, { code: 'HERMES_SKU_LD', reason: 'LIGHT_DUTY_PHASE_2' }]);
  const batch = buildBatch(items, new Date('2026-10-29T13:00:00Z'));
  assert.deepEqual(validateBatch(batch), []);
  assert.match(prBody(batch, null), /EL82100 \| Volvo FH16 \(D16K\)[\s\S]*--batch data\/catalogue-authorizations\/2026-10-29-[a-f0-9]{8}\.json --execute/);
  assert.match(validateBatch({ ...batch, items: [{ ...items[0], evidence: { source_url: 'http://x', evidence_sha256: 'x' } }] }).join(), /evidence needs https/);
  assert.match(validateBatch({ ...batch, items: [{ ...items[0], authorized_by: 'Someone' }] }).join(), /authorized by Victor Abreu/);
});

// Minimal pg double: one catalogue row, the evidence table and the queries the governed write service issues.
function fakeDb(row) {
  const state = { row: structuredClone(row), evidence: [], log: [] };
  return {
    state,
    async query(sql, params = []) {
      state.log.push(sql.trim().split(/\s+/).slice(0, 3).join(' '));
      if (/^(BEGIN|SET LOCAL|COMMIT|ROLLBACK)/.test(sql.trim())) { if (/^ROLLBACK/.test(sql.trim())) state.rolledBack = true; if (/^COMMIT/.test(sql.trim())) state.committed = true; return { rows: [], rowCount: 0 }; }
      if (/FROM (public\.)?elimfilters_catalog WHERE sku=\$1 FOR UPDATE/.test(sql)) return state.row && params[0] === state.row.sku ? { rows: [structuredClone(state.row)], rowCount: 1 } : { rows: [], rowCount: 0 };
      if (/SELECT md5/.test(sql)) return { rows: [{ hash: crypto.createHash('md5').update(params[0]).digest('hex') }] };
      if (/INSERT INTO catalog_application_evidence/.test(sql)) { state.evidence.push({ sku: params[0], kind: params[1], authority: params[3], url: params[4] }); return { rows: [], rowCount: 1 }; }
      if (/UPDATE elimfilters_catalog/.test(sql)) { state.row.equipment_applications = JSON.parse(params[0]); state.row.enrichment_data = JSON.parse(params[2]); return { rows: [], rowCount: 1 }; }
      if (/jsonb_array_length/.test(sql)) return { rows: [{ n: state.row.equipment_applications.length }] };
      throw new Error(`unexpected query: ${sql.slice(0, 80)}`);
    }
  };
}

test('run_284 appends the authorized equipment, keeps existing ones, records evidence, and is idempotent; dry-run rolls back', async () => {
  const existing = { make: 'VOLVO', model: 'FH13', equipment: 'VOLVO FH13', engine: 'D13K', filter_position: 'OIL FILTER' };
  const row = { sku: 'EL82100', duty: 'HEAVY_DUTY', catalog_active: true, codigo_base: 'P552100', equipment_applications: [existing], vehicle_applications: [], oem_codes: [], competitor_codes: [], enrichment_data: {} };
  const { items } = collectAuthorized([decision('HERMES_SKU_AAA')]);
  const batch = buildBatch(items, new Date('2026-10-29T13:00:00Z'));

  const dry = fakeDb(row);
  const dryReport = await applyBatch(dry, batch);
  assert.equal(dryReport.items[0].outcome, 'WOULD_APPLY');
  assert.equal(dry.state.rolledBack, true);
  assert.notEqual(dry.state.committed, true);

  const db = fakeDb(row);
  const report = await applyBatch(db, batch, { execute: true });
  assert.deepEqual(report.items.map((i) => [i.outcome, i.entries_before, i.entries_after]), [['APPLIED', 1, 2]]);
  assert.equal(db.state.committed, true);
  assert.deepEqual(db.state.row.equipment_applications, [existing, entryFor(items[0])]); // appended, nothing removed
  assert.deepEqual(entryFor(items[0]), { make: 'VOLVO', model: 'FH16', equipment: 'VOLVO FH16', engine: 'D16K', filter_position: 'OIL FILTER' });
  assert.ok(db.state.evidence.some((e) => e.kind === 'EQUIPMENT' && e.authority === 'HERMES_OEM_RESEARCH_AUTHORIZED_BY_VICTOR' && e.url === 'https://volvo.example/parts/21707134'));

  const again = fakeDb(db.state.row);
  assert.equal((await applyBatch(again, batch, { execute: true })).items[0].outcome, 'ALREADY_PRESENT');
  assert.equal(again.state.evidence.length, 0);
});

test('run_284 fails closed: unknown, inactive or non-HD SKUs abort the whole batch with a rollback', async () => {
  const { items } = collectAuthorized([decision('HERMES_SKU_AAA')]);
  const batch = buildBatch(items);
  for (const [row, msg] of [[null, /SKU_NOT_FOUND/], [{ sku: 'EL82100', duty: 'HEAVY_DUTY', catalog_active: false, equipment_applications: [] }, /SKU_NOT_ACTIVE/], [{ sku: 'EL82100', duty: 'LIGHT_DUTY', catalog_active: true, equipment_applications: [] }, /SKU_NOT_HEAVY_DUTY/]]) {
    const db = fakeDb(row);
    await assert.rejects(applyBatch(db, batch, { execute: true }), msg);
    assert.equal(db.state.rolledBack, true);
    assert.notEqual(db.state.committed, true);
  }
  await assert.rejects(applyBatch(fakeDb(null), { ...batch, items: [] }), /BATCH_INVALID/);
});

test('the Lenovo builder opens one PR per batch, records the ledger, and never repeats an authorization', async () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-catauth-'));
  fs.mkdirSync(path.join(state, 'sku-decisions'));
  fs.writeFileSync(path.join(state, 'sku-decisions', 'HERMES_SKU_AAA.json'), JSON.stringify(decision('HERMES_SKU_AAA')));
  fs.writeFileSync(path.join(state, 'sku-decisions', 'HERMES_SKU_NEW.json'), JSON.stringify(decision('HERMES_SKU_NEW', { state: 'READY_FOR_AUTHORIZATION' })));
  const calls = [];
  const run = (cmd, args) => { calls.push([cmd, ...args].join(' ')); if (cmd === 'git' && args.includes('worktree') && args.includes('add')) fs.mkdirSync(args.at(-2), { recursive: true }); return cmd === 'gh' ? 'https://github.com/LATAMFILTERS/world-catalogue/pull/9999\n' : ''; };
  const saved = process.env.CATALOG_DATABASE_URL; delete process.env.CATALOG_DATABASE_URL;
  try {
    const res = await buildAuthorizationBatch({ stateRoot: state, live: true, now: new Date('2026-10-29T13:00:00Z'), run });
    assert.equal(res.outcome, 'PR_OPENED');
    assert.equal(res.pr, 'https://github.com/LATAMFILTERS/world-catalogue/pull/9999');
    assert.ok(calls.some((c) => /^git add -- data\/catalogue-authorizations\/2026-10-29-[a-f0-9]{8}\.json$/.test(c)));
    assert.ok(calls.some((c) => c.startsWith('gh pr create')));
    const ledger = JSON.parse(fs.readFileSync(path.join(state, 'catalogue-authorization-ledger.json'), 'utf8'));
    assert.equal(ledger.handled.HERMES_SKU_AAA.outcome, 'PR_OPENED');
    assert.equal(ledger.handled.HERMES_SKU_NEW.outcome, 'PHASE_2');
    assert.equal((await buildAuthorizationBatch({ stateRoot: state, live: true, run })).outcome, 'NOTHING_AUTHORIZED');
  } finally { if (saved !== undefined) process.env.CATALOG_DATABASE_URL = saved; }
});
