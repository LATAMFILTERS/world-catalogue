'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'scripts', 'migrations', 'run_128_remove_fram_oil_claims_from_6006_duplicates.js');
const migration = fs.readFileSync(FILE, 'utf8');
const { removeExactFramClaims, CODES, TARGETS, OWNER, SURVIVING_VARIANTS } = require(FILE);

const sample = [
  { code: 'CH10358', manufacturer: 'FRAM' },
  { code: 'CH10358ECO', manufacturer: 'FRAM' },
  { code: 'CH11252', manufacturer: 'FRAM' },
  { code: 'CH11252ECO', manufacturer: 'FRAM' },
  { code: 'CH10358', manufacturer: 'WIX' },
  { code: 'HU6006Z', manufacturer: 'MANN-FILTER' },
  { code: 'C16006', brand: 'MANN' },
  'CH11252'
];

test('only the exact FRAM CH10358 / CH11252 claims are removed', () => {
  const { kept, removed } = removeExactFramClaims(sample);
  assert.deepEqual(removed, [
    { code: 'CH10358', manufacturer: 'FRAM' },
    { code: 'CH11252', manufacturer: 'FRAM' }
  ]);
  assert.equal(kept.length, sample.length - 2);
  assert.deepEqual(CODES, ['CH10358', 'CH11252']);
});

test('ECO variants and non-FRAM entries survive', () => {
  const { kept } = removeExactFramClaims(sample);
  for (const variant of SURVIVING_VARIANTS) {
    assert.ok(kept.some(e => e && e.code === variant && e.manufacturer === 'FRAM'), `${variant} must survive`);
  }
  assert.ok(kept.some(e => e && e.code === 'CH10358' && e.manufacturer === 'WIX'), 'same code under another brand must survive');
  assert.ok(kept.some(e => e && e.code === 'HU6006Z'));
  assert.ok(kept.some(e => e && e.code === 'C16006'));
  assert.ok(kept.includes('CH11252'), 'unbranded string entries are not FRAM claims');
  assert.match(migration, /ECO_VARIANT_REMOVED/);
});

test('matching is by normalized manufacturer and code, never by array position', () => {
  const { removed } = removeExactFramClaims([{ code: 'ch-10358', manufacturer: 'Fram' }, { code: 'CH 11252', brand: 'FRAM' }]);
  assert.equal(removed.length, 2);
  assert.doesNotMatch(migration, /#-|splice\(|array_index|jsonb_set|- \d+::int/);
});

test('scope is limited to EA36006 / EC36006 competitor_codes; EL36006 is never modified', () => {
  assert.deepEqual(TARGETS, { EA36006: 'air', EC36006: 'cabin' });
  assert.deepEqual(OWNER, { sku: 'EL36006', filter_type: 'oil' });
  const updates = migration.match(/UPDATE\s+[\w.]+/g) || [];
  assert.deepEqual(updates, ['UPDATE public.elimfilters_catalog']);
  assert.match(migration, /UPDATE public\.elimfilters_catalog SET competitor_codes=\$2::jsonb WHERE sku=\$1 AND competitor_codes=\$3::jsonb/);
  assert.match(migration, /for \(const \[sku, p\] of Object\.entries\(plan\)\)/);
  assert.match(migration, /OWNER_ROW_MODIFIED/);
  assert.match(migration, /BRAND_CROSSREFS_MODIFIED/);
  assert.doesNotMatch(migration, /SET\s+brand_crossrefs/i);
});

test('dry-run is the default, serializable, and rolls back', () => {
  assert.match(migration, /const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration, /if \(EXECUTE\) await client\.query\('COMMIT'\);\s*else await client\.query\('ROLLBACK'\);/);
  const commitLines = migration.split(/\r?\n/).filter(line => line.includes("'COMMIT'"));
  assert.ok(commitLines.length > 0);
  for (const line of commitLines) assert.match(line, /EXECUTE/, `COMMIT must only be reachable under --execute: ${line.trim()}`);
  assert.match(migration, /ROLLBACK \(dry-run\)/);
  assert.match(migration, /WRONG_TARGET_DATABASE/);
});

test('application, readiness and identity tables are never written', () => {
  for (const table of [
    'ld_catalog.ld_vehicle_applications',
    'ld_catalog.ld_production_readiness',
    'ld_catalog.ld_product_catalog',
    'ld_catalog.ld_canonical_product_identity',
    'ld_catalog.ld_competitor_cross_references',
    'ld_catalog.ld_oem_cross_references',
    'ld_catalog.ld_product_specifications',
    'public.crossref_resolved_cache'
  ]) {
    for (const verb of ['INSERT INTO', 'UPDATE', 'DELETE FROM']) {
      assert.ok(!migration.includes(`${verb} ${table}`), `${verb} ${table} is forbidden`);
    }
  }
  assert.match(migration, /APPLICATION_OR_READINESS_WRITTEN/);
  assert.match(migration, /CROSSREF_CACHE_UNEXPECTED_DIFF/);
});

test('fails closed on every governed precondition', () => {
  for (const code of [
    'SKU_PRECONDITION_FAILED',
    'LD_FRAM_OWNER_PRECONDITION_FAILED',
    'FRAM_EVIDENCE_PRECONDITION_FAILED',
    'DUPLICATE_QUARANTINE_PRECONDITION_FAILED',
    'UNEXPECTED_PUBLIC_FRAM_CLAIMANTS',
    'EXACT_CLAIMS_PRECONDITION_FAILED',
    'CONCURRENT_COMPETITOR_CODES_CHANGE',
    'POST_COUNT_MISMATCH',
    'OWNERSHIP_STILL_HELD',
    'APPLICATION_STATUS_CHANGED'
  ]) {
    assert.match(migration, new RegExp(code));
  }
});
