'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_130_quarantine_a3_legacy_resolver_contamination.js'),
  'utf8'
);

test('run_130 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
  assert.match(migration,/console\.log\('COMMIT'\)/);
});

test('run_130 reuses existing bad_crossref_quarantine and scopes exclusions to A3',()=>{
  assert.match(migration,/public\.bad_crossref_quarantine/);
  assert.match(migration,/A3:/);
  assert.match(migration,/q\.reason LIKE 'A3:%'/);
  assert.doesNotMatch(migration,/CREATE TABLE/i);
});

test('run_130 hardens both full and incremental cache rebuilds',()=>{
  assert.match(migration,/CREATE OR REPLACE FUNCTION public\.refresh_crossref_cache\(\)/);
  assert.match(migration,/CREATE OR REPLACE FUNCTION public\.refresh_crossref_cache_sku\(p_sku text\)/);
  const a3Filters=(migration.match(/q\.reason LIKE 'A3:%'/g)||[]).length;
  assert.ok(a3Filters>=3,'A3 quarantine must guard full, incremental, and cleanup paths');
});

test('run_130 does not mutate application ownership or public JSONB',()=>{
  assert.doesNotMatch(migration,/UPDATE\s+ld_catalog\.ld_vehicle_applications/i);
  assert.doesNotMatch(migration,/DELETE\s+FROM\s+ld_catalog\.ld_vehicle_applications/i);
  assert.doesNotMatch(migration,/UPDATE\s+public\.elimfilters_catalog/i);
  assert.doesNotMatch(migration,/SET\s+(?:oem_codes|competitor_codes)/i);
  assert.match(migration,/application_rows:\s*0/);
  assert.match(migration,/public_jsonb_rows:\s*0/);
});

test('run_130 only quarantines resolver conflicts lacking normalized direct ownership',()=>{
  assert.match(migration,/r\.owner_count=1/);
  assert.match(migration,/r\.target_sku<>v\.elimfilters_sku/);
  assert.match(migration,/ld_catalog\.ld_competitor_cross_references/);
  assert.match(migration,/NOT EXISTS/);
  assert.match(migration,/source_duty/);
  assert.match(migration,/target_duty/);
  assert.match(migration,/source_filter_type/);
  assert.match(migration,/target_filter_type/);
});

test('run_130 verifies A3 resolver pairs are gone before commit',()=>{
  assert.match(migration,/remaining_a3_resolver_pairs/);
  assert.match(migration,/A3 resolver pairs remain after quarantine/);
});

test('run_130 deduplicates textual authority variants by normalized code',()=>{
  assert.match(migration,/ld_catalog\.norm_part\(v\.source_sku\) AS authority_norm/);
  assert.match(migration,/min\(v\.source_sku\) AS authority_code/);
  assert.match(migration,/GROUP BY[\s\S]*ld_catalog\.norm_part\(v\.source_sku\)/);
});
