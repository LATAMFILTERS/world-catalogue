'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { __setRedisClientForTests } = require('../lib/bot-protocol-memory');

const ORIGINAL_ENV = { ...process.env };
process.env.NODE_ENV = 'test';
delete process.env.GROQ_API_KEY;
delete process.env.REDIS_URL;
delete process.env.DATABASE_URL;
delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
delete process.env.ENGINE_API_KEY;

const { registerWebChatProtocolAdapter } = require('../lib/bot-protocol-web-adapter');

function normalize(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const ROW = {
  id: 201, sku: 'EL82100', codigo_base: 'P552100', name: 'Full-Flow Lube Oil Filter', description: null,
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

let dbMode = 'normal';

function resolverRows(refs) {
  if (refs.includes('331193')) {
    return [
      { code: '331193', sku: 'EL82100', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' },
      { code: '331193', sku: 'EL82101', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' }
    ];
  }
  const map = {
    P552100: { code: 'P552100', sku: 'EL82100', manufacturer: 'DONALDSON', score: 950, status: 'RESOLVED_CANONICAL_BASE' },
    LF3970: { code: 'LF3970', sku: 'EL82100', manufacturer: 'FLEETGUARD', score: 900, status: 'RESOLVED_SINGLE' }
  };
  return refs.map(ref => map[ref]).filter(Boolean);
}

function pool() {
  return {
    async connect() {
      if (dbMode === 'down') throw new Error('ECONNREFUSED: web certification database outage');
      return {
        async query(sql, params = []) {
          const text = String(sql);
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
          if (/FROM v_api_resolver_v7/i.test(text)) {
            return { rows: resolverRows((params[0] || []).map(normalize)) };
          }
          if (/FROM elimfilters_catalog/i.test(text)) {
            const refs = (params[0] || []).map(normalize);
            if (refs.includes('EL82100')) return { rows: [ROW] };
            if (refs.includes('EL82101')) return { rows: [{ ...ROW, id: 202, sku: 'EL82101', codigo_base: 'X2' }] };
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

async function chat(message, sessionId) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://elimfilters.com' },
    body: JSON.stringify({ message, sessionId, lang: 'es' })
  });
  return { status: response.status, body: await response.json(), allowOrigin: response.headers.get('access-control-allow-origin') };
}

test.before(async () => {
  __setProtocolPoolForTests(pool());
  __setRedisClientForTests(null);
  const app = express();
  registerWebChatProtocolAdapter(app);
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
  dbMode = 'normal';
  __setProtocolPoolForTests(pool());
});

test('web chat uses resolver authority for Donaldson and bypasses LLM', async () => {
  const { status, body, allowOrigin } = await chat('Busco equivalencia Donaldson P552100', `web-don-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(allowOrigin, 'https://elimfilters.com');
  assert.equal(body.lookup_status, 'validated');
  assert.equal(body.reference_preflight, true);
  assert.equal(body.llm_bypassed, true);
  assert.equal(body.source_brand, 'Donaldson');
  assert.match(body.reply, /Donaldson P552100/i);
  assert.match(body.reply, /(?:ELIMFILTERS\s+EL82100|SKU\s+ELIMFILTERS:\s*EL82100)/i);
  assert.doesNotMatch(body.reply, /\bOEM\b|SYNTRAX|NANOFORCE|SYNTAPORE/i);
});

test('web chat P527692 is fail closed and never publishes a SKU', async () => {
  const { status, body } = await chat('Donaldson P527692', `web-notfound-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.lookup_status, 'not_found');
  assert.equal(body.reference_preflight, true);
  assert.equal(body.llm_bypassed, true);
  assert.match(body.reply, /No encontr[eé] una coincidencia verificada/i);
  assert.doesNotMatch(body.reply, /\bE[A-Z]\d{4,7}\b/);
});

test('web chat typo remains NOT_FOUND', async () => {
  const { body } = await chat('Donaldson P55210X', `web-typo-${Date.now()}`);
  assert.equal(body.lookup_status, 'not_found');
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100/);
});

test('web chat ambiguous resolver result blocks candidate SKUs', async () => {
  dbMode = 'ambiguous';
  __setProtocolPoolForTests(pool());
  const { body } = await chat('Equivalencia WIX 331193', `web-amb-${Date.now()}`);
  assert.equal(body.lookup_status, 'ambiguous');
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100|EL82101/);
});

test('web chat database outage is not mislabeled NOT_FOUND', async () => {
  dbMode = 'down';
  __setProtocolPoolForTests(pool());
  const { status, body } = await chat('Donaldson P552100', `web-db-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.lookup_status, 'database_unavailable');
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100/);
});

test('web chat valid then invalid never leaks prior SKU', async () => {
  const sessionId = `web-state-${Date.now()}`;
  const first = await chat('Donaldson P552100', sessionId);
  assert.match(first.body.reply, /EL82100/);
  const second = await chat('Ahora busca Donaldson P527692', sessionId);
  assert.equal(second.body.lookup_status, 'not_found');
  assert.doesNotMatch(second.body.reply, /EL82100/);
});
