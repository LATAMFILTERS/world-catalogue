// HERMES operational readiness — static governance checks on
// .github/workflows/hermes-weekly.yml itself (independent of the preflight
// script's own opinion about it, for redundant safety). Purely textual
// assertions — this suite never triggers a GitHub Actions run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const workflowText = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml'), 'utf8');

test('workflow_dispatch trigger is present', () => {
  assert.match(workflowText, /\bworkflow_dispatch:/);
});

test('a weekly cron schedule is present', () => {
  assert.match(workflowText, /schedule:/);
  assert.match(workflowText, /cron:\s*'0 1[34] \* \* 1'/);
});

test('Node 20 is pinned', () => {
  assert.match(workflowText, /node-version:\s*'20'/);
});

test('concurrency is configured to prevent overlapping runs', () => {
  assert.match(workflowText, /concurrency:/);
  assert.match(workflowText, /cancel-in-progress:\s*false/);
});

test('HERMES_COLLECTION_DRY_RUN defaults to true', () => {
  assert.match(workflowText, /HERMES_COLLECTION_DRY_RUN:\s*\$\{\{\s*vars\.HERMES_COLLECTION_DRY_RUN\s*\|\|\s*'true'\s*\}\}/);
});

test('HERMES_EMAIL_LIVE defaults to false', () => {
  assert.match(workflowText, /HERMES_EMAIL_LIVE:\s*\$\{\{\s*vars\.HERMES_EMAIL_LIVE\s*\|\|\s*'false'\s*\}\}/);
});

test('the workflow never invokes hermes:publish', () => {
  assert.doesNotMatch(workflowText, /hermes:publish\b/);
});

test('the workflow never invokes hermes:update', () => {
  assert.doesNotMatch(workflowText, /hermes:update\b/);
});

test('the workflow never invokes hermes:rollback', () => {
  assert.doesNotMatch(workflowText, /hermes:rollback\b/);
});

test('the workflow contains no database command patterns', () => {
  assert.doesNotMatch(workflowText, /\b(psql|pg_dump|pg_restore|mongosh)\b/i);
  assert.doesNotMatch(workflowText, /DATABASE_URL/);
  assert.doesNotMatch(workflowText, /pgvector/i);
  assert.doesNotMatch(workflowText, /unified-data/i);
});

test('every credential-shaped env value comes from the secrets/vars context, never a literal', () => {
  const lines = workflowText.match(/(AZURE_CLIENT_ID|AZURE_TENANT_ID|AZURE_CLIENT_SECRET|HERMES_SENDER_EMAIL|HERMES_REVIEW_EMAIL):\s*(.+)/g) || [];
  assert.ok(lines.length >= 5, 'expected all five credential env lines to be present');
  for (const line of lines) assert.match(line, /\$\{\{\s*secrets\./);
});

test('artifact upload is configured', () => {
  assert.match(workflowText, /uses:\s*actions\/upload-artifact@/);
  assert.match(workflowText, /hermes\/real-candidates/);
  assert.match(workflowText, /hermes\/reports/);
  assert.match(workflowText, /hermes\/source-cache/);
  assert.match(workflowText, /elimfilters-vault\/94-sync-log/);
});

test('the guard step never proceeds automatically outside the intended local hour for a scheduled run', () => {
  assert.match(workflowText, /github\.event_name.*=\s*['"]schedule['"]/);
  assert.match(workflowText, /proceed=false/);
});
