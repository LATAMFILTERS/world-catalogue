import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INDUSTRIAL_BASE_AUTHORITY_STATUS,
  INDUSTRIAL_FAMILY_ANCHORS,
  INDUSTRIAL_BASE_CODE_RESEARCH_POLICY,
  classifyIndustrialReference,
  getIndustrialFamilyAnchor,
  formatIndustrialFamilyAnchorsForPrompt,
} from '../../scripts/hermes/industrial-product-base-policy.mjs';

test('Industrial base authority exposes exactly the four approved states', () => {
  assert.deepEqual(Object.values(INDUSTRIAL_BASE_AUTHORITY_STATUS), [
    'ORIGINAL_BASE',
    'FAMILY_ANCHOR_BASE',
    'COMPETITOR_CROSS',
    'SOURCE_ONLY',
  ]);
});

test('approved family anchors cover all commercial Industrial Technology Cores', () => {
  const expected = {
    'TC-AIR-01': 'CAMFIL',
    'TC-AIR-02': 'CAMFIL',
    'TC-AIR-03': 'CAMFIL',
    'TC-DUST-01': 'DONALDSON',
    'TC-NG-01': 'PALL',
    'TC-NG-02': 'PALL',
    'TC-HYD-01': 'PARKER',
    'TC-LUB-01': 'PARKER',
    'TC-OIL-01': 'PALL',
    'TC-OIL-02': 'PALL',
    'TC-WAT-01': 'PALL',
    'TC-WAT-03': 'CALGON CARBON',
    'TC-WAT-04': 'DUPONT FILMTEC',
    'TC-WAT-05': 'DUPONT WATER SOLUTIONS',
    'TC-WAT-06': 'DUPONT FILMTEC',
    'TC-WAT-07': 'DUPONT AMBERLITE',
  };
  for (const [core, brand] of Object.entries(expected)) {
    assert.equal(getIndustrialFamilyAnchor(core)?.anchor_brand, brand, core);
    assert.equal(getIndustrialFamilyAnchor(core)?.commercial_base_allowed, true, core);
  }
});

test('confirmed original always outranks the family anchor', () => {
  const result = classifyIndustrialReference({
    technologyCore: 'TC-HYD-01',
    brand: 'HYDAC',
    code: '0160D010BN4HC',
    originalConfirmed: true,
    primaryEvidenceComplete: true,
    crossValidated: true,
  });
  assert.equal(result.authority_status, 'ORIGINAL_BASE');
  assert.equal(result.base_eligible, true);
});

test('approved anchor becomes base only with complete primary evidence', () => {
  const complete = classifyIndustrialReference({
    technologyCore: 'TC-HYD-01',
    brand: 'Parker Hannifin',
    code: 'PAR-FIT-EXAMPLE',
    primaryEvidenceComplete: true,
  });
  assert.equal(complete.authority_status, 'FAMILY_ANCHOR_BASE');
  assert.equal(complete.base_eligible, true);

  const incomplete = classifyIndustrialReference({
    technologyCore: 'TC-HYD-01',
    brand: 'Parker',
    code: 'PAR-FIT-EXAMPLE',
    primaryEvidenceComplete: false,
  });
  assert.equal(incomplete.authority_status, 'SOURCE_ONLY');
  assert.equal(incomplete.base_eligible, false);
});

test('validated interchange remains competitor cross when it is not original or approved anchor base', () => {
  const result = classifyIndustrialReference({
    technologyCore: 'TC-HYD-01',
    brand: 'Pall',
    code: 'HC9600-EXAMPLE',
    crossValidated: true,
  });
  assert.equal(result.authority_status, 'COMPETITOR_CROSS');
  assert.equal(result.base_eligible, false);
});

test('discovery supplier remains source-only by default', () => {
  const result = classifyIndustrialReference({
    technologyCore: 'TC-NG-01',
    brand: 'REIKE',
    code: 'RK-EXAMPLE',
    primaryEvidenceComplete: true,
  });
  assert.equal(result.authority_status, 'SOURCE_ONLY');
  assert.equal(result.base_eligible, false);
});

test('EDI and oil-mist candidate remain blocked from commercial base assignment', () => {
  assert.equal(INDUSTRIAL_FAMILY_ANCHORS['TC-WAT-08'].commercial_base_allowed, false);
  assert.equal(INDUSTRIAL_FAMILY_ANCHORS['PARTION-OIL-MIST-CANDIDATE'].commercial_base_allowed, false);

  const edi = classifyIndustrialReference({
    technologyCore: 'TC-WAT-08',
    brand: 'DuPont Water Solutions',
    code: 'EDI-EXAMPLE',
    primaryEvidenceComplete: true,
  });
  assert.equal(edi.authority_status, 'SOURCE_ONLY');
  assert.equal(edi.base_eligible, false);
});

test('HERMES prompt policy carries precedence, pre-SKU gate and family anchors', () => {
  assert.match(INDUSTRIAL_BASE_CODE_RESEARCH_POLICY, /confirmed original element\/equipment reference > approved family anchor/i);
  assert.match(INDUSTRIAL_BASE_CODE_RESEARCH_POLICY, /Parker Par Fit/i);
  assert.match(INDUSTRIAL_BASE_CODE_RESEARCH_POLICY, /pre-SKU/i);
  const prompt = formatIndustrialFamilyAnchorsForPrompt();
  assert.match(prompt, /TC-HYD-01: FLUREXIS™ \/ HYLTRIS™.*-> PARKER/);
  assert.match(prompt, /TC-NG-01: COALVEX™ \/ COALERIS™.*-> PALL/);
  assert.match(prompt, /TC-WAT-08: AQUVEXIS™ \/ Electrodeionization -> NO COMMERCIAL BASE \[RESEARCH\/DESCRIPTIVE ONLY\]/);
});
