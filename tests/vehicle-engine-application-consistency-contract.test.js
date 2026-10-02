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

test('run_123 requires canonical source before repairing application ownership', () => {
  assert.match(repair, /canonical_source_code \|\| row\.codigo_base/);
  assert.match(repair, /NO_CANONICAL_SOURCE/);
  assert.match(repair, /REALIGN_APPLICATION_SOURCE/);
});

test('run_123 only inherits kit applications from existing sibling evidence', () => {
  assert.match(repair, /INHERIT_KIT_PLATFORM_APPLICATIONS/);
  assert.match(repair, /NO_SIBLING_APPLICATION_EVIDENCE/);
  assert.match(repair, /kc\.filter_sku<>\$2/);
});


test('global audit OEM display comes only from elimfilters_catalog.oem_codes', () => {
  assert.match(audit, /c\.oem_codes/);
  assert.match(audit, /function formatOemCodes\(value\)/);
  assert.match(audit, /oem:\s*formatOemCodes\(oem_codes\)/);
  assert.doesNotMatch(audit, /competitor_codes/);
  assert.doesNotMatch(audit, /['"`]DB['"`]/);
});
