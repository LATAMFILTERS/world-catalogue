'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
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

function referenceParams(params = []) {
  const refs = [];
  for (const raw of params[0] || []) {
    if (typeof raw === 'string' && /^[\[{]/.test(raw.trim())) {
      try {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (!item || typeof item !== 'object') continue;
          for (const value of Object.values(item)) {
            if (typeof value === 'string' || typeof value === 'number') refs.push(normalize(value));
          }
        }
        continue;
      } catch {}
    }
    refs.push(normalize(raw));
  }
  return [...new Set(refs.filter(Boolean))];
}

const BASE_ROWS = [
  {
    id: 101,
    sku: 'EL82100',
    codigo_base: 'EL82100',
    name: 'Full-Flow Lube Oil Filter',
    description: null,
    filter_type: 'Oil Filter',
    sub_type: null,
    technology: 'SYNTRAX',
    thread_size: null,
    height_mm: null,
    outer_diameter_mm: null,
    gasket_od_mm: null,
    gasket_id_mm: null,
    micron_rating: null,
    nominal_efficiency: null,
    filter_media: null,
    oem_codes: [{ manufacturer: 'Donaldson', code: 'P552100' }],
    competitor_codes: [{ manufacturer: 'Fleetguard', code: 'LF3970' }],
    brand_crossrefs: { WIX: ['W51372'] },
    equipment_applications: [
      { make: 'Freightliner', model: 'Cascadia', engine: 'Detroit DD15' },
      { make: 'Kenworth', model: 'T680', engine: 'Cummins X15' },
      { make: 'Volvo', model: 'VNL', engine: 'D13' },
      { make: 'Mack', model: 'Anthem', engine: 'MP8' }
    ],
    specs: {}, enrichment_data: {}, is_primary: true
  }
];

let mode = 'normal';

function matchesRow(row, refs) {
  if (refs.includes(normalize(row.sku)) || refs.includes(normalize(row.codigo_base))) return true;
  if ((row.oem_codes || []).some(item => refs.includes(normalize(item.code)))) return true;
  if ((row.competitor_codes || []).some(item => refs.includes(normalize(item.code)))) return true;
  return Object.values(row.brand_crossrefs || {}).flatMap(value => Array.isArray(value) ? value : [value]).some(value => refs.includes(normalize(value)));
}

function poolForMode() {
  return {
    async connect() {
      if (mode === 'down') throw new Error('ECONNREFUSED: certification database outage');
      return {
        async query(sql, params = []) {
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(String(sql))) return { rows: [] };
          if (!/FROM elimfilters_catalog/i.test(String(sql))) return { rows: [] };
          const refs = referenceParams(params);
          if (mode === 'ambiguous' && refs.includes('AMB331193')) {
            return { rows: [
              { ...BASE_ROWS[0], sku: 'EL82100', competitor_codes: [{ manufacturer: 'WIX', code: 'AMB331193' }] },
              { ...BASE_ROWS[0], id: 102, sku: 'EL82101', competitor_codes: [{ manufacturer: 'WIX', code: 'AMB331193' }] }
            ] };
          }
          return { rows: BASE_ROWS.filter(row => matchesRow(row, refs)) };
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

test('Donaldson lookup uses Donaldson name, validated ELIMFILTERS SKU, no generic OEM, no inferred technology', async () => {
  const { status, body } = await send('Busco la equivalencia Donaldson P552100', `cert-donaldson-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.evidence.validated, true);
  assert.equal(body.evidence.products[0].sku, 'EL82100');
  assert.match(body.answer, /Donaldson P552100/i);
  assert.match(body.answer, /ELIMFILTERS EL82100/i);
  assert.doesNotMatch(body.answer, /\bOEM\b/i);
  assertNoInventedTechnicalClaims(body.answer);
});

test('Fleetguard lookup uses Fleetguard name and never OEM', async () => {
  const { body } = await send('Necesito cruce Fleetguard LF3970', `cert-fleetguard-${Date.now()}`);
  assert.equal(body.evidence.validated, true);
  assert.match(body.answer, /Fleetguard LF3970/i);
  assert.match(body.answer, /ELIMFILTERS EL82100/i);
  assert.doesNotMatch(body.answer, /\bOEM\b/i);
});

test('WIX lookup resolves keyed brand cross-reference and caps applications at three', async () => {
  const { body } = await send('Equivalencia WIX W51372', `cert-wix-${Date.now()}`);
  assert.equal(body.evidence.validated, true);
  assert.match(body.answer, /WIX W51372/i);
  assert.match(body.answer, /ELIMFILTERS EL82100/i);
  const applications = String(body.answer).split('Aplicaciones registradas:')[1] || '';
  if (applications) assert.ok(applications.split(';').length <= 3, `expected at most three applications, got: ${applications}`);
});

test('unknown reference P527692 is fail-closed and never receives a SKU or inferred claim', async () => {
  const { body } = await send('Donaldson P527692', `cert-notfound-${Date.now()}`);
  assert.equal(body.evidence.validated, false);
  assert.equal(body.evidence.lookup_status, 'not_found');
  assert.match(body.answer, /No encontr[eé] una coincidencia verificada/i);
  assert.doesNotMatch(body.answer, /\bE[A-Z]\d{4,7}\b/);
  assertNoInventedTechnicalClaims(body.answer);
});

test('mistyped reference is not silently corrected into another product', async () => {
  const { body } = await send('Donaldson P55210X', `cert-typo-${Date.now()}`);
  assert.equal(body.evidence.validated, false);
  assert.equal(body.evidence.lookup_status, 'not_found');
  assert.doesNotMatch(body.answer, /EL82100/);
  assert.match(body.answer, /Verifica el c[oó]digo impreso/i);
});

test('valid lookup followed by invalid lookup in same conversation never leaks previous SKU', async () => {
  const conversationId = `cert-valid-invalid-${Date.now()}`;
  const valid = await send('Donaldson P552100', conversationId);
  assert.equal(valid.body.evidence.validated, true);
  assert.match(valid.body.answer, /EL82100/);
  const invalid = await send('Ahora busca Donaldson P527692', conversationId);
  assert.equal(invalid.body.evidence.validated, false);
  assert.equal(invalid.body.evidence.lookup_status, 'not_found');
  assert.doesNotMatch(invalid.body.answer, /EL82100/);
});

test('invalid lookup followed by valid lookup in same conversation can recover without carrying NOT_FOUND state', async () => {
  const conversationId = `cert-invalid-valid-${Date.now()}`;
  const invalid = await send('Donaldson P527692', conversationId);
  assert.equal(invalid.body.evidence.validated, false);
  const valid = await send('Ahora busca Donaldson P552100', conversationId);
  assert.equal(valid.body.evidence.validated, true);
  assert.match(valid.body.answer, /Donaldson P552100/i);
  assert.match(valid.body.answer, /EL82100/);
});

test('multiple distinct SKU candidates become ambiguous and no candidate SKU is published', async () => {
  mode = 'ambiguous';
  __setProtocolPoolForTests(poolForMode());
  const { body } = await send('WIX AMB331193', `cert-ambiguous-${Date.now()}`);
  assert.equal(body.evidence.validated, false);
  assert.equal(body.evidence.lookup_status, 'ambiguous');
  assert.match(body.answer, /m[aá]s de una coincidencia/i);
  assert.doesNotMatch(body.answer, /EL82100|EL82101/);
});

test('database outage is reported as temporary verification failure, never as not-found and never invents SKU', async () => {
  mode = 'down';
  __setProtocolPoolForTests(poolForMode());
  const { status, body } = await send('Donaldson P552100', `cert-db-down-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.evidence.validated, false);
  assert.ok(['error', 'database_unavailable'].includes(body.evidence.lookup_status));
  assert.doesNotMatch(body.answer, /EL82100/);
  assert.doesNotMatch(body.answer, /No encontr[eé] una coincidencia verificada/i);
});
