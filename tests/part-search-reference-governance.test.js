'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  governanceForReferences,
  governedDutyForReference,
  filterProductsForGovernance,
  applyGovernanceToCatalogResult,
  applyGovernanceToSearchBody,
  singleDutyFromProducts,
  isPathologicallyContaminated,
  physicalSignature,
  filterGlobalReferenceSafety
} = require('../lib/part-search-reference-governance-patch');

const candidates = [
  { sku: 'EL80788', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL81808', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL84005', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL84105', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL84206', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL87405', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL87505', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
  { sku: 'EL89050', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: 'M90X2-7H' }
];

test('1R1808 governance contains the verified five-SKU HD family', () => {
  const policy = governanceForReferences(['1R-1808']);
  assert.ok(policy);
  assert.equal(policy.duty, 'HEAVY_DUTY');
  assert.deepEqual(policy.approvedSkus, ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
});

test('1R1808 excludes secondary cross-reference contamination', () => {
  const policy = governanceForReferences(['1R1808']);
  const filtered = filterProductsForGovernance(candidates, policy);
  assert.deepEqual(filtered.map(x => x.sku), ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
  assert.ok(!filtered.some(x => ['EL80788', 'EL84206', 'EL89050'].includes(x.sku)));
});

test('catalog result is resolved as HD without a duty clarification', () => {
  const result = applyGovernanceToCatalogResult({ products: candidates, lookupStatus: 'completed' }, ['1R1808']);
  assert.equal(result.resolvedDuty, 'HEAVY_DUTY');
  assert.equal(result.dutyResolution, 'REFERENCE_GOVERNANCE');
  assert.equal(result.products.length, 5);
  assert.equal(singleDutyFromProducts(result.products), 'HEAVY_DUTY');
});

test('public search response exposes fixed duty and five approved results', () => {
  const body = applyGovernanceToSearchBody({ results: candidates }, '1R1808');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_clarification_required, false);
  assert.deepEqual(body.results.map(x => x.sku), ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
});

test('1R1808 governed HD family bypasses the upstream mixed-duty prompt', () => {
  const hdProducts = candidates.map(({ sku, ...product }) => ({
    ...product,
    elimfilters_sku: sku
  }));
  const ldProducts = [
    { elimfilters_sku: 'WL10001', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: '3/4-16 UN' },
    { elimfilters_sku: 'WL10002', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: 'M20X1.5' }
  ];
  const body = applyGovernanceToSearchBody({
    success: true,
    source: 'xref_v5',
    resolution: 'AMBIGUOUS',
    results: [],
    mixed_duty: true,
    hd_count: 8,
    ld_count: 2,
    hd_products: hdProducts,
    ld_products: ldProducts
  }, '1R-1808');

  assert.equal(body.mixed_duty, false);
  assert.equal(body.source, 'xref_governed');
  assert.equal(body.resolution, 'RESOLVED');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_resolution, 'REFERENCE_GOVERNANCE');
  assert.equal(body.duty_clarification_required, false);
  assert.equal(body.governed_reference, '1R1808');
  assert.equal(body.reference_safety_removed, 5);
  assert.deepEqual(body.results.map(x => x.elimfilters_sku), [
    'EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505'
  ]);
});

test('1R1808 governance overrides an explicit LIGHT_DUTY request before SQL', () => {
  assert.equal(governedDutyForReference('1R-1808', 'LIGHT_DUTY'), 'HEAVY_DUTY');
  assert.equal(governedDutyForReference('1R1808', null), 'HEAVY_DUTY');
  assert.equal(governedDutyForReference('UNRELATED', 'LIGHT_DUTY'), 'LIGHT_DUTY');
});

test('1R1808 fail-closed response removes contaminated LD candidates', () => {
  const body = applyGovernanceToSearchBody({
    success: true,
    source: 'xref_ambiguous',
    resolution: 'AMBIGUOUS',
    results: [],
    candidates: ['EL33125', 'EL34518']
  }, '1R1808');

  assert.deepEqual(body.candidates, []);
  assert.equal(body.source, 'xref_governed');
  assert.equal(body.resolution, 'GOVERNANCE_BLOCKED_CONFLICTING_DUTY');
  assert.equal(body.governed_reference, '1R1808');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.reference_safety_removed, 2);
});

test('runtime applies governed duty before the original search handler', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', 'lib',
    'part-search-runtime-hardening.js'), 'utf8');
  assert.match(source, /governedDutyForReference\(raw, req\.query\?\.duty\)/);
  assert.match(source, /req\.query\.duty = governedDuty/);
});

test('1R0732 keeps EH66700 when public API uses elimfilters_sku', () => {
  const apiBody = {
    success: true,
    source: 'xref_governed',
    resolution: 'RESOLVED',
    results: [{
      elimfilters_sku: 'EH66700',
      duty: 'HEAVY_DUTY',
      filter_type: 'hydraulic',
      thread_size: null
    }]
  };
  const body = applyGovernanceToSearchBody(apiBody, '1R0732');
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].elimfilters_sku, 'EH66700');
  assert.equal(body.source, 'xref_governed');
  assert.equal(body.resolution, 'RESOLVED');
  assert.equal(body.governed_reference, '1R0732');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_clarification_required, false);
});

test('pathological cross-reference blobs are quarantined from secondary matching', () => {
  const pathological = {
    sku: 'EF92005',
    duty: 'HEAVY_DUTY',
    filter_type: 'fuel',
    thread_size: '1-14 UN',
    oem_codes: Array.from({ length: 1001 }, (_, i) => ({ code: `X${i}` })),
    competitor_codes: []
  };
  assert.equal(isPathologicallyContaminated(pathological), true);
});

test('global safety uses a direct canonical match as the physical anchor', () => {
  const products = [
    { sku: 'EL81808', codigo_base: 'P551808', protocol_match_type: 'direct_reference', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'EL84005', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'BADHD', duty: 'HEAVY_DUTY', filter_type: 'fuel', thread_size: 'M20X1.5' },
    { sku: 'BADLD', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: '3/4-16 UN' }
  ];
  const result = filterGlobalReferenceSafety(products, ['P551808']);
  assert.deepEqual(result.products.map(x => x.sku), ['EL81808', 'EL84005']);
  assert.equal(result.status, 'DIRECT_ANCHOR_FILTERED');
  assert.equal(result.removed, 2);
});

test('global safety selects one dominant physical family when secondary graph is polluted', () => {
  const products = [
    { sku: 'A1', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'A2', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'A3', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'B1', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: '3/4-16 UN' },
    { sku: 'C1', duty: 'HEAVY_DUTY', filter_type: 'fuel', thread_size: 'M20X1.5' }
  ];
  const result = filterGlobalReferenceSafety(products, ['OEM12345']);
  assert.deepEqual(result.products.map(x => x.sku), ['A1', 'A2', 'A3']);
  assert.equal(result.status, 'DOMINANT_PHYSICAL_FAMILY');
  assert.equal(result.removed, 2);
});

test('global safety fails closed when conflicting physical families tie', () => {
  const products = [
    { sku: 'A1', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'A2', duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' },
    { sku: 'B1', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: '3/4-16 UN' },
    { sku: 'B2', duty: 'LIGHT_DUTY', filter_type: 'oil', thread_size: '3/4-16 UN' }
  ];
  const result = filterGlobalReferenceSafety(products, ['OEM99999']);
  assert.deepEqual(result.products, []);
  assert.equal(result.status, 'AMBIGUOUS_PHYSICAL_FAMILIES_REVIEW_REQUIRED');
});

test('physical signature includes duty, filter type and thread', () => {
  assert.equal(
    physicalSignature({ duty: 'HEAVY_DUTY', filter_type: 'oil', thread_size: '1 1/2-16 UN' }),
    'HEAVY_DUTY|OIL|11216UN'
  );
});
