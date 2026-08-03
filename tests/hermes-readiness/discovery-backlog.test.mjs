// HERMES operational readiness — source discovery backlog tests.
// Runs the real generator against the real (committed) registry — read-only
// input, writes only into hermes/reports/ (gitignored except the coverage
// report). No network calls are made by the generator itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadRegistry, ALLOWED_ENDPOINT_TYPES } from '../../scripts/hermes/source-registry-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'generate-source-discovery-backlog.mjs');
const JSON_PATH = path.join(REPO_ROOT, 'hermes', 'reports', 'source-discovery-backlog.json');

function runGenerator() {
  execFileSync(process.execPath, [SCRIPT], { cwd: REPO_ROOT, encoding: 'utf8' });
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
}

test('the backlog includes every DISCOVERY_REQUIRED organization from the registry, and only those', () => {
  const registry = loadRegistry(
    path.join(REPO_ROOT, 'hermes', 'config', 'source-organizations.json'),
    path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json')
  );
  const expectedIds = new Set(registry.organizations.filter((o) => o.status === 'DISCOVERY_REQUIRED').map((o) => o.id));

  const report = runGenerator();
  const actualIds = new Set(report.entries.map((e) => e.organization_id));

  assert.equal(actualIds.size, expectedIds.size);
  for (const id of expectedIds) assert.ok(actualIds.has(id), `expected ${id} in the backlog`);
  for (const id of actualIds) assert.ok(expectedIds.has(id), `${id} should not be in the backlog (not DISCOVERY_REQUIRED)`);
  assert.equal(report.totals.discovery_required, expectedIds.size);
});

test('the backlog never invents an endpoint URL and only suggests known endpoint_type values', () => {
  const report = runGenerator();
  assert.ok(report.entries.length > 0);
  for (const entry of report.entries) {
    assert.equal(entry.url, undefined, `${entry.organization_id} must not have a fabricated url field`);
    assert.equal(entry.endpoint_url, undefined);
    assert.ok(Array.isArray(entry.suggested_endpoint_types) && entry.suggested_endpoint_types.length > 0);
    for (const type of entry.suggested_endpoint_types) {
      assert.ok(ALLOWED_ENDPOINT_TYPES.has(type), `${type} is not a known endpoint_type`);
    }
  }
  assert.equal(report.urls_invented, false);
  assert.equal(report.organizations_promoted_to_active, 0);
});

test('the backlog report is deterministic aside from its generated_at timestamp', () => {
  const first = runGenerator();
  const second = runGenerator();
  delete first.generated_at;
  delete second.generated_at;
  assert.deepEqual(first, second);
});

test('the backlog performs no database/pgvector/unified-data writes and makes no network calls', () => {
  const report = runGenerator();
  assert.equal(report.database_write, false);
  assert.equal(report.pgvector_write, false);
  assert.equal(report.unified_data_write, false);
  assert.equal(report.network_calls_made, false);
});

test('generate-source-discovery-backlog.mjs never imports a fetch-capable network module', () => {
  const source = fs.readFileSync(SCRIPT, 'utf8');
  assert.doesNotMatch(source, /\bfetch\(/);
  assert.doesNotMatch(source, /axios/);
  assert.doesNotMatch(source, /require\(['"]pg['"]\)/);
});
