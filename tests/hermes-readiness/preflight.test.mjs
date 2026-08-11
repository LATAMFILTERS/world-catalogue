// HERMES operational readiness — preflight tests.
// Runs the real scripts/hermes/operational-preflight.mjs as a child process
// against the actual repo (read-only checks; it only ever writes to
// hermes/reports/, which is gitignored) with a controlled, minimal
// environment so ambient shell variables never leak into the assertions.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'operational-preflight.mjs');
const REPORT_JSON = path.join(REPO_ROOT, 'hermes', 'reports', 'operational-preflight.json');

function runPreflight(envOverrides = {}) {
  const result = spawnSync(process.execPath, [SCRIPT], {
    cwd: REPO_ROOT,
    env: { PATH: process.env.PATH, ...envOverrides },
    encoding: 'utf8'
  });
  const report = JSON.parse(fs.readFileSync(REPORT_JSON, 'utf8'));
  return { result, report };
}

test('preflight reports SAFE and exits 0 when the repo is in its normal, unactivated state', () => {
  const { result, report } = runPreflight();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /SAFE/);
  assert.equal(report.safe, true);
});

test('preflight detects HERMES_EMAIL_LIVE=true as a dangerous condition and exits non-zero', () => {
  const { result, report } = runPreflight({ HERMES_EMAIL_LIVE: 'true' });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /UNSAFE/);
  assert.equal(report.safe, false);
  const flag = report.checks.find((c) => c.id === 'env:HERMES_EMAIL_LIVE');
  assert.equal(flag.status, 'DANGEROUS');
  assert.equal(flag.blocking, true);
});

test('preflight detects HERMES_COLLECTION_DRY_RUN=false as a dangerous condition and exits non-zero', () => {
  const { result, report } = runPreflight({ HERMES_COLLECTION_DRY_RUN: 'false' });
  assert.notEqual(result.status, 0);
  assert.equal(report.safe, false);
  const flag = report.checks.find((c) => c.id === 'env:HERMES_COLLECTION_DRY_RUN');
  assert.equal(flag.status, 'DANGEROUS');
});

test('preflight detects HERMES_PUBLISH_LIVE/HERMES_UPDATE_LIVE/HERMES_ROLLBACK_LIVE as dangerous', () => {
  for (const name of ['HERMES_PUBLISH_LIVE', 'HERMES_UPDATE_LIVE', 'HERMES_ROLLBACK_LIVE']) {
    const { report } = runPreflight({ [name]: 'true' });
    assert.equal(report.safe, false, `expected ${name}=true to be unsafe`);
    const flag = report.checks.find((c) => c.id === `env:${name}`);
    assert.equal(flag.status, 'DANGEROUS');
  }
});

test('a MISSING secret is reported but never makes the verdict UNSAFE (missing credentials is the expected safe state)', () => {
  const { result, report } = runPreflight();
  assert.equal(result.status, 0);
  const secretChecks = report.checks.filter((c) => c.id.startsWith('secret:'));
  assert.ok(secretChecks.length >= 5);
  for (const check of secretChecks) {
    assert.equal(check.blocking, false, `${check.id} must never be blocking`);
  }
});

test('preflight never prints a secret VALUE, only PRESENT/MISSING, even when fake secrets are set', () => {
  const secretValue = 'SUPER_SECRET_TEST_VALUE_9f8e7d6c5b4a';
  const { result, report } = runPreflight({
    AZURE_CLIENT_ID: secretValue,
    AZURE_TENANT_ID: secretValue,
    AZURE_CLIENT_SECRET: secretValue,
    HERMES_REVIEW_EMAIL: 'victor@example.test',
    HERMES_SENDER_EMAIL: 'hermes@example.test'
  });
  assert.doesNotMatch(result.stdout, new RegExp(secretValue));
  assert.doesNotMatch(result.stderr, new RegExp(secretValue));
  const reportText = JSON.stringify(report);
  assert.doesNotMatch(reportText, new RegExp(secretValue));
  const mdText = fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'reports', 'operational-preflight.md'), 'utf8');
  assert.doesNotMatch(mdText, new RegExp(secretValue));
  // But presence is still reported correctly.
  const azureClientIdCheck = report.checks.find((c) => c.id === 'secret:AZURE_CLIENT_ID');
  assert.equal(azureClientIdCheck.status, 'PRESENT');
  assert.equal(result.status, 0, 'fake secrets alone must not flip the verdict to UNSAFE');
});

test('preflight fails closed (blocking) when a required file is missing', () => {
  const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-preflight-'));
  // No hermes/config, no .github, nothing — every required-file check should be MISSING.
  const result = spawnSync(process.execPath, [SCRIPT, scratchDir], {
    cwd: REPO_ROOT,
    env: { PATH: process.env.PATH },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /UNSAFE/);
});

test('preflight makes no network calls and reports zero database/pgvector/unified-data writes', () => {
  const { report } = runPreflight();
  assert.equal(report.network_calls_made, false);
  assert.equal(report.database_write, false);
  assert.equal(report.pgvector_write, false);
  assert.equal(report.unified_data_write, false);
});

test('operational-preflight.mjs never imports fetch-capable network modules or a database driver', () => {
  const source = fs.readFileSync(SCRIPT, 'utf8');
  assert.doesNotMatch(source, /require\(['"]pg['"]\)/);
  assert.doesNotMatch(source, /from ['"]pg['"]/);
  assert.doesNotMatch(source, /\bfetch\(/);
  assert.doesNotMatch(source, /axios/);
});


test('preflight detects catalogue publication and rollback live gates as dangerous', () => {
  for (const name of ['HERMES_CATALOGUE_PUBLISH_LIVE', 'HERMES_CATALOGUE_ROLLBACK_LIVE']) {
    const { report } = runPreflight({ [name]: 'true' });
    assert.equal(report.safe, false, `expected ${name}=true to be unsafe`);
    assert.equal(report.checks.find((c) => c.id === `env:${name}`).status, 'DANGEROUS');
  }
});
