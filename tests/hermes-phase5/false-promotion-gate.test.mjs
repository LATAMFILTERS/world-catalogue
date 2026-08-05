// HERMES — regression tests for the false-promotion-gate defect.
//
// Confirmed 2026-08-04: a real manual run of "HERMES Weekly Intelligence
// Collection" with promote_baseline=false, HERMES_BASELINE_MODE=false,
// HERMES_COLLECTION_DRY_RUN=true still promoted the baseline — a new
// hermes-state commit, a new backup, a hermes-baseline-promotion artifact,
// and a "BASELINE PROMOTED" banner all appeared despite the input being
// false. Two independent defects contributed:
//
//   1. The promote-baseline job's `if:` relied solely on the raw
//      `github.event.inputs.promote_baseline` string, which GitHub Actions
//      does not reliably/consistently type across every trigger path for a
//      `type: boolean` workflow_dispatch input.
//   2. Even if the job ran, the "Promote preview to hermes-state" step
//      hardcoded `HERMES_BASELINE_PROMOTE: 'true'` unconditionally in its
//      env block — completely independent of the actual input value — so
//      the script-level isAuthorized() check provided zero real protection.
//
// These tests statically verify the fixed workflow YAML (typed `inputs.*`
// context ANDed with the string context, at the job level AND the step
// level, with HERMES_BASELINE_PROMOTE now derived rather than hardcoded),
// and functionally verify that a stale/foreign promotion-result.local.json
// is never trusted by the weekly report unless it matches the current
// GitHub Actions run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const WORKFLOW_PATH = path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml');
const REPORT_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'generate-weekly-report.mjs');

function workflowText() {
  return fs.readFileSync(WORKFLOW_PATH, 'utf8');
}

function promoteJobBlock() {
  const text = workflowText();
  const start = text.indexOf('  promote-baseline:');
  const end = text.indexOf('  rollback-baseline:');
  assert.ok(start !== -1 && end !== -1 && end > start, 'expected to locate the promote-baseline job block');
  return text.slice(start, end);
}

// ---------------------------------------------------------------------------
// Root cause 1: the job-level gate.
// ---------------------------------------------------------------------------

test('root cause 1 fixed: promote-baseline job gate requires BOTH the typed inputs context and the raw string context', () => {
  const block = promoteJobBlock();
  const ifLineMatch = /^\s*if:\s*(.+)$/m.exec(block);
  assert.ok(ifLineMatch, 'expected an if: condition on the promote-baseline job');
  const condition = ifLineMatch[1];
  assert.match(condition, /inputs\.promote_baseline == true/, 'must use the typed inputs.* context with a literal boolean true');
  assert.match(condition, /github\.event\.inputs\.promote_baseline == 'true'/, 'must also require the raw string context, as a second independent signal');
  // The old, sole-string condition is what actually failed in production —
  // it must not be the ONLY check left standing.
  assert.doesNotMatch(condition, /^github\.event_name == 'workflow_dispatch' && github\.event\.inputs\.promote_baseline == 'true'$/);
});

test('the job-level gate is also duplicated on every meaningful step inside the job (defense in depth)', () => {
  const block = promoteJobBlock();
  const stepIfs = [...block.matchAll(/^\s*if:\s*(.+)$/gm)].map((m) => m[1]);
  // job-level if + at least 3 step-level ifs (preview generation, promote, artifact upload)
  assert.ok(stepIfs.length >= 4, `expected at least 4 if: conditions (job + 3 steps) in the promote-baseline job, found ${stepIfs.length}`);
  for (const condition of stepIfs) {
    assert.match(condition, /inputs\.promote_baseline == true/);
    assert.match(condition, /github\.event\.inputs\.promote_baseline == 'true'/);
  }
});

// ---------------------------------------------------------------------------
// Root cause 2: the hardcoded internal env var.
// ---------------------------------------------------------------------------

test('root cause 2 fixed: HERMES_BASELINE_PROMOTE is derived from the actual input, never a bare hardcoded true', () => {
  const block = promoteJobBlock();
  const promoteStepMatch = /Promote preview to hermes-state[\s\S]{0,900}/.exec(block);
  assert.ok(promoteStepMatch, 'expected the "Promote preview to hermes-state" step');
  const stepText = promoteStepMatch[0];

  // Must NOT be the old bare literal.
  assert.doesNotMatch(stepText, /HERMES_BASELINE_PROMOTE:\s*'true'\s*$/m);
  assert.doesNotMatch(stepText, /HERMES_BASELINE_PROMOTE:\s*'true'\s*\n/);

  // Must be derived from both contexts, defaulting to the literal string
  // 'false' otherwise — this is the second, independent barrier: even if
  // the job/step `if:` conditions were somehow bypassed, this line alone
  // still prevents promote-baseline.mjs's isAuthorized() from ever seeing
  // HERMES_BASELINE_PROMOTE=true unless both contexts genuinely agree.
  assert.match(stepText, /HERMES_BASELINE_PROMOTE:\s*\$\{\{\s*\(inputs\.promote_baseline == true && github\.event\.inputs\.promote_baseline == 'true'\)\s*&&\s*'true'\s*\|\|\s*'false'\s*\}\}/);
});

test('HERMES_BASELINE_MODE and HERMES_COLLECTION_DRY_RUN inside the promote step remain forced, unaffected by this fix', () => {
  const block = promoteJobBlock();
  const promoteStepMatch = /Promote preview to hermes-state[\s\S]{0,900}/.exec(block);
  assert.match(promoteStepMatch[0], /HERMES_BASELINE_MODE:\s*'true'/);
  assert.match(promoteStepMatch[0], /HERMES_COLLECTION_DRY_RUN:\s*'true'/);
});

// ---------------------------------------------------------------------------
// Items 6 & 7: promotion-result.local.json is scoped to the current run,
// and a stale/foreign record is ignored.
// ---------------------------------------------------------------------------

function makeReportCwd() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-false-gate-report-'));
  fs.mkdirSync(path.join(dir, 'hermes', 'real-candidates-previews'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'hermes', 'reports'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'hermes', 'baselines'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'elimfilters-vault', '94-sync-log'), { recursive: true });
  return dir;
}

function writeCollectionAudit(dir, overrides = {}) {
  const auditPath = path.join(dir, 'elimfilters-vault', '94-sync-log', `collection-${Date.now()}.collection.json`);
  fs.writeFileSync(auditPath, JSON.stringify({
    baseline_mode: false, sources_checked: 10, unchanged: 10, changed: 0,
    empty_content: 0, insufficient_content: 0, failed: 0, baseline_required: 0,
    candidates_created: 0, candidates_suppressed: 0,
    ...overrides
  }));
}

function writeStalePromotionResult(dir, overrides = {}) {
  fs.writeFileSync(path.join(dir, 'hermes', 'baselines', 'promotion-result.local.json'), JSON.stringify({
    status: 'PROMOTED',
    timestamp: '2026-07-20T00:00:00.000Z',
    sources_promoted: 10,
    baseline_sha256: 'a'.repeat(64),
    backup_path: 'state/backups/source-baseline.2026-07-20T00-00-00-000Z.json',
    state_branch: 'hermes-state',
    state_branch_commit: 'deadbeef',
    remote_verified: true,
    run_id: '111111',
    run_attempt: '1',
    ...overrides
  }));
}

test('a compare-only run (promote-baseline job skipped) never sees a promotion-result.local.json at all, and the report shows neither banner nor section', () => {
  const cwd = makeReportCwd();
  writeCollectionAudit(cwd);
  // No promotion-result.local.json written at all — the normal, correct
  // outcome once the job is genuinely skipped.
  const result = spawnSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], {
    cwd, env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true' }, encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const reportFile = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFile), 'utf8');
  assert.doesNotMatch(reportText, /BASELINE PROMOTED/);
  assert.doesNotMatch(reportText, /## Baseline Promotion/);
});

test('a stale promotion-result.local.json from a DIFFERENT GitHub Actions run is ignored — no banner, no section', () => {
  const cwd = makeReportCwd();
  writeCollectionAudit(cwd);
  writeStalePromotionResult(cwd, { run_id: '111111', run_attempt: '1' });

  const result = spawnSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true', GITHUB_RUN_ID: '999999', GITHUB_RUN_ATTEMPT: '1' },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr + result.stdout, /ignoring promotion-result\.local\.json/);

  const reportFile = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFile), 'utf8');
  assert.doesNotMatch(reportText, /BASELINE PROMOTED/);
  assert.doesNotMatch(reportText, /## Baseline Promotion/);
});

test('a promotion-result.local.json matching the CURRENT run id and attempt is still shown correctly (no over-correction)', () => {
  const cwd = makeReportCwd();
  writeCollectionAudit(cwd, { baseline_mode: true }); // a genuine baseline/promotion run
  writeStalePromotionResult(cwd, { run_id: '999999', run_attempt: '1' });

  const result = spawnSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true', GITHUB_RUN_ID: '999999', GITHUB_RUN_ATTEMPT: '1' },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const reportFile = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFile), 'utf8');
  assert.match(reportText, /BASELINE PROMOTED/);
  assert.match(reportText, /## Baseline Promotion/);
});

test('a mismatched run_attempt alone (same run_id, different attempt/re-run) is still rejected', () => {
  const cwd = makeReportCwd();
  writeCollectionAudit(cwd);
  writeStalePromotionResult(cwd, { run_id: '999999', run_attempt: '1' });

  const result = spawnSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true', GITHUB_RUN_ID: '999999', GITHUB_RUN_ATTEMPT: '2' },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const reportFile = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFile), 'utf8');
  assert.doesNotMatch(reportText, /BASELINE PROMOTED/);
});

test('outside GitHub Actions (GITHUB_RUN_ID unset) an existing local promotion-result.local.json is still read, unchanged local-dev behavior', () => {
  const cwd = makeReportCwd();
  writeCollectionAudit(cwd, { baseline_mode: true });
  writeStalePromotionResult(cwd, { run_id: null, run_attempt: null });

  const result = spawnSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], {
    cwd, env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true' }, encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const reportFile = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFile), 'utf8');
  assert.match(reportText, /BASELINE PROMOTED/);
});

// ---------------------------------------------------------------------------
// promote-baseline.mjs itself stamps run_id/run_attempt.
// ---------------------------------------------------------------------------

test('promote-baseline.mjs stamps GITHUB_RUN_ID/GITHUB_RUN_ATTEMPT onto every record it writes, including an unauthorized attempt', () => {
  const PROMOTE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'promote-baseline.mjs');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-false-gate-promote-'));
  fs.mkdirSync(path.join(cwd, 'hermes', 'baselines'), { recursive: true });
  fs.mkdirSync(path.join(cwd, 'hermes', 'config'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'hermes', 'config', 'source-organizations.json'), JSON.stringify({ organizations: [] }));
  fs.writeFileSync(path.join(cwd, 'hermes', 'config', 'source-endpoints.json'), JSON.stringify({ endpoints: [] }));

  // Unauthorized (no token) — this is the exact scenario a correctly-gated
  // job never even reaches, but the script must still behave safely and
  // stamp the record if it ever does run.
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_BASELINE_MODE: 'true', HERMES_BASELINE_PROMOTE: 'true', HERMES_COLLECTION_DRY_RUN: 'true', GITHUB_RUN_ID: '424242', GITHUB_RUN_ATTEMPT: '3' },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  const record = JSON.parse(fs.readFileSync(path.join(cwd, 'hermes', 'baselines', 'promotion-result.local.json'), 'utf8'));
  assert.equal(record.status, 'PROMOTION_NOT_AUTHORIZED');
  assert.equal(record.run_id, '424242');
  assert.equal(record.run_attempt, '3');
});
