'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyGovernanceToSearchBody
} = require('../lib/part-search-reference-governance-patch');

test('1R0732 keeps canonical EH66700 in the real public API response shape', () => {
  const body = applyGovernanceToSearchBody({
    success: true,
    source: 'xref_governed',
    resolution: 'RESOLVED',
    governed_reference: '1R0732',
    results: [{
      elimfilters_sku: 'EH66700',
      duty: 'HEAVY_DUTY',
      filter_type: 'hydraulic',
      thread_size: null
    }]
  }, '1R0732');

  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].elimfilters_sku, 'EH66700');
  assert.equal(body.source, 'xref_governed');
  assert.equal(body.resolution, 'RESOLVED');
  assert.equal(body.governed_reference, '1R0732');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_clarification_required, false);
});
