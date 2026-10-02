'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const audit = fs.readFileSync(
  path.join(ROOT, 'scripts', 'audits', 'audit_vehicle_engine_application_consistency.js'),
  'utf8'
);
const repair = fs.readFileSync(
  path.join(ROOT, 'scripts', 'migrations', 'run_123_repair_vehicle_engine_application_consistency.js'),
  'utf8'
);
const framGapAnalyzer = fs.readFileSync(
  path.join(ROOT, 'scripts', 'hermes', 'analyze-fram-ld-gaps.js'),
  'utf8'
);
const framReconcile = fs.readFileSync(
  path.join(ROOT, 'scripts', 'hermes', 'apply-fram-ld-reconciliations.js'),
  'utf8'
);

test('global audit remains read-only and covers all six inconsistency classes', () => {
  assert.match(audit, /readonly:\s*true/);
  for (const token of [
    'application_evidence_not_normalized',
    'application_source_identity_mismatch',
    'competing_skus_same_vehicle_engine_filter_type',
    'kit_component_missing_brand_application',
    'engine_string_fragmentation',
    'sku_prefix_filter_type_contradiction'
  ]) {
    assert.match(audit, new RegExp(token));
  }
  assert.doesNotMatch(audit, /\bUPDATE\s+public\./i);
  assert.doesNotMatch(audit, /\bDELETE\s+FROM/i);
});

test('run_123 is dry-run by default and serializable', () => {
  assert.match(repair, /const APPLY = process\.argv\.includes\('--apply'\)/);
  assert.match(repair, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(repair, /ROLLBACK \(dry-run\)/);
});

test('run_123 never auto-resolves competing SKUs or prefix/type contradictions', () => {
  assert.match(repair, /type:'COMPETING_SKUS'/);
  assert.match(repair, /AMBIGUOUS_APPLICATION_OWNERSHIP/);
  assert.match(repair, /type:'SKU_PREFIX_FILTER_TYPE_CONTRADICTION'/);
  assert.match(repair, /REQUIRES_IDENTITY_REVIEW/);
});

test('run_123 reuses existing relational application graph instead of creating a parallel store', () => {
  assert.match(repair, /ld_catalog\.ld_vehicle_applications/);
  assert.match(repair, /public\.elimfilters_catalog/);
  assert.match(repair, /maintenance_kits/);
  assert.match(repair, /kit_components/);
  assert.doesNotMatch(repair, /CREATE TABLE/i);
});

test('run_123 never rewrites application source from public catalog identity alone', () => {
  assert.match(repair, /ld_catalog\.ld_product_catalog/);
  assert.match(repair, /APPLICATION_SOURCE_PARENT_MISMATCH/);
  assert.match(repair, /REQUIRES_EVIDENCE_REVIEW/);
  assert.doesNotMatch(repair, /REALIGN_APPLICATION_SOURCE/);
  assert.doesNotMatch(repair, /UPDATE ld_catalog\.ld_vehicle_applications/);
});

test('run_123 keeps public-only applications and kit inheritance on HOLD', () => {
  assert.match(repair, /REQUIRES_RELATIONAL_EVIDENCE/);
  assert.match(repair, /REQUIRES_PLATFORM_EVIDENCE/);
  assert.match(repair, /NO_SIBLING_APPLICATION_EVIDENCE/);
  assert.doesNotMatch(repair, /INHERIT_KIT_PLATFORM_APPLICATIONS/);
  assert.doesNotMatch(repair, /INSERT INTO ld_catalog\.ld_vehicle_applications/);
});


test('global audit OEM display comes only from elimfilters_catalog.oem_codes', () => {
  assert.match(audit, /c\.oem_codes/);
  assert.match(audit, /function formatOemCodes\(value\)/);
  assert.match(audit, /oem:\s*formatOemCodes\(oem_codes\)/);
  assert.doesNotMatch(audit, /competitor_codes/);
  assert.doesNotMatch(audit, /['"`]DB['"`]/);
});


test('application source mismatch is governed by relational parent identity, not compact public base codes', () => {
  assert.match(audit, /JOIN ld_catalog\.ld_product_catalog p ON p\.elimfilters_sku=v\.elimfilters_sku/);
  assert.match(audit, /p\.source_sku AS expected_parent_source_sku/);
  assert.match(audit, /coalesce\(p\.source_sku/);
  assert.doesNotMatch(
    audit,
    /regexp_replace\(upper\(coalesce\(v\.source_sku,''\)\).*<> regexp_replace\(upper\(coalesce\(c\.codigo_base,''\)/s
  );
});

test('FRAM EXISTING_DIRECT analysis measures relational application coverage', () => {
  assert.match(framGapAnalyzer, /function applicationCoverage\(/);
  assert.match(framGapAnalyzer, /ld_catalog\.ld_vehicle_applications/);
  assert.match(framGapAnalyzer, /existing_application_gap_count/);
  assert.match(framGapAnalyzer, /existing_application_gaps/);
  assert.match(framGapAnalyzer, /status:'EXISTING_DIRECT'.*applicationCoverage/s);
});

test('FRAM reconciliation can consume existing application gaps and inserts only missing application rows', () => {
  assert.match(framReconcile, /--existing-application-gaps/);
  assert.match(framReconcile, /gap\.existing_application_gaps/);
  assert.match(framReconcile, /existingAppKeys/);
  assert.match(framReconcile, /applications_already_present/);
  assert.match(framReconcile, /applications_missing/);
  assert.match(framReconcile, /evidenceAppRows\.filter\(r=>!existingAppKeys\.has\(applicationKey\(r\)\)\)/);
});


test('FRAM reconciliation holds missing public targets instead of blocking valid targets', () => {
  assert.match(framReconcile, /TARGET_NOT_IN_PUBLIC_CATALOG/);
  assert.match(framReconcile, /missing_target_authorities/);
  assert.match(framReconcile, /missing_target_skus/);
  assert.match(framReconcile, /activeEntries/);
  assert.doesNotMatch(framReconcile, /Missing targets \$\{targets\.length\}\/\$\{skus\.length\}/);
});
