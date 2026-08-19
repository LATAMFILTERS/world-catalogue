// HERMES Phase 5 Lite — CLI-level tests for scripts/hermes/collect-real-sources.mjs
// source selection (registry vs. legacy fallback). Every fixture here is
// either empty or disabled, so the CLI never issues a single real network
// request in any of these tests — the assertions are about which source
// list gets selected and logged, not about fetching anything.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'collect-real-sources.mjs');

function makeCwd() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-collect-cli-'));
  fs.mkdirSync(path.join(dir, 'hermes', 'config'), { recursive: true });
  return dir;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeDisabledLegacySources(cwd) {
  writeJson(path.join(cwd, 'hermes', 'config', 'real-sources.json'), {
    schema_version: '1.0.0',
    sources: {
      standards: [{
        id: 'disabled_legacy_source',
        name: 'Disabled Legacy Source',
        category: 'standards',
        url: 'https://example.test/legacy',
        source_type: 'html',
        enabled: false,
        official: true,
        trust_level: 'medium',
        notes: ''
      }]
    }
  });
}

function writeEmptyRegistry(cwd) {
  writeJson(path.join(cwd, 'hermes', 'config', 'source-organizations.json'), {
    schema_version: '1.0.0',
    description: 'fixture',
    allowed_categories: ['standards'],
    allowed_statuses: ['ACTIVE', 'DISCOVERY_REQUIRED', 'PAUSED', 'UNSUPPORTED', 'REVIEW_REQUIRED'],
    organizations: [{
      id: 'fixture_org',
      name: 'Fixture Org',
      category: 'standards',
      parent_company: null,
      region: 'Global',
      official_domain: 'https://example.test',
      monitored_urls: [],
      source_type: 'html',
      enabled: false,
      official: true,
      trust_level: 'medium',
      priority: 2,
      market_scope: null,
      product_scope: null,
      notes: '',
      status: 'DISCOVERY_REQUIRED',
      discovery_required: true
    }]
  });
  writeJson(path.join(cwd, 'hermes', 'config', 'source-endpoints.json'), {
    schema_version: '1.0.0',
    description: 'fixture',
    endpoints: []
  });
}

function runCli(cwd, envOverrides = {}) {
  return spawnSync(process.execPath, [SCRIPT], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_COLLECTION_DRY_RUN: 'true', ...envOverrides },
    encoding: 'utf8'
  });
}

test('with no registry files present, the CLI falls back to real-sources.json and logs the fallback explicitly', () => {
  const cwd = makeCwd();
  writeDisabledLegacySources(cwd);
  const result = runCli(cwd);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout + result.stderr, /FALLBACK: .*not found.*using legacy/);
  assert.match(result.stdout, /source_mode=legacy_missing_registry/);
  assert.match(result.stdout, /disabled=1/);
});

test('with registry files present, the CLI uses the registry and never touches real-sources.json even if it exists', () => {
  const cwd = makeCwd();
  writeEmptyRegistry(cwd);
  writeDisabledLegacySources(cwd); // present, but must be ignored since registry is available
  const result = runCli(cwd);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /source_mode=registry organizations=1 endpoints=0 active_and_enabled=0/);
  assert.match(result.stdout, /source_mode=registry mode=DRY_RUN baseline_mode=false sources_available=0 sources=0 sources_capped=0 enabled=0/);
  assert.doesNotMatch(result.stdout, /legacy/);
});

test('HERMES_COLLECTION_USE_LEGACY_SOURCES=true forces the legacy file even when a valid registry is present', () => {
  const cwd = makeCwd();
  writeEmptyRegistry(cwd);
  writeDisabledLegacySources(cwd);
  const result = runCli(cwd, { HERMES_COLLECTION_USE_LEGACY_SOURCES: 'true' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout + result.stderr, /FALLBACK \(explicit\): HERMES_COLLECTION_USE_LEGACY_SOURCES=true/);
  assert.match(result.stdout, /source_mode=legacy_forced/);
  assert.match(result.stdout, /disabled=1/);
});

test('an invalid registry aborts before any fetch is attempted, instead of silently collecting against broken data', () => {
  const cwd = makeCwd();
  writeJson(path.join(cwd, 'hermes', 'config', 'source-organizations.json'), {
    schema_version: '1.0.0',
    organizations: [
      { id: 'dup', name: 'A', category: 'not_a_real_category', parent_company: null, region: 'Global', official_domain: 'https://example.test', monitored_urls: [], source_type: 'html', enabled: false, official: true, trust_level: 'medium', priority: 2, market_scope: null, product_scope: null, notes: '', status: 'DISCOVERY_REQUIRED', discovery_required: true }
    ]
  });
  writeJson(path.join(cwd, 'hermes', 'config', 'source-endpoints.json'), { schema_version: '1.0.0', endpoints: [] });
  const result = runCli(cwd);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /source registry failed validation/);
  assert.match(result.stderr, /invalid category/);
  assert.equal(fs.existsSync(path.join(cwd, 'hermes', 'real-candidates')), false);
});

test('every run reports the same fixed database/pgvector/unified-data/canonical-vault write status: false', () => {
  const cwd = makeCwd();
  writeDisabledLegacySources(cwd);
  const result = runCli(cwd);
  assert.match(result.stdout, /database_write=false pgvector_write=false unified_data_write=false canonical_vault_writes=false/);
});
