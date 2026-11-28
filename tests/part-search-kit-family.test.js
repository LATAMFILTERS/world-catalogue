'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickKitFamily } = require('../lib/part-search-runtime-hardening');
const { renderProduct } = require('../lib/install-part-seo-pages');

const kit = { sku: 'EK31833', installation_type: 'Kit', components: ['EF37291', 'EF37867'] };

test('a code shared by a kit and its own filters returns the family, kit first', () => {
  assert.deepEqual(pickKitFamily([{ sku: 'EF37867' }, kit, { sku: 'EF37291' }]), ['EK31833', 'EF37291', 'EF37867']);
});

test('anything else stays ambiguous', () => {
  assert.equal(pickKitFamily([kit]), null);
  assert.equal(pickKitFamily([{ sku: 'EF37291' }, { sku: 'EF37867' }]), null);
  assert.equal(pickKitFamily([kit, { sku: 'ES91833' }]), null);
});

test('kit page lists its filters', () => {
  const html = renderProduct({ sku: 'EK31833', filter_type: 'fuel', kit_components: ['EF37291', 'EF37867'] }, 'es');
  assert.match(html, /Contenido del kit/);
  assert.ok(html.includes('/es/part/EF37867/'));
});
