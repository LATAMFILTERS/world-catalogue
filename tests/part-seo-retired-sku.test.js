'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { installPartSeoPages } = require('../lib/install-part-seo-pages');

function setup() {
  const handlers = new Map();
  const app = {
    get(paths, handler) {
      for (const path of Array.isArray(paths) ? paths : [paths]) {
        handlers.set(path, handler);
      }
    },
  };
  const calls = [];
  const pool = {
    async query(sql, params) {
      calls.push({ sql, params });
      if (/SELECT 1 FROM elimfilters_catalog/.test(sql)) return { rows: [], rowCount: 0 };
      if (/SELECT sku FROM elimfilters_catalog/.test(sql)) return { rows: [{ sku: 'EF92564' }] };
      throw new Error('Inactive SKU unexpectedly reached product lookup');
    },
  };
  installPartSeoPages(app, pool);
  return { handlers, calls };
}

function response() {
  const headers = {};
  return {
    headers,
    statusCode: 200,
    content: null,
    setHeader(name, value) { headers[name.toLowerCase()] = value; return this; },
    set(name, value) { return this.setHeader(name, value); },
    status(value) { this.statusCode = value; return this; },
    type(value) { this.setHeader('content-type', value); return this; },
    send(value) { this.content = value; return this; },
  };
}

for (const [route, language] of [
  ['/part/:code/', 'en'],
  ['/es/part/:code/', 'es'],
  ['/pt/part/:code/', 'pt'],
]) {
  test(`retired EF39531 returns 404 on ${language} product page without cached lookup`, async () => {
    const { handlers, calls } = setup();
    const handler = handlers.get(route);
    assert.equal(typeof handler, 'function');
    const res = response();
    await handler({
      params: { code: 'EF39531' },
      get(name) { return name === 'host' ? 'part-search.elimfilters.com' : ''; },
      hostname: 'part-search.elimfilters.com',
    }, res, () => assert.fail('Unexpected next()'));

    assert.equal(res.statusCode, 404);
    assert.match(res.headers['x-robots-tag'], /noindex/);
    assert.equal(res.headers['cache-control'], 'no-store');
    assert.match(res.content, /Part not found/);
    assert.equal(calls.length, 1);
    assert.match(calls[0].sql, /catalog_active IS TRUE/);
    assert.deepEqual(calls[0].params, ['EF39531']);
  });
}

test('sitemap SQL excludes retired and unverified records', async () => {
  const { handlers, calls } = setup();
  const res = response();
  await handlers.get('/sitemap.xml')({
    get(name) { return name === 'host' ? 'part-search.elimfilters.com' : ''; },
    hostname: 'part-search.elimfilters.com',
  }, res, () => assert.fail('Unexpected next()'));

  assert.equal(res.statusCode, 200);
  assert.match(calls[0].sql, /catalog_active IS TRUE/);
  assert.match(calls[0].sql, /canonical_source_status = 'VERIFIED'/);
  assert.match(res.content, /EF92564/);
  assert.doesNotMatch(res.content, /EF39531/);
});
