'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyConflictCode, clearableSkus } = require('../scripts/migrations/lib/hd-exact-conflict-rule');

const row = (sku, o = {}) => ({
  part_number: 'X1', sku, duty: 'HEAVY_DUTY', catalog_active: true, reference_type: 'OEM',
  source: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', filter_type: 'FUEL', sub_type: 'SPIN-ON',
  installation_type: 'SPIN-ON', thread_size: '1-14', height_mm: 100, outer_diameter_mm: 80, ...o
});

test('same type, same tech, official source per SKU: shared legit', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { height_mm: 102 })]), 'SHARED_LEGIT');
});
test('LD partner stays blocked (HD/LD)', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { duty: 'LIGHT_DUTY' })]), 'CROSS_DUTY');
});
test('OEM vs competitor stays blocked', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { reference_type: 'COMPETITOR' })]), 'TYPE_MISMATCH');
});
test('different filter type / thread / height stay blocked', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { filter_type: 'OIL' })]), 'FILTER_TYPE_DIFFERS');
  assert.equal(classifyConflictCode([row('A'), row('B', { thread_size: '3/4-16' })]), 'SUBTYPE_OR_MOUNT_VARIANT');
  assert.equal(classifyConflictCode([row('A'), row('B', { height_mm: 150 })]), 'DIMENSION_VARIANT');
});
test('missing dimension or missing official source stays blocked', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { height_mm: '' })]), 'DIMENSIONS_MISSING');
  assert.equal(classifyConflictCode([row('A'), row('B', { source: 'DONALDSON_CAPTURE:productos.json' })]), 'NO_PER_SKU_OFFICIAL_EVIDENCE');
});
test('retired partner is stale, not legit', () => {
  assert.equal(classifyConflictCode([row('A'), row('B', { catalog_active: false })]), 'STALE_INACTIVE_PARTNER');
});
test('a SKU is cleared only if ALL its conflict codes are legit', () => {
  const ok = [row('A'), row('B')];
  const bad = [row('A', { part_number: 'X2' }), row('C', { part_number: 'X2', duty: 'LIGHT_DUTY' })];
  const cleared = clearableSkus([...ok, ...bad]);
  assert.equal(cleared.has('B'), true);
  assert.equal(cleared.has('A'), false); // A also collides with an LD SKU on X2
  assert.equal(cleared.has('C'), false);
});
test('ET97784-style SKU with no conflicting code is simply not in the input', () => {
  assert.equal(clearableSkus([]).has('ET97784'), false);
});
