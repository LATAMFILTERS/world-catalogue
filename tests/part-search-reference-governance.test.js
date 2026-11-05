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
const {
  quarantineForReference,
  replaceReferenceQuarantineForTest,
} = require('../lib/catalog-reference-quarantine');

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

test('MW75 BMW OE reference is governed to EL30075 LD', () => {
  const policy = governanceForReferences(['11 42 7 673 541']);
  assert.ok(policy);
  assert.equal(policy.duty, 'LIGHT_DUTY');
  assert.deepEqual(policy.approvedSkus, ['EL30075']);
  assert.equal(governedDutyForReference('11 42 7 673 541', null), 'LIGHT_DUTY');
});

test('MW75 PG164EX governed reference family resolves legacy ambiguity to EL30075 LD', () => {
  const refs = ['1180815','1182236','2934616','AM125424','AM119567','5102278X1','17524','36563','1077817','B7165','B7222','PH3656','OC306','100245','120-485'];
  for (const ref of refs) {
    const policy = governanceForReferences([ref]);
    assert.ok(policy, ref);
    assert.equal(policy.duty, 'LIGHT_DUTY', ref);
    assert.deepEqual(policy.approvedSkus, ['EL30075'], ref);
    assert.equal(governedDutyForReference(ref, null), 'LIGHT_DUTY', ref);
  }
});

test('PH8170 is preserved as a reviewed cross-duty oil reference', () => {
  const policy = governanceForReferences(['PH8170']);
  assert.ok(policy);
  assert.equal(policy.duty, undefined);
  assert.deepEqual(policy.approvedSkus, ['EL30075', 'EL82024']);
  assert.equal(governedDutyForReference('PH8170', 'HEAVY_DUTY'), 'HEAVY_DUTY');
  assert.equal(governedDutyForReference('PH8170', 'LIGHT_DUTY'), 'LIGHT_DUTY');
});

test('WIX 57035 governance excludes air contamination and preserves reviewed oil families', () => {
  const policy = governanceForReferences(['57035']);
  assert.ok(policy);
  assert.deepEqual(policy.approvedSkus, ['EL30075', 'EL30077', 'EL82024']);
  const products = [
    { sku: 'EL30075', duty: 'LIGHT_DUTY', filter_type: 'oil' },
    { sku: 'EL30077', duty: 'LIGHT_DUTY', filter_type: 'oil' },
    { sku: 'EL82024', duty: 'HEAVY_DUTY', filter_type: 'oil' },
    { sku: 'EA39101', duty: 'LIGHT_DUTY', filter_type: 'air' }
  ];
  assert.deepEqual(filterProductsForGovernance(products, policy).map(x => x.sku),
    ['EL30075', 'EL30077', 'EL82024']);
});

test('HU719/5X PG5316 problem references resolve to EL37195 LD', () => {
  for (const ref of ['LF519','725','L448']) {
    const policy = governanceForReferences([ref]);
    assert.ok(policy, ref);
    assert.equal(policy.duty, 'LIGHT_DUTY', ref);
    assert.deepEqual(policy.approvedSkus, ['EL37195'], ref);
  }
});

test('PH3387A Premium Guard and FRAM-family references resolve to EL33387 LD', () => {
  for (const ref of ['PG6161','TG3387A','XG3387A']) {
    const policy = governanceForReferences([ref]);
    assert.ok(policy, ref);
    assert.equal(policy.duty, 'LIGHT_DUTY', ref);
    assert.deepEqual(policy.approvedSkus, ['EL33387'], ref);
  }
});

test('CH10158/HU7009Z oil references are governed away from EA37009 air contamination', () => {
  const refs = ['04152-0R010','04152-26010','04152-31060','04152-31080','04152-38010','04152-YZZA3','04152-YZZA5','15613-YZZA2','L25609','OX790D'];
  for (const ref of refs) {
    const policy = governanceForReferences([ref]);
    assert.ok(policy, ref);
    assert.equal(policy.duty, 'LIGHT_DUTY', ref);
    assert.deepEqual(policy.approvedSkus, ['EL30158'], ref);
  }
});

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

test('runtime applies governed duty and strict certified-canonical guard before the original search handler', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', 'lib',
    'part-search-runtime-hardening.js'), 'utf8');
  assert.match(source, /governedDutyForReference\(raw, req\.query\?\.duty\)/);
  assert.match(source, /req\.query\.duty = governedDuty/);
  assert.match(source, /catalog_sku_certification/);
  assert.match(source, /certification_state='CERTIFIED'/);
  assert.match(source, /v_api_resolver_v7/);
  assert.match(source, /EVIDENCE_REQUIRED/);
});

test('unreviewed cross-duty reference is loaded into fail-closed quarantine', () => {
  replaceReferenceQuarantineForTest([{
    normalizedReference: '1R0716',
    hdCount: 8,
    ldCount: 3,
    reasons: ['CROSS_DUTY', 'OFFICIAL_EVIDENCE_REQUIRED'],
  }]);
  const entry = quarantineForReference('1R-0716');
  assert.ok(entry);
  assert.equal(entry.normalizedReference, '1R0716');
  assert.deepEqual(entry.reasons, ['CROSS_DUTY', 'OFFICIAL_EVIDENCE_REQUIRED']);
  replaceReferenceQuarantineForTest([]);
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
