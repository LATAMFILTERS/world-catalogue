'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const e2e = fs.readFileSync(
  path.join(ROOT, 'scripts', 'e2e', 'run_vehicle_application_acceptance.js'),
  'utf8'
);

test('live acceptance E2E verifies PostgreSQL, resolver, cache, and bot', () => {
  for (const token of [
    'ld_catalog.ld_vehicle_applications',
    'public.v_api_resolver_v7',
    'public.crossref_resolved_cache',
    '/api/bot/protocol'
  ]) {
    assert.ok(e2e.includes(token), 'missing acceptance layer: ' + token);
  }
});

test('CL120 acceptance contract requires the complete validated seven-SKU set', () => {
  for (const sku of ['EL82100','EF90463','EF96916','EW74685','EA17682','EL82518','EC14226']) {
    assert.ok(e2e.includes(sku), 'missing CL120 SKU ' + sku);
  }
  assert.ok(e2e.includes("forbiddenSkus: ['EA31300','EL32102']"));
});

test('RAV4 acceptance rejects the stale fuel SKU', () => {
  assert.ok(e2e.includes("expectedSkus: ['EC31919','EL36006']"));
  assert.ok(e2e.includes("forbiddenSkus: ['EF34421']"));
});

test('Hyundai Sonata acceptance requires EL32811 and rejects EL36350', () => {
  assert.ok(e2e.includes("expectedSkus: ['EL32811']"));
  assert.ok(e2e.includes("forbiddenSkus: ['EL36350']"));
});

test('Prius 2ZRFXE acceptance requires EL34967 and rejects legacy identities', () => {
  assert.ok(e2e.includes("expectedSkus: ['EL34967']"));
  assert.ok(e2e.includes("forbiddenSkus: ['EL30683','EL50683']"));
});

test('acceptance E2E uses the real bot protocol route, not a response fixture', () => {
  assert.ok(e2e.includes('installBotProtocol(app)'));
  assert.ok(!e2e.includes('body.answer ='));
});
