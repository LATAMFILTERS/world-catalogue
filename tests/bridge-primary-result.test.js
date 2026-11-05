'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { primaryOnlySearchBody, applyBridgeProductPresentation, upstreamTargetFor } = require('../bridge-server');

test('LF3620 exposes EL82100 only and links the other matches as alternatives', () => {
  const body = primaryOnlySearchBody({
    success: true,
    results: [
      { elimfilters_sku: 'EL81016', alternatives: [] },
      { elimfilters_sku: 'EL82100', alternatives: [] },
      { elimfilters_sku: 'EL83998', alternatives: [] }
    ]
  }, 'LF-3620');

  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].elimfilters_sku, 'EL82100');
  assert.deepEqual(body.results[0].alternatives, [
    { sku: 'EL81016' },
    { sku: 'EL83998' }
  ]);
  assert.equal(body.primary_sku, 'EL82100');
  assert.equal(body.result_policy, 'PRIMARY_ONLY_WITH_LINKED_ALTERNATIVES');
});

test('multi-match searches display the API-ranked first SKU as primary by default', () => {
  const body = primaryOnlySearchBody({
    success: true,
    results: [
      { elimfilters_sku: 'EL10000', alternatives: [{ sku: 'EL09999' }] },
      { elimfilters_sku: 'EL10001' }
    ]
  }, 'UNMAPPED');

  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].elimfilters_sku, 'EL10000');
  assert.deepEqual(body.results[0].alternatives, [
    { sku: 'EL09999' },
    { sku: 'EL10001' }
  ]);
});

test('single-result searches remain unchanged', () => {
  const original = { success: true, results: [{ elimfilters_sku: 'EL84004' }] };
  assert.equal(primaryOnlySearchBody(original, 'P554004'), original);
});

test('bridge API route maps to the Lenovo upstream API path', () => {
  const target = upstreamTargetFor('/bridge/api/search?q=LF3620', new URL('https://search-api.elimfilters.com'));
  assert.equal(target.pathname, '/api/search');
  assert.equal(target.searchParams.get('q'), 'LF3620');
});


test('bridge restores ET97784 proprietary identity and TURBOCORE presentation', () => {
  const body = applyBridgeProductPresentation({
    success: true,
    results: [{
      elimfilters_sku: 'ET97784',
      filter_type: 'TURBINE',
      equipment_applications: [{ equipment: 'TOYOTA HILUX' }]
    }]
  });

  assert.equal(body.results[0].technology, 'TURBOCORE™');
  assert.equal(body.results[0].canonical_source_brand, 'ELIMFILTERS');
  assert.equal(body.results[0].canonical_source_code, 'ET97784');
  assert.equal(body.results[0].canonical_source_status, 'VERIFIED');
});

test('bridge serves ET90010 image, Baldwin reference and stationary uses without changing catalog identity', () => {
  const raw = {
    success: true, results: [{
      elimfilters_sku: 'ET90010',
      description: 'Original source description',
      image_url: null,
      oem_codes: [],
      competitor_codes: [{ manufacturer: 'BALDWIN', code: 'B10AL' }],
      equipment_applications: [],
    }, { elimfilters_sku: 'ES90674', image_url: null }]
  };
  const patched = applyBridgeProductPresentation(raw);
  const p = patched.results[0];
  const url = 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/ET90010.png';
  assert.equal(p.image_url, url);
  assert.equal(p.reference_manufacturer, 'Baldwin Filters');
  assert.equal(p.reference_part_number, 'B10-AL');
  assert.equal(p.reference_usage.length, 3);
  assert.deepEqual(p.reference_operating_conditions.pumped_flow_gpm, 25);
  assert.deepEqual(p.reference_operating_conditions.gravity_flow_gpm, 10);
  assert.deepEqual(p.reference_operating_conditions.gravity_head_in, 30);
  assert.equal(p.description, 'Original source description');
  assert.deepEqual(p.competitor_codes, raw.results[0].competitor_codes);
  assert.deepEqual(p.equipment_applications, []);
  assert.equal(p.canonical_source_code, 'ET90010');
  assert.equal(patched.results[1].image_url, null);
  assert.equal(raw.results[0].image_url, null);
});
