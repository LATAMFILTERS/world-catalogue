'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { primaryOnlySearchBody, upstreamTargetFor } = require('../bridge-server');

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
