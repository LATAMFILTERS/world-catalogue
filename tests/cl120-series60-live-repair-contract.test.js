'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const src = fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_124_repair_cl120_series60_acceptance.js'),
  'utf8'
);

test('run_124 is dry-run by default and serializable', () => {
  assert.match(src,/process\.argv\.includes\('--apply'\)/);
  assert.match(src,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(src,/ROLLBACK \(dry-run\)/);
});

test('run_124 is scoped to exact CL120 Series 60 tuple', () => {
  for (const token of ['FREIGHTLINER','Columbia','Columbia CL120','Detroit Diesel Series 60','EK50101']) {
    assert.ok(src.includes(token), 'missing scope token ' + token);
  }
});

test('run_124 requires the canonical seven-component set', () => {
  for (const sku of ['EL82100','ES90463','EF96916','EW74685','EA17682','EL82518','EC14226']) {
    assert.ok(src.includes(sku), 'missing canonical SKU ' + sku);
  }
});

test('run_124 removes only the two legacy application identities', () => {
  assert.ok(src.includes("['EL32102','EA31300']"));
  assert.doesNotMatch(src,/DELETE FROM public\.elimfilters_catalog/i);
  assert.doesNotMatch(src,/DELETE FROM maintenance_kits/i);
});
