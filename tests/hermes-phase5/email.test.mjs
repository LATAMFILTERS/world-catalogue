// HERMES Phase 5 Lite — send-weekly-email.mjs behavior tests.
// Runs the real script as a child process (it is a top-level script, not an
// importable module) against a scratch reports directory, with a clean env
// so no real Azure credentials from the host machine ever leak in. No
// network call ever succeeds in these tests — the LIVE cases either fail
// fast on missing config or are not exercised at all.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'send-weekly-email.mjs');

function makeReportsDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-email-'));
  fs.writeFileSync(path.join(dir, 'hermes-weekly-2026-08-03.md'), '# HERMES Weekly Intelligence Review\n\nGenerated: 2026-08-03T00:00:00.000Z\n', 'utf8');
  return dir;
}

function baseEnv(overrides = {}) {
  // Deliberately do NOT inherit the host's real environment variables that
  // could contain live Azure credentials — build an explicit minimal env.
  return {
    PATH: process.env.PATH,
    ...overrides
  };
}

test('DRY RUN (default): writes an HTML preview and exits 0 without any Azure credentials', () => {
  const dir = makeReportsDir();
  const result = spawnSync(process.execPath, [SCRIPT, dir], { cwd: REPO_ROOT, env: baseEnv(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DRY RUN/);
  const preview = path.join(dir, 'hermes-email-preview-2026-08-03.html');
  assert.ok(fs.existsSync(preview));
  const html = fs.readFileSync(preview, 'utf8');
  assert.match(html, /No change of any kind will be applied unless Victor Abreu reviews and explicitly approves it/);
});

test('DRY RUN preview never claims a database, pgvector, unified-data, frontend, or chatbot change was made', () => {
  const dir = makeReportsDir();
  spawnSync(process.execPath, [SCRIPT, dir], { cwd: REPO_ROOT, env: baseEnv(), encoding: 'utf8' });
  const html = fs.readFileSync(path.join(dir, 'hermes-email-preview-2026-08-03.html'), 'utf8');
  assert.match(html, /has not written to PostgreSQL, pgvector, unified-data/);
});

test('LIVE mode without Azure credentials fails closed and never sends', () => {
  const dir = makeReportsDir();
  const result = spawnSync(process.execPath, [SCRIPT, dir], {
    cwd: REPO_ROOT,
    env: baseEnv({ HERMES_EMAIL_LIVE: 'true', HERMES_REVIEW_EMAIL: 'victor@example.test' }),
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing required environment variables/);
  assert.match(result.stderr, /AZURE_CLIENT_ID/);
  // No secret VALUE should ever be printed — only variable names are
  // reported missing, never a token or password.
  assert.doesNotMatch(result.stdout + result.stderr, /Bearer /);
});

test('LIVE mode without a review recipient fails closed even if Azure credentials are present', () => {
  const dir = makeReportsDir();
  const result = spawnSync(process.execPath, [SCRIPT, dir], {
    cwd: REPO_ROOT,
    env: baseEnv({
      HERMES_EMAIL_LIVE: 'true',
      AZURE_CLIENT_ID: 'fake-client-id',
      AZURE_TENANT_ID: 'fake-tenant-id',
      AZURE_CLIENT_SECRET: 'fake-client-secret'
    }),
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HERMES_REVIEW_EMAIL is required for live sending/);
});

test('no weekly report present: fails closed instead of sending an empty or stale email', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-email-empty-'));
  const result = spawnSync(process.execPath, [SCRIPT, dir], { cwd: REPO_ROOT, env: baseEnv(), encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No weekly Markdown report found/);
});

test('script source supports HERMES_SENDER_EMAIL override without touching lib/outlook-mail.js', () => {
  const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
  assert.match(scriptSource, /HERMES_SENDER_EMAIL/);
  assert.match(scriptSource, /mail\.emailMap\.default\s*=\s*senderEmail/);
  const libSource = fs.readFileSync(path.join(REPO_ROOT, 'lib', 'outlook-mail.js'), 'utf8');
  assert.doesNotMatch(libSource, /HERMES_SENDER_EMAIL/);
});
