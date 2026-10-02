'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'scripts', 'migrations', 'run_135_remove_stale_fram_ph4967_brand_crossrefs.js');
const migration = fs.readFileSync(FILE, 'utf8');
const { removeFramCode, CODE, CANONICAL, TARGETS } = require(FILE);

test('only EL82015 / EL82024 may be modified and only PH4967 removed', () => {
  assert.equal(CODE, 'PH4967');
  assert.deepEqual(Object.keys(TARGETS), ['EL82015', 'EL82024']);
  assert.deepEqual(TARGETS.EL82015, { duty: 'HEAVY_DUTY', filter_type: 'oil', brand: 'DONALDSON', code: 'P502015' });
  assert.deepEqual(TARGETS.EL82024, { duty: 'HEAVY_DUTY', filter_type: 'oil', brand: 'DONALDSON', code: 'P502024' });
  assert.match(migration, /for \(const \[sku, p\] of Object\.entries\(plan\)\)/);
  assert.match(migration, /for \(const sku of Object\.keys\(TARGETS\)\)/);
});

test('removal keeps every other FRAM ref and every other brand, matched by normalized value', () => {
  const before = { FRAM: ['DG4967', 'PH2951A', 'PH3568', 'PH4478', 'ph-4967', 'TG4967'], WIX: ['51040'], LUBERFINER: ['PH4967'] };
  const { next, removed, kept } = removeFramCode(before);
  assert.deepEqual(removed, ['ph-4967']);
  assert.deepEqual(kept, ['DG4967', 'PH2951A', 'PH3568', 'PH4478', 'TG4967']);
  assert.deepEqual(next, { FRAM: kept, WIX: ['51040'], LUBERFINER: ['PH4967'] }, 'other brands, including a non-FRAM PH4967, survive');
  assert.deepEqual(before.FRAM.length, 6, 'input is not mutated');
  assert.throws(() => removeFramCode({ FRAM: ['PH4967'] }), /FRAM_LIST_WOULD_BECOME_EMPTY/);
  assert.doesNotMatch(migration, /#-|splice\(|jsonb_set|array_index/);
});

test('only public.elimfilters_catalog.brand_crossrefs is writable; competitor_codes and EL34967 are protected', () => {
  const updates = migration.match(/UPDATE\s+[\w.]+\s+SET\s+\w+/g) || [];
  assert.deepEqual(updates, ['UPDATE public.elimfilters_catalog SET brand_crossrefs']);
  assert.match(migration, /SET brand_crossrefs=\$2::jsonb WHERE sku=\$1 AND brand_crossrefs=\$3::jsonb/);
  assert.doesNotMatch(migration, /SET\s+competitor_codes/i);
  assert.equal(CANONICAL.sku, 'EL34967');
  assert.ok(!Object.keys(TARGETS).includes('EL34967'));
  for (const flag of ['canonical_EL34967_unchanged', '_other_columns_unchanged', '_other_brands_unchanged', '_only_ph4967_removed', 'exactly_two_rows_updated', 'exactly_two_ph4967_claims_removed', 'no_hd_public_claimant', 'ld_owner_still_EL34967']) {
    assert.match(migration, new RegExp(flag));
  }
});

test('applications, readiness, identity and LD tables are never written', () => {
  for (const table of [
    'ld_catalog.ld_vehicle_applications',
    'ld_catalog.ld_production_readiness',
    'ld_catalog.ld_canonical_product_identity',
    'ld_catalog.ld_product_catalog',
    'ld_catalog.ld_competitor_cross_references',
    'ld_catalog.ld_oem_cross_references',
    'ld_catalog.ld_product_specifications',
    'public.crossref_resolved_cache'
  ]) {
    for (const verb of ['INSERT INTO', 'UPDATE', 'DELETE FROM']) {
      assert.ok(!migration.includes(`${verb} ${table}`), `${verb} ${table} is forbidden`);
    }
  }
  assert.doesNotMatch(migration, /INSERT INTO|DELETE FROM/);
  for (const key of ['apps', 'readiness', 'identity', 'ld_competitor', 'ld_product', 'cache']) assert.match(migration, new RegExp(`AS ${key}\\b`));
});

test('--execute is required, serializable, rolls back on dry-run, refuses port 5432', () => {
  assert.match(migration, /const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  const commitLines = migration.split(/\r?\n/).filter(line => line.includes("'COMMIT'"));
  assert.ok(commitLines.length > 0);
  for (const line of commitLines) assert.match(line, /EXECUTE/);
  assert.match(migration, /ROLLBACK \(dry-run\)/);
  assert.match(migration, /target\.db !== 'catalogo_elimfilters' \|\| Number\(target\.port\) === 5432/);
});

test('fails closed on every precondition, including any unexpected PH4967 claimant', () => {
  for (const name of [
    'CANONICAL_EL34967_FRAM_PH4967_VERIFIED',
    'CANONICAL_IDENTITY_ACTIVE',
    'SINGLE_LD_FRAM_OWNER_EL34967',
    '_HD_DONALDSON_VERIFIED',
    '_FRAM_LIST_HAS_PH4967',
    '_COMPETITOR_CODES_WITHOUT_PH4967',
    'RUN_085_GOVERNANCE_PRESENT',
    'NO_UNEXPECTED_PUBLIC_CLAIMANT',
    'CONCURRENT_BRAND_CROSSREFS_CHANGE',
    'POST_MUTATION_VERIFY_FAILED'
  ]) assert.match(migration, new RegExp(name));
  assert.match(migration, /const unexpected = \[\.\.\.new Set\(\[\.\.\.anyClaims, \.\.\.framClaims\]\)\]\.filter\(s => !skus\.includes\(s\)\)/);
  const failureCheck = migration.indexOf('if (failures.length)');
  assert.ok(failureCheck > 0 && failureCheck < migration.indexOf('UPDATE public.elimfilters_catalog'), 'preconditions are enforced before the update');
});

test('run_085 governance this migration relies on is present in the repository', () => {
  const run085 = fs.readFileSync(path.join(ROOT, 'scripts', 'migrations', 'run_085_ph4967_canonical_repair.js'), 'utf8');
  assert.match(run085, /WHERE c\.sku IN \([^)]*'EL82015','EL82024'\)/);
  assert.match(run085, /VALUES \('EL34967','NON_EUROPEAN','FRAM','PH4967'/);
});

test('CH10358 re-evaluation is read-only and never inserts applications', () => {
  assert.match(migration, /ch10358_reevaluation/);
  assert.match(migration, /isLegitimateFramMultiFit\(x, o, facts\)/);
  assert.doesNotMatch(migration, /INSERT INTO ld_catalog\.ld_vehicle_applications/);
});
