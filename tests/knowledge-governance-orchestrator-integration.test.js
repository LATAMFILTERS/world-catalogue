'use strict';

// Verifies the light integration required by section 10: the orchestrator
// attaches knowledge_governance metadata to every response, never exposes a
// SKU the catalog didn't validate, and never breaks a legitimately validated
// one. Uses the same DB test seam as tests/bot-protocol-e2e.test.js.

const test = require('node:test');
const assert = require('node:assert/strict');

delete process.env.GROQ_API_KEY;
delete process.env.DATABASE_URL;
delete process.env.REDIS_URL;

const { runBotProtocol } = require('../lib/bot-conversation-orchestrator');
const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');

function normalizeRef(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const CATALOG_ROWS = [
  {
    id: 1, sku: 'EL82100', codigo_base: 'EL82100', name: 'Full-Flow Lube Oil Filter', filter_type: 'Oil Filter',
    oem_codes: [{ manufacturer: 'DONALDSON', code: 'P552100' }], competitor_codes: [], brand_crossrefs: {},
    equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true
  }
];

test.before(() => {
  __setProtocolPoolForTests({
    connect: async () => ({
      async query(sql, params = []) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
        if (/FROM elimfilters_catalog/i.test(text)) {
          const refs = (params[0] || []).map(normalizeRef);
          const rows = CATALOG_ROWS.filter(row =>
            refs.includes(normalizeRef(row.sku)) || (row.oem_codes || []).some(c => refs.includes(normalizeRef(c.code))));
          return { rows };
        }
        return { rows: [] };
      },
      release() {}
    })
  });
});

test.after(() => { __setProtocolPoolForTests(null); });

test('every response carries knowledge_governance metadata', async () => {
  const payload = await runBotProtocol({ message: 'Hola', conversation_id: `kg-int-${Date.now()}`, channel: 'whatsapp' });
  assert.ok(payload.knowledge_governance);
  assert.equal(typeof payload.knowledge_governance.safe_to_publish, 'boolean');
});

test('a validated catalog SKU survives governance untouched', async () => {
  const cid = `kg-int-sku-${Date.now()}`;
  await runBotProtocol({ message: 'Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', conversation_id: cid, channel: 'whatsapp' });
  await runBotProtocol({ message: 'Hace cuatro días.', conversation_id: cid, channel: 'whatsapp' });
  const result = await runBotProtocol({ message: 'Carretera. Tiene Donaldson P552100.', conversation_id: cid, channel: 'whatsapp' });

  assert.equal(result.knowledge_governance.sku_validated_in_postgresql, true);
  assert.match(result.answer, /EL82100/);
  assert.equal(result.knowledge_governance.authority_violation_count, 0);
});

test('a diagnostic reaching assessment without approved evidence registers a knowledge gap', async () => {
  const cid = `kg-int-gap-${Date.now()}`;
  await runBotProtocol({ message: 'Tengo un Mack MP8 2019 con pérdida de potencia', conversation_id: cid, channel: 'whatsapp' });
  await runBotProtocol({ message: 'Hace una semana', conversation_id: cid, channel: 'whatsapp' });
  const result = await runBotProtocol({ message: 'Carretera. No sé el filtro.', conversation_id: cid, channel: 'whatsapp' });

  assert.equal(result.phase, 'diagnostic_assessment');
  assert.equal(result.knowledge_governance.knowledge_gap_registered, true);
  assert.equal(result.knowledge_governance.technical_source_validated, false);
  assert.equal(result.knowledge_governance.safe_to_publish, true);
});
