'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

test('Part Search startup always loads runtime hardening before server', () => {
  const source = read('server-protocol.js');
  const hardening = source.indexOf("require('./lib/part-search-runtime-hardening')");
  const server = source.indexOf("require('./server')");
  assert.notEqual(hardening, -1, 'runtime hardening must be loaded');
  assert.notEqual(server, -1, 'server must be loaded');
  assert.ok(hardening < server, 'runtime hardening must load before server');
});

test('exact SKU and codigo_base lookup use the same normalization as production indexes', () => {
  const runtime = read('lib/part-search-runtime-hardening.js');
  const migration = read('scripts/migrations/run_066_add_bot_protocol_catalog_search_indexes.js');

  const normalizedSku = "upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g'))";
  const normalizedBase = "upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g'))";

  assert.ok(runtime.includes(normalizedSku), 'runtime SKU normalization drifted from migration 066');
  assert.ok(runtime.includes(normalizedBase), 'runtime codigo_base normalization drifted from migration 066');
  assert.ok(migration.includes(normalizedSku), 'migration 066 SKU index expression changed');
  assert.ok(migration.includes(normalizedBase), 'migration 066 codigo_base index expression changed');
});

test('P551313 class of lookups cannot regress to hyphen-only normalization', () => {
  const runtime = read('lib/part-search-runtime-hardening.js');

  assert.match(runtime, /\[\^A-Z0-9\]/, 'lookup normalization must remove all non-alphanumeric characters');
  assert.doesNotMatch(
    runtime,
    /UPPER\(REPLACE\(codigo_base,'-',''\)\)\s*=\s*\$1(?![\s\S]*REWRITES)/,
    'do not restore a hyphen-only direct codigo_base lookup'
  );
});

test('/api/search keeps production diagnostics for every request', () => {
  const runtime = read('lib/part-search-runtime-hardening.js');
  assert.ok(runtime.includes('[part-search-query]'), 'per-request Part Search diagnostic log was removed');
  assert.ok(runtime.includes('source=${source}'), 'diagnostic source must remain visible');
  assert.ok(runtime.includes('ms=${Date.now() - startedAt}'), 'diagnostic latency must remain visible');
});

test('/api/search remains independent of Redis cache', () => {
  const server = read('server-original.js');
  const start = server.indexOf("app.get('/api/search'");
  const end = server.indexOf("app.get('/api/search/vin'", start);
  assert.ok(start >= 0 && end > start, 'unable to locate /api/search route');
  const route = server.slice(start, end);

  assert.doesNotMatch(route, /cacheGet\s*\(/, '/api/search must not depend on cacheGet');
  assert.doesNotMatch(route, /cacheSet\s*\(/, '/api/search must not depend on cacheSet');
  assert.doesNotMatch(route, /_redis\b/, '/api/search must not depend directly on Redis');
});
