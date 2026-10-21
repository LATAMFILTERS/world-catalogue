import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { classifyResearchItem } from '../scripts/hermes/hermes-core.mjs';
import { interpretWeeklyDelivery } from '../scripts/hermes/weekly-email-integrity.mjs';

const cycle = '2026-10-12';
function fixture(t, { complete = true, items = {}, enabled = false, marker = null } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-certification-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const write = (file, data) => fs.writeFileSync(path.join(dir, file), JSON.stringify(data));
  write(`sweep-${cycle}.json`, { complete, total_work: 1, completed_work: complete ? ['one'] : [] });
  write(`research-${cycle}.json`, { items });
  if (marker) write(`weekly-${cycle}.sent.json`, marker);
  const env = { ...process.env, HERMES_STATE_ROOT: dir, HERMES_CYCLE_ID: cycle,
    HERMES_EXTERNAL_RESEARCH_ENABLED: String(enabled) };
  const run = script => {
    const result = spawnSync(process.execPath, [`scripts/hermes/${script}.mjs`], { env, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    return result;
  };
  const read = file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  return { dir, run, read, write };
}
function receipt() {
  return { cycle, delivery_status: 'DELIVERED', delivery_evidence: {
    cycle, source: 'provider_delivery_receipt', provider: 'test', recipient: 'review@example.test',
    message_id: 'test-message', reference: 'test-receipt', delivered_at: '2026-10-12T12:00:00Z'
  } };
}

test('legacy research reasons stay intact and distinct from policy and pending', () => {
  for (const [reason, expected] of [
    ['GROQ_SEARCH_FAILED', 'HISTORICAL_PROVIDER_ERROR'],
    ['GROQ_RATE_LIMITED', 'HISTORICAL_PROVIDER_ERROR'],
    ['EXTERNAL_RESEARCH_DISABLED', 'SKIPPED_POLICY'],
    ['HERMES_ZERO_COST_BLOCK', 'SKIPPED_POLICY'],
    ['RESEARCH_UNRESOLVED', 'PENDING']
  ]) {
    const item = { status: 'DEFERRED', reason, terminal: false, nextAttemptAt: '2026-10-13' };
    const before = JSON.stringify(item);
    assert.equal(classifyResearchItem(item), expected);
    assert.equal(JSON.stringify(item), before);
  }
  assert.equal(classifyResearchItem({ status: 'RESOLVED', terminal: true }), 'RESOLVED');
  assert.equal(classifyResearchItem({ status: 'TERMINAL', terminal: true }), 'TERMINAL');
});

test('policy skip preserves historical backlog and cannot clear incomplete sweep', t => {
  const f = fixture(t, { items: { old: { status: 'DEFERRED', reason: 'GROQ_SEARCH_FAILED' },
    pending: { status: 'DEFERRED', reason: 'RESEARCH_UNRESOLVED' } } });
  const before = fs.readFileSync(path.join(f.dir, `research-${cycle}.json`), 'utf8');
  assert.equal(f.run('validate-operational-state').status, 0);
  const state = f.read('operational-validation.json');
  assert.equal(state.status, 'WAITING_RESEARCH_POLICY_DISABLED');
  assert.equal(state.research.stage_status, 'SKIPPED_POLICY');
  assert.equal(state.research.historical_provider_errors, 1);
  assert.equal(state.research.pending, 1);
  assert.equal(state.research.deferred, 2);
  assert.equal(fs.readFileSync(path.join(f.dir, `research-${cycle}.json`), 'utf8'), before);
  f.write(`sweep-${cycle}.json`, { complete: false, total_work: 1, completed_work: [] });
  assert.equal(f.run('validate-operational-state').status, 1);
  assert.equal(f.read('operational-validation.json').status, 'INVALID_STATE');
});

test('enabled research still requires recovery checkpoint for deferred items', t => {
  const f = fixture(t, { enabled: true, items: { old: { status: 'DEFERRED', reason: 'GROQ_RATE_LIMITED' } } });
  assert.equal(f.run('validate-operational-state').status, 1);
  f.write('recovery-pending.json', { cycle, failed: ['research'] });
  assert.equal(f.run('validate-operational-state').status, 0);
  assert.equal(f.read('operational-validation.json').status, 'WAITING_RESEARCH');
});

test('legacy markers, acceptance and mismatched or incomplete receipts never prove delivery', () => {
  for (const marker of [null, {}, { cycle, sentAt: '2026-10-12', complete: true },
    { cycle, outcome: 'SENT', message_id: 'smtp-id', response: 202 },
    { ...receipt(), cycle: '2026-10-05' },
    { ...receipt(), recipient: 'different@example.test' },
    { ...receipt(), outcome: 'DRY_RUN' },
    { ...receipt(), message_id: 'different-message' },
    { ...receipt(), delivery_evidence: { ...receipt().delivery_evidence, reference: '' } }]) {
    assert.equal(interpretWeeklyDelivery(marker, cycle).confirmed, false);
  }
  assert.equal(interpretWeeklyDelivery(receipt(), cycle).confirmed, true);
  const observed = receipt();
  observed.delivery_evidence.source = 'recipient_mailbox_observation';
  assert.equal(interpretWeeklyDelivery(observed, cycle).confirmed, true);
});

test('closure requires delivery evidence for the same cycle and current operational validation', t => {
  const f = fixture(t, { marker: { cycle, sentAt: '2026-10-12', complete: true } });
  assert.equal(f.run('validate-operational-state').status, 0);
  assert.equal(f.run('certify-hermes-closure').status, 0);
  assert.equal(f.read('hermes-closure-certificate.json').reason, 'WEEKLY_EMAIL_NOT_CONFIRMED');
  f.write(`weekly-${cycle}.sent.json`, receipt());
  f.run('certify-hermes-closure');
  assert.equal(f.read('hermes-closure-certificate.json').status, 'CLOSED');
  f.write('operational-validation.json', { valid: true, status: 'PIPELINE_CLEAR', cycle: '2026-10-05' });
  f.run('certify-hermes-closure');
  assert.equal(f.read('hermes-closure-certificate.json').status, 'NOT_CLOSED');
});


test('recipient confirmation of non-reception is explicit and never certifies delivery', () => {
  const record = { cycle, delivery_status: 'NOT_RECEIVED', delivery_evidence: {
    cycle, source: 'recipient_confirmation', recipient: 'review@example.test',
    reference: 'operator-confirmation', confirmed_at: '2026-10-18T00:00:00Z'
  } };
  assert.deepEqual(interpretWeeklyDelivery(record, cycle), {
    confirmed: false, status: 'NOT_RECEIVED', reason: 'RECIPIENT_CONFIRMED_NOT_RECEIVED'
  });
  assert.equal(interpretWeeklyDelivery(record, '2026-10-05').status, 'UNCONFIRMED');
  assert.equal(interpretWeeklyDelivery({ ...record, delivery_evidence: {} }, cycle).status, 'UNCONFIRMED');
});
