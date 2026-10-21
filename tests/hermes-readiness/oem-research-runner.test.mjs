import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runOemResearch, caseIdFor, isResearchDay, buildPrompt } from '../../scripts/hermes/oem-research-runner.mjs';
import { sendSkuReviewEmail } from '../../scripts/hermes/send-sku-review-email.mjs';

const tuesday = new Date(2026, 9, 27, 6, 17);
const ev = (code) => ({ code, evidence_url: `https://catalog.example.com/${code}`, evidence_sha256: 'c'.repeat(64) });
const gap = (id, extra = {}) => ({ request_id: id, channel: 'hermes_weekly_approved', status: 'detected', first_detected_at: `2026-10-2${id.length % 9}T00:00:00Z`, equipment: { brand: 'VOLVO', model: 'VNX' }, question: 'Investigate all filters', ...extra });
const list = (gaps) => async () => ({ persisted: true, gaps });
const goodFile = (caseId) => ({ schema: 'hermes.sku_research.v1', case_id: caseId, equipment: { brand: 'VOLVO', model: 'VNX' }, researched_by: 'HERMES OEM research (Claude Code)', researched_at: '2026-10-27T07:00:00Z',
  positions: [{ position: 'engine oil', duty: 'HEAVY_DUTY', prefix: 'EL8', oem: ev('21707134'), donaldson: ev('P559999') }] });
// Fake Claude: writes the file named in the prompt, like the real research step.
const writes = (make) => async (prompt) => {
  const out = prompt.match(/Write exactly one file: `([^`]+)`/)[1];
  const caseId = prompt.match(/case_id: `([^`]+)`/)[1];
  const doc = make(caseId);
  if (doc) fs.writeFileSync(out, JSON.stringify(doc));
  return { code: 0, out: doc ? 'DONE 1 positions' : 'UNIDENTIFIED: no exact model in the signal', err: '' };
};

test('runs only on Tuesday and Wednesday', async () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((d) => isResearchDay(new Date(2026, 9, 25 + d))), [false, false, true, true, false, false, false]);
  assert.equal((await runOemResearch({ now: new Date(2026, 9, 26, 8), stateRoot: fs.mkdtempSync(path.join(os.tmpdir(), 'oem-')) })).outcome, 'NOT_DUE');
});

test('prompt carries the case, equipment and output path; secrets never reach the research child', () => {
  const p = buildPrompt(gap('g1'), { caseId: 'gap-abc', outputPath: 'C:\\state\\sku-research\\gap-abc.json', template: 'case {{CASE_ID}} eq {{EQUIPMENT}} out {{OUTPUT_PATH}} q {{QUESTION}}' });
  assert.equal(p, 'case gap-abc eq VOLVO VNX out C:/state/sku-research/gap-abc.json q Investigate all filters');
  const src = fs.readFileSync(path.resolve('scripts/hermes/oem-research-runner.mjs'), 'utf8');
  assert.match(src, /SECRET_ENV = \/DATABASE_URL\|SECRET\|PASSWORD\|API_KEY\|TOKEN/);
});

test('valid file -> DONE and Thursday sees it; other HERMES channels are ignored; 2 per run, 5 per week', async () => {
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oem-'));
  const gaps = [gap('a1'), gap('b22'), gap('c333'), { ...gap('w4'), channel: 'whatsapp' }];
  const r = await runOemResearch({ now: tuesday, stateRoot, listGaps: list(gaps), research: writes(goodFile) });
  assert.equal(r.researched, 2);
  assert.ok(r.results.every((x) => x.status === 'DONE'));
  assert.ok(fs.existsSync(path.join(stateRoot, 'sku-research', `${caseIdFor('a1')}.json`)));
  const again = await runOemResearch({ now: tuesday, stateRoot, listGaps: list(gaps), research: writes(goodFile) });
  assert.deepEqual(again.results.map((x) => x.request_id), ['c333']);
  const capped = await runOemResearch({ now: tuesday, stateRoot, listGaps: list(gaps), research: writes(goodFile), weeklyMax: 3 });
  assert.equal(capped.outcome, 'WEEKLY_CAP_REACHED');
  const mail = await sendSkuReviewEmail({ now: new Date(2026, 9, 29, 6, 17), stateRoot, env: { HERMES_EMAIL_LIVE: 'false' }, loadCatalogue: async () => [], listGaps: list(gaps), stage: async () => {} });
  assert.equal(mail.open_research, 0); // all three researched: none left in the queue
  assert.equal(mail.ready, 0); // the three files propose the same EL89999 -> batch collision holds them for human ordering
});

test('invalid output is set aside and retried once; UNIDENTIFIED is reported, not retried', async () => {
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oem-'));
  const bad = await runOemResearch({ now: tuesday, stateRoot, listGaps: list([gap('x1')]), research: writes((id) => ({ ...goodFile(id), positions: [] })) });
  assert.equal(bad.results[0].status, 'FAILED');
  assert.equal(fs.readdirSync(path.join(stateRoot, 'sku-research')).filter((f) => f.endsWith('.json')).length, 0);
  const retry = await runOemResearch({ now: tuesday, stateRoot, listGaps: list([gap('x1')]), research: writes(() => null) });
  assert.equal(retry.results[0].status, 'UNIDENTIFIED');
  assert.equal((await runOemResearch({ now: tuesday, stateRoot, listGaps: list([gap('x1')]), research: writes(goodFile) })).researched, 0);
});

test('an automated "not found" never becomes a verified absence: flags are stripped, the position stays incomplete', async () => {
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oem-'));
  const withAbsence = (id) => ({ ...goodFile(id), positions: [{ position: 'engine oil', duty: 'HEAVY_DUTY', prefix: 'EL8', oem: ev('24723086'), donaldson_absence_verified: true, fleetguard_absence_verified: true }] });
  const r = await runOemResearch({ now: tuesday, stateRoot, listGaps: list([gap('z1')]), research: writes(withAbsence) });
  assert.equal(r.results[0].status, 'DONE');
  const saved = JSON.parse(fs.readFileSync(path.join(stateRoot, 'sku-research', `${caseIdFor('z1')}.json`), 'utf8'));
  assert.equal('donaldson_absence_verified' in saved.positions[0], false);
  const mail = await sendSkuReviewEmail({ now: new Date(2026, 9, 29, 6, 17), stateRoot, env: { HERMES_EMAIL_LIVE: 'false' }, loadCatalogue: async () => [], listGaps: list([]), stage: async () => {} });
  assert.equal(mail.ready, 0);
  assert.match(fs.readFileSync(mail.preview, 'utf8'), /DONALDSON_NOT_RESEARCHED/);
});
