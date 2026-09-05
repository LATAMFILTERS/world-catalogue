'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { __setRedisClientForTests } = require('../lib/bot-protocol-memory');
const { preflightReferenceLookup } = require('../lib/bot-protocol-reference-preflight');

function normalize(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function installPool(rows = [], { fail = false } = {}) {
  __setProtocolPoolForTests({
    async connect() {
      if (fail) throw new Error('database down');
      return {
        async query(sql, params = []) {
          if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(String(sql))) return { rows: [] };
          if (!/FROM elimfilters_catalog/i.test(String(sql))) return { rows: [] };
          const refs = (params[0] || []).map(normalize);
          return {
            rows: rows.filter(row => {
              const values = [row.sku, row.codigo_base]
                .concat((row.oem_codes || []).map(v => v.code || v.reference || v))
                .concat((row.competitor_codes || []).map(v => v.code || v.reference || v));
              return values.some(value => refs.includes(normalize(value)));
            })
          };
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

test('NOT_FOUND direct reference lookup is stopped before LLM', async () => {
  installPool([]);
  const payload = await preflightReferenceLookup({
    channel: 'web',
    conversation_id: 'preflight-notfound',
    message: 'Donaldson P527692',
    language: 'es'
  });
  assert.ok(payload);
  assert.equal(payload.evidence.lookup_status, 'not_found');
  assert.equal(payload.evidence.validated, false);
  assert.equal(payload.governance.llm_bypassed, true);
  assert.equal(payload.intelligence.classifier, 'deterministic_reference_preflight');
});

test('database outage is stopped before LLM and is not mislabeled NOT_FOUND', async () => {
  installPool([], { fail: true });
  const payload = await preflightReferenceLookup({
    channel: 'web',
    conversation_id: 'preflight-db-down',
    message: 'Busco equivalencia Donaldson P552100',
    language: 'es'
  });
  assert.ok(payload);
  assert.equal(payload.evidence.lookup_status, 'database_unavailable');
  assert.equal(payload.governance.llm_bypassed, true);
});

test('multiple SKU candidates are stopped as ambiguous before LLM', async () => {
  installPool([
    {
      id: 1,
      sku: 'EL80001',
      codigo_base: 'A1',
      competitor_codes: [{ manufacturer: 'WIX', code: '331193' }],
      oem_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}
    },
    {
      id: 2,
      sku: 'EL80002',
      codigo_base: 'A2',
      competitor_codes: [{ manufacturer: 'WIX', code: '331193' }],
      oem_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}
    }
  ]);
  const payload = await preflightReferenceLookup({
    channel: 'web',
    conversation_id: 'preflight-ambiguous',
    message: 'Equivalencia WIX 331193',
    language: 'es'
  });
  assert.ok(payload);
  assert.equal(payload.evidence.lookup_status, 'ambiguous');
  assert.equal(payload.evidence.validated, false);
  assert.equal(payload.governance.llm_bypassed, true);
});

test('one validated SKU does not block the normal deterministic catalog renderer', async () => {
  installPool([
    {
      id: 3,
      sku: 'EL82100',
      codigo_base: 'EL82100',
      competitor_codes: [{ manufacturer: 'Fleetguard', code: 'LF3970' }],
      oem_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}
    }
  ]);
  const payload = await preflightReferenceLookup({
    channel: 'web',
    conversation_id: 'preflight-valid',
    message: 'Fleetguard LF3970',
    language: 'es'
  });
  assert.equal(payload, null);
});
