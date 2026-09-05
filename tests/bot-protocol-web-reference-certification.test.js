'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
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

const ROW = {
  id: 201,
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
};

let dbMode = 'normal';

function matches(row, refs) {
  if (refs.includes(normalize(row.sku)) || refs.includes(normalize(row.codigo_base))) return true;
  if ((row.oem_codes || []).some(x => refs.includes(normalize(x.code)))) return true;
  if ((row.competitor_codes || []).some(x => refs.includes(normalize(x.code)))) return true;
  return Object.values(row.brand_crossrefs || {}).flatMap(v => Array.isArray(v) ? v : [v]).some(v => refs.includes(normalize(v)));
}

function pool() {
  return {
    async connect() {
      if (dbMode === 'down') throw new Error('ECONNREFUSED: web certification database outage');
      return {
        async query(sql, params = []) {
          const text = String(sql);
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
          if (!/FROM elimfilters_catalog/i.test(text)) return { rows: [] };
          const refs = referenceParams(params);
          if (dbMode === 'ambiguous' && refs.includes('331193')) {
            return { rows: [
              { ...ROW, id: 202, sku: 'EL82100', competitor_codes: [{ manufacturer: 'WIX', code: '331193' }] },
              { ...ROW, id: 203, sku: 'EL82101', competitor_codes: [{ manufacturer: 'WIX', code: '331193' }] }
            ] };
          }
          return { rows: matches(ROW, refs) ? [ROW] : [] };
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

test('web chat validates Donaldson reference and returns branded deterministic answer', async () => {
  const { status, body, allowOrigin } = await chat('Busco equivalencia Donaldson P552100', `web-don-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(allowOrigin, 'https://elimfilters.com');
  assert.equal(body.source, 'central_protocol');
  assert.equal(body.lookup_status, 'validated');
  assert.match(body.reply, /Donaldson P552100/i);
  assert.match(body.reply, /ELIMFILTERS EL82100/i);
  assert.doesNotMatch(body.reply, /\bOEM\b/i);
  assert.doesNotMatch(body.reply, /SYNTRAX|NANOFORCE|SYNTAPORE/i);
});

test('web chat P527692 is fail closed before LLM and never publishes a SKU', async () => {
  const { status, body } = await chat('Donaldson P527692', `web-notfound-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.lookup_status, 'not_found');
  assert.equal(body.reference_preflight, true);
  assert.equal(body.llm_bypassed, true);
  assert.match(body.reply, /No encontr[eé] una coincidencia verificada/i);
  assert.doesNotMatch(body.reply, /\bE[A-Z]\d{4,7}\b/);
});

test('web chat typo stays NOT_FOUND and is never silently corrected', async () => {
  const { body } = await chat('Donaldson P55210X', `web-typo-${Date.now()}`);
  assert.equal(body.lookup_status, 'not_found');
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100/);
  assert.match(body.reply, /Verifica el c[oó]digo impreso/i);
});

test('web chat ambiguous reference blocks all candidate SKUs', async () => {
  dbMode = 'ambiguous';
  __setProtocolPoolForTests(pool());
  const { body } = await chat('Equivalencia WIX 331193', `web-amb-${Date.now()}`);
  assert.equal(body.lookup_status, 'ambiguous');
  assert.equal(body.reference_preflight, true);
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100|EL82101/);
  assert.match(body.reply, /m[aá]s de una coincidencia/i);
});

test('web chat database outage is not mislabeled as missing reference and publishes no SKU', async () => {
  dbMode = 'down';
  __setProtocolPoolForTests(pool());
  const { status, body } = await chat('Donaldson P552100', `web-db-${Date.now()}`);
  assert.equal(status, 200);
  assert.equal(body.lookup_status, 'database_unavailable');
  assert.equal(body.reference_preflight, true);
  assert.equal(body.llm_bypassed, true);
  assert.doesNotMatch(body.reply, /EL82100/);
  assert.doesNotMatch(body.reply, /No encontr[eé] una coincidencia verificada/i);
});

test('web chat valid then invalid in same session never leaks previous SKU', async () => {
  const sessionId = `web-state-${Date.now()}`;
  const first = await chat('Donaldson P552100', sessionId);
  assert.match(first.body.reply, /EL82100/);
  const second = await chat('Ahora busca Donaldson P527692', sessionId);
  assert.equal(second.body.lookup_status, 'not_found');
  assert.equal(second.body.llm_bypassed, true);
  assert.doesNotMatch(second.body.reply, /EL82100/);
});
