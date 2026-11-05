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

test('accepts the real production file names, including copy suffixes', () => {
  assert.ok(imageUrlForSku(`${CDN}/fleetguard/page-1/01-20/EA10014.png`, 'EA10014'));
  assert.ok(imageUrlForSku(`${CDN}/fleetguard/page-1/01-20/EF90440%20(2).png`, 'EF90440'), 'EF90440 (2).png');
  assert.ok(imageUrlForSku(`${CDN}/renders/EL82100_v2.webp`, 'EL82100'));
});

test('rejects an image that belongs to a different SKU', () => {
  assert.equal(imageUrlForSku(`${CDN}/products/EL82101/approved/x.png`, 'EL82100'), null);
  assert.equal(imageUrlForSku(`${CDN}/EL82101.png`, 'EL82100'), null);
  assert.equal(imageUrlForSku(`${CDN}/EL821000.png`, 'EL82100'), null, 'longer SKU sharing a prefix');
  assert.equal(imageUrlForSku(`${CDN}/EL8210.png`, 'EL82100'), null, 'shorter SKU');
  assert.equal(imageUrlForSku(`${CDN}/EL82100X.png`, 'EL82100'), null, 'letter glued to the SKU');
  assert.equal(imageUrlForSku(`${CDN}/XEL82100.png`, 'EL82100'), null, 'SKU not at the start of the name');
  assert.equal(imageUrlForSku(`${CDN}/EL82100.txt`, 'EL82100'), null, 'not an image extension');
  assert.equal(imageUrlForSku(`${CDN}/fleetguard/EF90440 (2).png`, 'EF90441'), null, 'copy suffix of another SKU');
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

test('ET90010 accepts only its exact pre-existing R2 public image URL', () => {
  const url = 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/ET90010.png';
  assert.equal(imageUrlForSku(url, 'ET90010'), url);
  assert.equal(imageUrlForSku(url, 'ET90011'), null);
  assert.equal(imageUrlForSku(url + '?redirect=other', 'ET90010'), null);
  assert.equal(imageUrlForSku(url.replace('ET90010.png', 'ET90011.png'), 'ET90010'), null);
});

test('accepts suffix-letter product images without sharing another SKU identity', () => {
  const url = `${CDN}/fleetguard/page-1/01-20/ET92020P.png`;
  assert.equal(imageUrlForSku(url, 'ET92020P'), url);
  assert.equal(imageUrlForSku(url, 'ET92020S'), null);
  assert.equal(imageUrlForSku(url, 'ET92020'), null);
  assert.equal(imageUrlForSku(`${CDN}/fleetguard/page-1/01-20/ET92020PX.png`, 'ET92020P'), null);
});
