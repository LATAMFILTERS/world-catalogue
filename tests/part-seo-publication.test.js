'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderProduct, installPartSeoPages } = require('../lib/install-part-seo-pages');

function row(overrides = {}) {
  return {
    sku: 'EF99999', name: 'Test Filter', filter_type: 'fuel',
    duty: 'HEAVY_DUTY', catalog_active: true,
    canonical_source_status: 'VERIFIED', oem_codes: [],
    competitor_codes: [], brand_crossrefs: [],
    equipment_applications: [], vehicle_applications: [],
    ...overrides,
  };
}

test('unpublished SKU is noindex in HTML, not merely HTTP headers', () => {
  const html = renderProduct(row({ canonical_source_status: 'UNVERIFIED' }));
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
});

test('indexed SKU structured data identifies the same canonical URL as HTML', () => {
  const html = renderProduct(row());
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const jsonStart = html.indexOf('<script type="application/ld+json">') + '<script type="application/ld+json">'.length;
  const jsonEnd = html.indexOf('</script>', jsonStart);
  const json = JSON.parse(html.slice(jsonStart, jsonEnd));
  assert.equal(json.url, canonical);
  assert.equal(json['@id'], canonical + '#product');
});

test('verified SKU sitemap excludes unverified and inactive rows by query', async () => {
  const routes = new Map();
  const app = { get(path, handler) { if (typeof path === 'string') routes.set(path, handler); } };
  const pool = {
    async query(sql) {
      assert.match(sql, /catalog_active IS TRUE/);
      assert.match(sql, /canonical_source_status = 'VERIFIED'/);
      return { rows: [{ sku: 'EF99999' }] };
    },
  };
  installPartSeoPages(app, pool);
  const headers = {};
  const res = {
    setHeader(key, value) { headers[key] = value; return this; },
    type() { return this; },
    send(body) { this.body = body; return this; },
  };
  const req = { get() { return 'part-search.elimfilters.com'; } };
  await routes.get('/sitemap.xml')(req, res, () => {});
  assert.ok(res.body.includes('/part/EF99999/'));
  assert.ok(!res.body.includes('/part/OTHER_SKU/'));
});
