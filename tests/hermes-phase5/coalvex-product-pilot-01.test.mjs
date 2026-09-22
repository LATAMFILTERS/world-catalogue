import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { classifyIndustrialReference } from '../../scripts/hermes/industrial-product-base-policy.mjs';

const pilot = JSON.parse(fs.readFileSync('config/industrial-product-pilots/coalvex-pilot-01.json', 'utf8'));
const migration = fs.readFileSync('migrations/ebp-phase1/004_industrial_process_duty.sql', 'utf8');

test('COALVEX pilot 01 stays inside the approved 10–20 reference batch', () => {
  assert.equal(pilot.pilot_id, 'COALVEX-PILOT-01');
  assert.ok(pilot.elements.length >= 10 && pilot.elements.length <= 20);
  assert.equal(pilot.elements.length, 15);
  assert.equal(pilot.sku_minting_allowed, false);
});

test('pilot is strictly COALVEX / COALERIS / TC-NG-01 liquid-gas coalescence', () => {
  assert.equal(pilot.platform, 'COALVEX™');
  assert.equal(pilot.technology_family, 'COALERIS™');
  assert.equal(pilot.technology_core, 'TC-NG-01');
  assert.equal(pilot.duty, 'INDUSTRIAL_PROCESS');
  for (const row of pilot.elements) {
    assert.equal(row.platform, 'COALVEX™');
    assert.equal(row.technology_family, 'COALERIS™');
    assert.equal(row.technology_core, 'TC-NG-01');
    assert.equal(row.filtration_function, 'GAS_LIQUID_COALESCENCE');
  }
});

test('all pilot base identities resolve through the approved Pall family anchor', () => {
  for (const row of pilot.elements) {
    const result = classifyIndustrialReference({
      technologyCore: row.technology_core,
      brand: row.source_brand,
      code: row.source_code,
      originalConfirmed: row.original_confirmed,
      primaryEvidenceComplete: row.primary_evidence_complete,
      crossValidated: false,
    });
    assert.equal(result.authority_status, 'FAMILY_ANCHOR_BASE', row.source_code);
    assert.equal(result.base_eligible, true, row.source_code);
    assert.equal(row.base_authority_status, 'FAMILY_ANCHOR_BASE');
  }
});

test('pilot has unique exact Pall source codes and does not invent ELIMFILTERS SKUs or crosses', () => {
  const codes = pilot.elements.map((row) => row.source_code);
  assert.equal(new Set(codes).size, codes.length);
  for (const row of pilot.elements) {
    assert.equal(row.source_brand, 'PALL');
    assert.equal(row.canonical_sku, null);
    assert.equal(row.sku_state, 'PRE_SKU_CANDIDATE');
    assert.deepEqual(row.competitor_crosses, []);
    assert.equal(row.original_confirmed, false);
  }
});

test('all numeric/product performance stays manufacturer-declared and uses Pall primary evidence', () => {
  assert.equal(pilot.evidence_policy.performance_claim_state, 'MANUFACTURER_DECLARED');
  for (const row of pilot.elements) {
    assert.equal(row.source_claim_status, 'MANUFACTURER_DECLARED');
    assert.equal(row.validation_status, 'TECHNICAL_IDENTITY_VALIDATED');
    assert.equal(row.primary_evidence_complete, true);
    assert.ok(row.source_urls.length > 0);
    for (const url of row.source_urls) {
      const host = new URL(url).hostname;
      assert.ok(host === 'www.pall.com' || host === 'pall.com' || host === 'shop.pall.com', `${row.source_code}: non-Pall source ${url}`);
    }
  }
});

test('amine/ammonia B-style variants stay explicitly distinguished', () => {
  const compatible = new Set(pilot.elements.filter((row) => row.amine_ammonia_compatible).map((row) => row.source_code));
  for (const code of ['CC3LGB7H13','CS604LGBH','CS604LGBH1','CS604LGBH13','CS604LGBDH13','CS604LGBT2H13','CS604LGBT2DH13']) {
    assert.ok(compatible.has(code), code);
  }
});

test('EBP migration adds Industrial Process without removing HD or LD duties', () => {
  assert.match(migration, /'HEAVY_DUTY'/);
  assert.match(migration, /'LIGHT_DUTY'/);
  assert.match(migration, /'INDUSTRIAL_PROCESS'/);
  assert.match(migration, /must not be collapsed into HEAVY_DUTY/i);
});
