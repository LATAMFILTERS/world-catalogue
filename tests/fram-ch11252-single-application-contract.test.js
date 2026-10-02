'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'scripts', 'migrations', 'run_129_insert_ch11252_scion_iq_application.js');
const migration = fs.readFileSync(FILE, 'utf8');
const { buildApplicationRow, AUTHORITY, TARGET_SKU, SOURCE_ORIGIN, EXPECTED_EVIDENCE } = require(FILE);

test('only CH11252 -> EL36006 is allowed', () => {
  assert.equal(AUTHORITY, 'CH11252');
  assert.equal(TARGET_SKU, 'EL36006');
  assert.equal(SOURCE_ORIGIN, 'FRAM_LD_MULTI_REGION');
  const ch10358Lines = migration.split(/\r?\n/).filter(line => line.includes('CH10358'));
  assert.equal(ch10358Lines.length, 1, 'CH10358 may only appear in the untouched-count guard');
  assert.match(ch10358Lines[0], /source_sku='CH10358'\) AS ch10358_apps/);
  assert.match(migration, /ch10358_untouched/);
});

test('the single row uses the FRAM evidence values and the existing column convention', () => {
  assert.deepEqual(EXPECTED_EVIDENCE, { make: 'SCION', model: 'IQ', year: '15-12', engine: 'L4-1.3L' });
  assert.deepEqual(buildApplicationRow(EXPECTED_EVIDENCE), {
    elimfilters_sku: 'EL36006',
    source_sku: 'CH11252',
    make: 'SCION',
    model_family: 'IQ',
    model_type: 'L4-1.3L',
    year: '15-12',
    engine_code: 'L4-1.3L',
    source_origin: 'FRAM_LD_MULTI_REGION'
  });
  const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products/CH11252.json'), 'utf8'));
  const candidates = evidence.public_catalog_proposal.vehicle_application_candidates;
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].make, 'SCION');
  assert.equal(candidates[0].model, 'IQ');
  assert.equal(candidates[0].year, '15-12');
  assert.equal(candidates[0].engine, 'L4-1.3L');
});

test('exactly one application row can be inserted and no broader backfill path exists', () => {
  const inserts = migration.match(/INSERT INTO [\w.]+/g) || [];
  assert.deepEqual(inserts, ['INSERT INTO ld_catalog.ld_vehicle_applications']);
  assert.match(migration, /VALUES \(\$1,\$2,\$3,\$4,\$5,\$6,\$7,NULL,NULL,NULL,\$8\) RETURNING id/);
  assert.match(migration, /EXPECTED_EXACTLY_ONE_INSERT/);
  assert.match(migration, /exactly_one_row: after\.apps === before\.apps \+ 1/);
  assert.doesNotMatch(migration, /for \(const [^)]* of [^)]*candidates/);
  assert.doesNotMatch(migration, /existing_application_gaps|buildPlan|insertRows|latestGap/);
  assert.match(migration, /FRAM_EVIDENCE_ROW_PRESENT', candidates\.length === 1 && match\.length === 1/);
});

test('--execute is required and the dry-run rolls back', () => {
  assert.match(migration, /const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  const commitLines = migration.split(/\r?\n/).filter(line => line.includes("'COMMIT'"));
  assert.ok(commitLines.length > 0);
  for (const line of commitLines) assert.match(line, /EXECUTE/);
  assert.match(migration, /ROLLBACK \(dry-run\)/);
  assert.match(migration, /PRECONDITIONS_FAILED/);
  assert.match(migration, /Number\(target\.port\) !== 5441/);
});

test('no competitor, OEM, spec, readiness, identity or public catalog writes', () => {
  for (const table of [
    'public.elimfilters_catalog',
    'ld_catalog.ld_competitor_cross_references',
    'ld_catalog.ld_oem_cross_references',
    'ld_catalog.ld_product_specifications',
    'ld_catalog.ld_production_readiness',
    'ld_catalog.ld_product_catalog',
    'ld_catalog.ld_canonical_product_identity'
  ]) {
    for (const verb of ['INSERT INTO', 'UPDATE', 'DELETE FROM']) {
      assert.ok(!migration.includes(`${verb} ${table}`), `${verb} ${table} is forbidden`);
    }
  }
  assert.doesNotMatch(migration, /DELETE FROM|UPDATE ld_catalog|UPDATE public/);
  for (const flag of ['competitor_unchanged', 'oem_unchanged', 'specs_unchanged', 'readiness_unchanged', 'public_rows_unchanged']) {
    assert.match(migration, new RegExp(flag));
  }
});

test('fails closed unless ownership, cleanup, evidence, duplicate and collision guards pass', () => {
  for (const name of [
    'TARGET_SKU_LIGHT_DUTY_OIL',
    'SINGLE_LD_FRAM_OWNER',
    'NO_OTHER_PUBLIC_FRAM_CLAIMANT',
    'NO_HEAVY_DUTY_CLAIMANT',
    'OWNERSHIP_GUARD',
    'RUN_128_CLEANUP_PRESENT_',
    'ECO_VARIANT_PRESENT_',
    'FRAM_EVIDENCE_OIL_CARTRIDGE',
    'FRAM_EVIDENCE_ROW_PRESENT',
    'NOT_ALREADY_PRESENT',
    'COLLISION_AND_AMBIGUITY_GUARD'
  ]) {
    assert.match(migration, new RegExp(name));
  }
  const failureCheck = migration.indexOf('if (failures.length)');
  assert.ok(failureCheck > 0 && failureCheck < migration.indexOf('INSERT INTO ld_catalog.ld_vehicle_applications'), 'preconditions must be enforced before the insert');
});
