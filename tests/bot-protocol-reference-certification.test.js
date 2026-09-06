'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { __setRedisClientForTests } = require('../lib/bot-protocol-memory');

const ORIGINAL_ENV = { ...process.env };
process.env.BOT_PROTOCOL_API_KEY = 'cert-key';
process.env.NODE_ENV = 'test';
delete process.env.GROQ_API_KEY;
delete process.env.REDIS_URL;
delete process.env.DATABASE_URL;
delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
delete process.env.ENGINE_API_KEY;

const { installBotProtocol } = require('../lib/install-bot-protocol');

function normalize(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const ROW = {
  id: 101, sku: 'EL82100', codigo_base: 'P552100', name: 'Full-Flow Lube Oil Filter', description: null,
  duty: null, filter_type: 'Oil Filter', sub_type: null, technology: 'SYNTRAX', thread_size: null,
  height_mm: null, outer_diameter_mm: null, gasket_od_mm: null, gasket_id_mm: null,
  micron_rating: null, nominal_efficiency: null, filter_media: null,
  oem_codes: [], competitor_codes: [], brand_crossrefs: {},
  equipment_applications: [
    { equipment: 'Freightliner Cascadia', engine: 'Detroit DD15' },
    { equipment: 'Kenworth T680', engine: 'Cummins X15' },
    { equipment: 'Volvo VNL', engine: 'D13' },
    { equipment: 'Mack Anthem', engine: 'MP8' }
  ],
  specs: {}, enrichment_data: {}, is_primary: true
};

let mode = 'normal';

function resolverRows(refs) {
  if (mode === 'ambiguous' && refs.includes('AMB331193')) {
    return [
      { code: 'AMB331193', sku: 'EL82100', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' },
      { code: 'AMB331193', sku: 'EL82101', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' }
    ];
  }
  const map = {
    P552100: { code: 'P552100', sku: 'EL82100', manufacturer: 'DONALDSON', score: 950, status: 'RESOLVED_CANONICAL_BASE' },
    LF3970: { code: 'LF3970', sku: 'EL82100', manufacturer: 'FLEETGUARD', score: 900, status: 'RESOLVED_SINGLE' },
    W51372: { code: 'W51372', sku: 'EL82100', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' }
  };
  return refs.map(ref => map[ref]).filter(Boolean);
}

function poolForMode() {
  return {
    async connect() {
      if (mode === 'down') throw new Error('ECONNREFUSED: certification database outage');
      return {
        async query(sql, params = []) {
          const text = String(sql);
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
          if (/FROM v_api_resolver_v7/i.test(text)) {
            const refs = (params[0] || []).map(normalize);
            return { rows: resolverRows(refs) };
          }
          if (/FROM elimfilters_catalog/i.test(text)) {
            const refs = (params[0] || []).map(normalize);
            if (refs.includes('EL82100')) return { rows: [ROW] };
            if (refs.includes('EL82101')) return { rows: [{ ...ROW, id: 102, sku: 'EL82101', codigo_base: 'X2' }] };
            return { rows: [] };
          }
          return { rows: [] };
        },
        release() {}
      };
    }
  };
}

let server;
let baseUrl;

async function send(message, conversationId) {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bot-protocol-key': 'cert-key' },
    body: JSON.stringify({ message, conversation_id: conversationId, channel: 'web', language: 'es' })
  });
  return { status: response.status, body: await response.json() };
}

function assertNoInventedTechnicalClaims(answer) {
  assert.doesNotMatch(answer, /\b(?:micra|micron|beta\s*\d+|99(?:\.\d+)?%|SYNTRAX|NANOFORCE|SYNTAPORE)\b/i);
}

test.before(async () => {
  __setProtocolPoolForTests(poolForMode());
  __setRedisClientForTests(null);
  const app = express();
  installBotProtocol(app);
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  __setProtocolPoolForTests(null);
  __setRedisClientForTests(null);
  Object.keys(process.env).forEach(key => { if (!(key in ORIGINAL_ENV)) delete process.env[key]; });
  Object.assign(process.env, ORIGINAL_ENV);
  await new Promise(resolve => server.close(resolve));
});

test.beforeEach(() => {
  mode = 'normal';
  __setProtocolPoolForTests(poolForMode());
});

test('Donaldson resolver match returns validated ELIMFILTERS SKU without generic OEM or inferred technology', async () => {
  const { status, body } = await send('Busco la equivalencia Donaldson P552100', `cert-donaldson-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.evidence.lookup_status, 'validated');
  assert.equal(body.evidence.validated, true);
  assert.equal(body.evidence.products[0].sku, 'EL82100');
  assert.match(body.answer, /Donaldson P552100/i);
  assert.match(body.answer, /ELIMFILTERS EL82100/i);
  assert.doesNotMatch(body.answer, /\bOEM\b/i);
  assertNoInventedTechnicalClaims(body.answer);
});

test('Fleetguard and WIX use resolver manufacturer provenance', async () => {
  const fleetguard = await send('Necesito cruce Fleetguard LF3970', `cert-fg-${Date.now()}`);
  assert.equal(fleetguard.body.evidence.validated, true);
  assert.match(fleetguard.body.answer, /Fleetguard LF3970/i);
  const wix = await send('Equivalencia WIX W51372', `cert-wix-${Date.now()}`);
  assert.equal(wix.body.evidence.validated, true);
  assert.match(wix.body.answer, /WIX W51372/i);
  const applications = String(wix.body.answer).split('Aplicaciones registradas:')[1] || '';
  if (applications) assert.ok(applications.split(';').length <= 3);
});

test('P527692 is NOT_FOUND and never receives a SKU or technical claim', async () => {
  const { body } = await send('Donaldson P527692', `cert-notfound-${Date.now()}`);
  assert.equal(body.evidence.lookup_status, 'not_found');
  assert.equal(body.evidence.validated, false);
  assert.doesNotMatch(body.answer, /\bE[A-Z]\d{4,7}\b/);
  assertNoInventedTechnicalClaims(body.answer);
});

test('mistyped reference is never silently corrected', async () => {
  const { body } = await send('Donaldson P55210X', `cert-typo-${Date.now()}`);
  assert.equal(body.evidence.lookup_status, 'not_found');
  assert.doesNotMatch(body.answer, /EL82100/);
});

test('valid then invalid in same conversation never leaks previous SKU', async () => {
  const conversationId = `cert-state-${Date.now()}`;
  const valid = await send('Donaldson P552100', conversationId);
  assert.match(valid.body.answer, /EL82100/);
  const invalid = await send('Ahora busca Donaldson P527692', conversationId);
  assert.equal(invalid.body.evidence.lookup_status, 'not_found');
  assert.doesNotMatch(invalid.body.answer, /EL82100/);
});

test('multiple resolver candidates are ambiguous and candidate SKUs remain hidden', async () => {
  mode = 'ambiguous';
  __setProtocolPoolForTests(poolForMode());
  const { body } = await send('WIX AMB331193', `cert-amb-${Date.now()}`);
  assert.equal(body.evidence.lookup_status, 'ambiguous');
  assert.equal(body.evidence.validated, false);
  assert.match(body.answer, /m[aá]s de una coincidencia/i);
  assert.doesNotMatch(body.answer, /EL82100|EL82101/);
});

test('database outage never becomes NOT_FOUND and never publishes a SKU', async () => {
  mode = 'down';
  __setProtocolPoolForTests(poolForMode());
  const { status, body } = await send('Donaldson P552100', `cert-db-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.evidence.lookup_status, 'database_unavailable');
  assert.equal(body.evidence.validated, false);
  assert.doesNotMatch(body.answer, /EL82100/);
  assert.doesNotMatch(body.answer, /No encontr[eé] una coincidencia verificada/i);
});
