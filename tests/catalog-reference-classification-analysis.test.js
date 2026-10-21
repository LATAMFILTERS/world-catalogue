'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { explainReferenceClassification: explain } = require('../lib/catalog-reference-classification-analysis');
const row = (oem, competitor) => ({ sku: 'EA10001', oem_codes: oem, competitor_codes: competitor });

test('same digits under distinct names remain evidence-required and preserve originals', () => {
  const input = row([{ manufacturer: 'AMERICAN MOTORS CORPORATION', code: '12-34' }], ['AMC|1234']);
  const before = JSON.stringify(input);
  const result = explain(input);
  assert.equal(result.length, 1);
  assert.equal(result[0].pairs[0].reason, 'DISTINCT_NAMES_REQUIRE_ENTITY_AND_ROLE_EVIDENCE');
  assert.equal(result[0].status, 'EVIDENCE_REQUIRED');
  assert.equal(result[0].conflict_exemption_allowed, false);
  assert.equal(JSON.stringify(input), before);
});

test('same manufacturer aliases normalized by native policy remain conflicts', () => {
  const result = explain(row([{ brand: 'MANN-FILTER', reference: 'AB 123' }], ['MANN FILTER|AB123']));
  assert.equal(result[0].pairs[0].reason, 'SAME_MANUFACTURER_IN_BOTH_COLUMNS');
});

test('missing manufacturers never become distinct-entity evidence', () => {
  const result = explain(row(['1234'], [{ manufacturer: 'AMC', part_number: '1234' }]));
  assert.equal(result[0].pairs[0].reason, 'MANUFACTURER_MISSING');
});

test('all colliding manufacturer pairs are retained, duplicate pairs counted once', () => {
  const result = explain(row(['OEM|1234', 'OEM|1234'], ['FILTER|1234', 'OEM|1234']));
  assert.equal(result.length, 1);
  assert.equal(result[0].pairs.length, 2);
  assert.ok(result[0].pairs.some(p => p.reason === 'SAME_MANUFACTURER_IN_BOTH_COLUMNS'));
});

test('different references do not collide and incomplete inputs fail closed', () => {
  assert.deepEqual(explain(row(['OEM|1234'], ['FILTER|1235'])), []);
  assert.throws(() => explain({ sku: 'X', oem_codes: [] }), /Both original/);
});
