'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { imageUrlForSku } = require('../lib/sku-image');

const CDN = 'https://cdn.elimfilters.com';

test('accepts the canonical products/<SKU>/ layout for that exact SKU', () => {
  const u = `${CDN}/products/EL82100/approved/${'a'.repeat(64)}.png?v=${'a'.repeat(64)}`;
  assert.equal(imageUrlForSku(u, 'EL82100'), u);
  assert.equal(imageUrlForSku(u, 'el82100'), u, 'SKU comparison is case-insensitive');
  assert.equal(imageUrlForSku(`${CDN}/products/EL82100/manifest.json`, 'EL82100') !== null, true);
});

test('accepts legacy <SKU>.png and <SKU>-...-approved.png names for that exact SKU', () => {
  assert.ok(imageUrlForSku(`${CDN}/EL81807.png`, 'EL81807'));
  assert.ok(imageUrlForSku(`${CDN}/renders/EL81807-front-approved-opt.webp`, 'EL81807'));
  assert.ok(imageUrlForSku(`${CDN}/EL81807-approved.jpg`, 'EL81807'));
});

test('rejects an image that belongs to a different SKU', () => {
  assert.equal(imageUrlForSku(`${CDN}/products/EL82101/approved/x.png`, 'EL82100'), null);
  assert.equal(imageUrlForSku(`${CDN}/EL82101.png`, 'EL82100'), null);
  assert.equal(imageUrlForSku(`${CDN}/EL821000.png`, 'EL82100'), null, 'longer SKU sharing a prefix');
  assert.equal(imageUrlForSku(`${CDN}/EL8210.png`, 'EL82100'), null, 'shorter SKU');
  assert.equal(imageUrlForSku(`${CDN}/products/EL82100/../EL82101/x.png`, 'EL82100'), null, 'path traversal');
  assert.equal(imageUrlForSku(`${CDN}/products/EL82100`, 'EL82100'), null, 'folder only, no object');
});

test('rejects foreign origins, plain http, credentials, ports and malformed values', () => {
  for (const bad of [
    'http://cdn.elimfilters.com/EL82100.png',
    'https://evil.example/EL82100.png',
    'https://cdn.elimfilters.com.evil.example/EL82100.png',
    'https://user:pw@cdn.elimfilters.com/EL82100.png',
    'https://cdn.elimfilters.com:8443/EL82100.png',
    'javascript:alert(1)', '', null, undefined, 'not a url',
  ]) assert.equal(imageUrlForSku(bad, 'EL82100'), null, String(bad));
});

test('rejects invalid SKUs', () => {
  for (const sku of ['', null, undefined, '../x', 'EL 82100', 'EL82100/..']) {
    assert.equal(imageUrlForSku(`${CDN}/EL82100.png`, sku), null, String(sku));
  }
});
