import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('scripts/hermes/apply-review-decision.mjs');

function candidate() {
  return {
    entity_code: 'HERMES_REAL_TEST_REVIEW',
    approval_required: true,
    workflow_status: 'PENDING_REVIEW',
    source_hash: 'abc123'
  };
}

function runDecision(decision, reason = '') {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-review-'));
  const candidatePath = path.join(cwd, 'candidate.json');
  fs.writeFileSync(candidatePath, JSON.stringify(candidate(), null, 2));
  const args = [script, candidatePath, decision];
  if (reason) args.push(reason);
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
  const folders = {
    approve: 'elimfilters-vault/92-approved-updates',
    reject: 'elimfilters-vault/93-rejected',
    research: 'elimfilters-vault/91-pending-review'
  };
  const out = path.join(cwd, folders[decision], 'HERMES_REAL_TEST_REVIEW.json');
  return { cwd, result, out, value: fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null };
}

test('APROBAR records Victor approval and APPROVED status', () => {
  const { result, value } = runDecision('approve');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(value.workflow_status, 'APPROVED');
  assert.equal(value.approved_by, 'Victor Abreu');
  assert.ok(value.approved_at);
});

test('RECHAZAR requires and preserves the rejection reason', () => {
  const { result, value } = runDecision('reject', 'Evidence insufficient');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(value.workflow_status, 'REJECTED');
  assert.equal(value.rejection_reason, 'Evidence insufficient');
});

test('INVESTIGAR MÁS preserves Victor instruction separately from rejection metadata', () => {
  const { result, value } = runDecision('research', 'Verify the OEM service bulletin and exact model-year coverage');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(value.workflow_status, 'NEEDS_RESEARCH');
  assert.equal(value.research_instruction, 'Verify the OEM service bulletin and exact model-year coverage');
  assert.equal(value.rejection_reason, undefined);
});
