'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderProduct, installPartSeoPages, INDEXNOW_KEY } = require('../lib/install-part-seo-pages');

function row(overrides = {}) {
  return {
    sku: 'EF99999', name: 'Test Filter', filter_type: 'fuel',
    duty: 'HEAVY_DUTY', catalog_active: true,
    canonical_source_status: 'VERIFIED', certification_state: 'CERTIFIED', oem_codes: [],
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

test('non-certified SKU is noindex even when active and VERIFIED', () => {
  const html = renderProduct(row({ certification_state: 'BLOCKED' }));
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
});

test('es/pt pages are noindex and publish no hreflang cluster; en is indexable', () => {
  for (const lang of ['es', 'pt']) {
    const html = renderProduct(row(), lang);
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.ok(!html.includes('hreflang="x-default"'));
    assert.ok(!/<link rel="alternate" hreflang/.test(html));
  }
  const en = renderProduct(row());
  assert.match(en, /<meta name="robots" content="index,follow,/);
  assert.ok(!/<link rel="alternate" hreflang/.test(en));
});

test('en title and description are unique per SKU (technology + dimensions)', () => {
  const a = renderProduct(row({ technology: 'SYNTRAX', height_mm: '178', outer_diameter_mm: '93' }));
  const b = renderProduct(row({ sku: 'EF88888', technology: 'FUELTRAX', height_mm: '120', outer_diameter_mm: '80' }));
  const d = (h) => h.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.notEqual(d(a), d(b));
  assert.match(a, /<title>EF99999 Fuel Filter - SYNTRAX \| ELIMFILTERS<\/title>/);
  assert.match(d(a), /178 x 93 mm/);
});

test('verified SKU sitemap is English-only, certified-only, with lastmod', async () => {
  const routes = new Map();
  const app = { get(path, handler) { if (typeof path === 'string') routes.set(path, handler); } };
  const pool = {
    async query(sql) {
      assert.match(sql, /catalog_active IS TRUE/);
      assert.match(sql, /canonical_source_status = 'VERIFIED'/);
      assert.match(sql, /certification_state = 'CERTIFIED'/);
      return { rows: [{ sku: 'EF99999', certified_at: '2026-11-14T10:00:00Z' }] };
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
  assert.ok(res.body.includes('<lastmod>2026-11-14T10:00:00.000Z</lastmod>'));
  assert.ok(!res.body.includes('/part/OTHER_SKU/'));
  assert.ok(!res.body.includes('/es/') && !res.body.includes('/pt/') && !res.body.includes('hreflang'));
});

test('IndexNow key file is served on the part host', async () => {
  const routes = new Map();
  const app = { get(path, handler) { if (typeof path === 'string') routes.set(path, handler); } };
  installPartSeoPages(app, { async query() { return { rows: [] }; } });
  const res = { type() { return this; }, send(body) { this.body = body; return this; } };
  routes.get(`/${INDEXNOW_KEY}.txt`)({ get() { return 'part-search.elimfilters.com'; } }, res, () => {});
  assert.equal(res.body, INDEXNOW_KEY);
});
