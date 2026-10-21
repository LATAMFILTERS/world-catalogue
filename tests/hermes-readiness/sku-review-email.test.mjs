import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { shouldSend, isoWeek, sendSkuReviewEmail } from '../../scripts/hermes/send-sku-review-email.mjs';
import { applySkuDecision } from '../../scripts/hermes/apply-review-decisions-from-db.mjs';

const ev = (code) => ({ code, evidence_url: `https://catalog.example.com/${code}`, evidence_sha256: 'b'.repeat(64) });
const research = { schema: 'hermes.sku_research.v1', case_id: 'volvo-vnx-d13', equipment: { brand: 'VOLVO', model: 'VNX', engine: 'D13' }, researched_by: 'Codex', researched_at: '2026-10-27T10:00:00Z',
  positions: [
    { position: 'engine oil', duty: 'HEAVY_DUTY', prefix: 'EL8', oem: ev('21707134'), donaldson: ev('P559999') },
    { position: 'fuel', duty: 'HEAVY_DUTY', prefix: 'EF9', oem: ev('23658092') }
  ] };
const thursday = new Date(2026, 9, 29, 9, 0); // Thu 2026-10-29 09:00 local

function state() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-sku-mail-'));
  fs.mkdirSync(path.join(root, 'sku-research'));
  fs.writeFileSync(path.join(root, 'sku-research', 'vnx.json'), JSON.stringify(research));
  return root;
}
const env = (extra = {}) => ({ HERMES_EMAIL_LIVE: 'true', HERMES_REVIEW_EMAIL: 'victor@example.com', HERMES_REVIEW_BASE_URL: 'https://review.example.com/hermes/review',
  HERMES_REVIEW_TOKEN_SECRET: 's'.repeat(32), HERMES_REVIEW_ACTIONS_ENABLED: 'true', HERMES_REVIEW_RUN_ID: '1761700000', ...extra });

test('sends on Thursday from 06:00, catches up Fri-Sun, never twice in one ISO week', () => {
  assert.equal(shouldSend(new Date(2026, 9, 29, 5, 59), null), false);
  assert.equal(shouldSend(thursday, null), true);
  assert.equal(shouldSend(new Date(2026, 10, 1, 12, 0), null), true); // Sunday catch-up
  assert.equal(shouldSend(new Date(2026, 9, 26, 9, 0), null), false); // Monday is the intelligence email
  assert.equal(shouldSend(thursday, isoWeek(thursday)), false);
  assert.equal(isoWeek(new Date(2026, 10, 1)), isoWeek(thursday)); // Sunday belongs to the same ISO week
});

test('Thursday email: buttons only on authorizable SKUs, every other state listed, sent once', async () => {
  const stateRoot = state(); const sent = []; const staged = [];
  const deps = { now: thursday, stateRoot, env: env(), loadCatalogue: async () => [], listGaps: async () => ({ gaps: [{ channel: 'hermes_weekly_approved', status: 'detected', equipment: { brand: 'TEREX' } }, { channel: 'whatsapp', status: 'detected' }] }),
    stage: async (c) => staged.push(...c), deliver: async (m) => { sent.push(m); return { outcome: 'SENT' }; } };
  const r = await sendSkuReviewEmail(deps);
  assert.equal(r.outcome, 'SENT');
  assert.equal(r.ready, 1);
  assert.equal(r.open_research, 1);
  assert.deepEqual(staged.map((p) => p.proposed_sku), ['EL89999']);
  const html = sent[0].html;
  assert.equal((html.match(/>AUTORIZAR</g) || []).length, 1);
  assert.match(html, /DONALDSON_NOT_RESEARCHED/);
  assert.match(html, /TEREX/);
  assert.match(sent[0].subject, /1 para autorizar/);
  assert.equal((await sendSkuReviewEmail(deps)).outcome, 'NOT_DUE');
  assert.equal(sent.length, 1);
});

test('catalogue or Review Center unavailable: the email still goes out, without proposals or buttons', async () => {
  const sent = [];
  const r = await sendSkuReviewEmail({ now: thursday, stateRoot: state(), env: env({ HERMES_REVIEW_TOKEN_SECRET: '' }), loadCatalogue: async () => { throw new Error('ECONNREFUSED'); },
    listGaps: async () => ({ gaps: [] }), stage: async () => { throw new Error('unexpected'); }, deliver: async (m) => { sent.push(m); return { outcome: 'SENT' }; } });
  assert.equal(r.outcome, 'SENT');
  assert.match(sent[0].html, /No se pudo leer el catálogo/);
  assert.doesNotMatch(sent[0].html, /AUTORIZAR</);
});

test('AUTORIZAR records the decision only; RECHAZAR too; neither is proposed again', async () => {
  const stateRoot = state();
  const r = await sendSkuReviewEmail({ now: thursday, stateRoot, env: env({ HERMES_EMAIL_LIVE: 'false' }), loadCatalogue: async () => [], listGaps: async () => ({ gaps: [] }), stage: async () => {} });
  assert.equal(r.outcome, 'DRY_RUN');
  const proposal = JSON.parse(fs.readFileSync(path.join(stateRoot, 'sku-proposals.json'), 'utf8')).proposals.find((p) => p.state === 'READY_FOR_AUTHORIZATION');
  const done = applySkuDecision({ candidate_code: proposal.entity_code, candidate: proposal, decision: 'approve', decided_by: 'Victor Abreu' }, { stateRoot });
  assert.equal(done.sku, 'EL89999');
  const record = JSON.parse(fs.readFileSync(path.join(stateRoot, 'sku-decisions', `${proposal.entity_code}.json`), 'utf8'));
  assert.equal(record.decision, 'AUTHORIZED');
  assert.equal(record.catalogue_write, false);
  const blocked = JSON.parse(fs.readFileSync(path.join(stateRoot, 'sku-proposals.json'), 'utf8')).proposals.find((p) => p.state !== 'READY_FOR_AUTHORIZATION');
  assert.throws(() => applySkuDecision({ candidate_code: blocked.entity_code, candidate: blocked, decision: 'approve' }, { stateRoot }), /not authorizable/);
  const next = await sendSkuReviewEmail({ now: new Date(2026, 10, 5, 9, 0), stateRoot, env: env({ HERMES_EMAIL_LIVE: 'false' }), loadCatalogue: async () => [], listGaps: async () => ({ gaps: [] }), stage: async () => {} });
  assert.equal(next.ready, 0);
  assert.equal(next.authorized_pending, 1);
  const created = await sendSkuReviewEmail({ now: new Date(2026, 10, 12, 9, 0), stateRoot, env: env({ HERMES_EMAIL_LIVE: 'false' }), loadCatalogue: async () => [{ sku: 'EL89999', codigo_base: 'P559999', oem_codes: [] }], listGaps: async () => ({ gaps: [] }), stage: async () => {} });
  assert.equal(created.authorized_pending, 0); // created in the catalogue -> no longer pending
});
