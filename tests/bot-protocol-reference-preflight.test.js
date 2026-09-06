'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { __setRedisClientForTests } = require('../lib/bot-protocol-memory');
const { preflightReferenceLookup } = require('../lib/bot-protocol-reference-preflight');

function normalize(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const CATALOG = [
  { id: 1, sku: 'EL82100', codigo_base: 'P552100', name: 'Lube Filter', filter_type: 'oil', competitor_codes: [], oem_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true },
  { id: 2, sku: 'EL82101', codigo_base: 'X2', name: 'Lube Filter 2', filter_type: 'oil', competitor_codes: [], oem_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true }
];

function installPool(resolverRows = [], { fail = false } = {}) {
  __setProtocolPoolForTests({
    async connect() {
      if (fail) throw new Error('database down');
      return {
        async query(sql, params = []) {
          const text = String(sql);
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
          if (/FROM v_api_resolver_v7/i.test(text)) {
            const refs = (params[0] || []).map(normalize);
            return { rows: resolverRows.filter(row => refs.includes(normalize(row.code))) };
          }
          if (/FROM elimfilters_catalog/i.test(text)) {
            const refs = (params[0] || []).map(normalize);
            return { rows: CATALOG.filter(row => refs.includes(normalize(row.sku))) };
          }
          return { rows: [] };
        },
        release() {}
      };
    }
  });
}

test.afterEach(() => {
  __setProtocolPoolForTests(null);
  __setRedisClientForTests(null);
});

test('P527692 NOT_FOUND is stopped before LLM', async () => {
  installPool([]);
  const payload = await preflightReferenceLookup({ channel: 'web', conversation_id: 'preflight-notfound', message: 'Donaldson P527692', language: 'es' });
  assert.ok(payload);
  assert.equal(payload.evidence.lookup_status, 'not_found');
  assert.equal(payload.evidence.validated, false);
  assert.equal(payload.evidence.source, 'v_api_resolver_v7');
  assert.equal(payload.governance.llm_bypassed, true);
});

test('database outage is stopped before LLM and is not mislabeled NOT_FOUND', async () => {
  installPool([], { fail: true });
  const payload = await preflightReferenceLookup({ channel: 'web', conversation_id: 'preflight-db-down', message: 'Busco equivalencia Donaldson P552100', language: 'es' });
  assert.equal(payload.evidence.lookup_status, 'database_unavailable');
  assert.equal(payload.governance.llm_bypassed, true);
});

test('multiple resolver SKU candidates are ambiguous and candidate SKUs are not published', async () => {
  installPool([
    { code: '331193', sku: 'EL82100', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' },
    { code: '331193', sku: 'EL82101', manufacturer: 'WIX', score: 900, status: 'RESOLVED_SINGLE' }
  ]);
  const payload = await preflightReferenceLookup({ channel: 'web', conversation_id: 'preflight-ambiguous', message: 'Equivalencia WIX 331193', language: 'es' });
  assert.equal(payload.evidence.lookup_status, 'ambiguous');
  assert.equal(payload.evidence.validated, false);
  assert.equal(payload.evidence.products.length, 0);
  assert.equal(payload.governance.llm_bypassed, true);
});

test('one resolver-authorized SKU is returned deterministically and bypasses LLM', async () => {
  installPool([
    { code: 'P552100', sku: 'EL82100', manufacturer: 'DONALDSON', score: 950, status: 'RESOLVED_CANONICAL_BASE' }
  ]);
  const payload = await preflightReferenceLookup({ channel: 'web', conversation_id: 'preflight-valid', message: 'Donaldson P552100', language: 'es' });
  assert.ok(payload);
  assert.equal(payload.evidence.lookup_status, 'validated');
  assert.equal(payload.evidence.validated, true);
  assert.equal(payload.evidence.products[0].sku, 'EL82100');
  assert.equal(payload.evidence.products[0].protocol_source_brand, 'DONALDSON');
  assert.equal(payload.governance.llm_bypassed, true);
});
