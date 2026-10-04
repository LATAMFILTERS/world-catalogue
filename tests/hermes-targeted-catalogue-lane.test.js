'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');

const readiness=fs.readFileSync(path.join(__dirname,'..','scripts','hermes','catalogue-readiness.mjs'),'utf8');
const dossier=fs.readFileSync(path.join(__dirname,'..','scripts','hermes','catalogue-dossier-research.mjs'),'utf8');
const workOrders=fs.readFileSync(path.join(__dirname,'..','scripts','hermes','catalogue-quality-work-orders.mjs'),'utf8');

test('targeted catalogue readiness sync requires explicit SKU allowlist and expected count support',()=>{
  assert.match(readiness,/HERMES_CATALOGUE_TARGET_SKUS/);
  assert.match(readiness,/HERMES_CATALOGUE_EXPECTED_TARGET_COUNT/);
  assert.match(readiness,/HERMES_TARGET_COUNT_MISMATCH/);
  assert.match(readiness,/HERMES_TARGET_SKUS_NOT_ACTIVE_OR_MISSING/);
});

test('targeted readiness backlog resolution is constrained to target SKUs',()=>{
  assert.match(readiness,/WHERE sku=ANY\(\$2::text\[\]\)/);
  assert.match(readiness,/\[activeIds,\[\.\.\.targetSkus\]\]/);
});

test('catalogue work orders already honor the same target SKU allowlist',()=>{
  assert.match(workOrders,/HERMES_CATALOGUE_TARGET_SKUS/);
  assert.match(workOrders,/targetSkus\.has/);
});

test('dossier research cannot select non-target SKUs when targeted',()=>{
  assert.match(dossier,/HERMES_CATALOGUE_TARGET_SKUS/);
  assert.match(dossier,/HERMES_CATALOGUE_EXPECTED_TARGET_COUNT/);
  assert.match(dossier,/HERMES_TARGET_LIST_COUNT_MISMATCH/);
  assert.match(dossier,/if\(targeted&&!targetSkus\.has\(String\(item\.sku\|\|''\)\.toUpperCase\(\)\)\) continue/);
});
