'use strict';

// SEO product pages must show the image assigned to the SKU by lib/r2-catalog-image-sync.js
// (Cloudflare R2 / cdn.elimfilters.com) and ignore anything outside that origin.
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderProduct } = require('../lib/install-part-seo-pages');

const CDN = 'https://cdn.elimfilters.com/products/EL82100/approved/abc123.png';
const row = (extra = {}) => ({
  sku: 'EL82100', name: null, filter_type: 'lube', duty: 'HEAVY_DUTY',
  oem_codes: [], competitor_codes: [], brand_crossrefs: {},
  thread_size: '1 5/8-12 UN', height_mm: 260, outer_diameter_mm: 118,
  equipment_applications: [], vehicle_applications: [], ...extra,
});

function schemaOf(html) {
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  return JSON.parse(m[1]);
}

test('SEO product page shows the CDN image assigned to the SKU (img, og:image, JSON-LD)', () => {
  const html = renderProduct(row({ image_url: CDN }), 'en');
  assert.ok(html.includes(`<img class="photo" src="${CDN}"`), 'visible <img> in the hero');
  assert.ok(html.includes(`<meta property="og:image" content="${CDN}">`), 'og:image meta');
  assert.deepEqual(schemaOf(html).image, [CDN], 'Product JSON-LD image');
});

test('SEO product page without an assigned image has no image markup', () => {
  const html = renderProduct(row({ image_url: null }), 'en');
  assert.ok(!html.includes('class="photo"'));
  assert.ok(!html.includes('og:image'));
  assert.equal(schemaOf(html).image, undefined);
});

test('SEO product page ignores image URLs outside the ELIMFILTERS CDN origin', () => {
  for (const bad of ['http://cdn.elimfilters.com/a.png', 'https://evil.example/a.png', 'https://cdn.elimfilters.com.evil.example/a.png', 'javascript:alert(1)']) {
    const html = renderProduct(row({ image_url: bad }), 'en');
    assert.ok(!html.includes('class="photo"'), bad);
    assert.ok(!html.includes('og:image'), bad);
  }
});

test('image URL is HTML-escaped in attributes', () => {
  const html = renderProduct(row({ image_url: 'https://cdn.elimfilters.com/a.png?x="><script>1</script>' }), 'es');
  assert.ok(!html.includes('"><script>1</script>'));
});
