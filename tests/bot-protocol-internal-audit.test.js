const test = require('node:test');
const assert = require('node:assert/strict');

const { processQuery, classifyIntent } = require('../lib/bot-protocol');
const { validateBody } = require('../lib/bot-protocol-security');
const { recommendationResponse } = require('../lib/bot-protocol-diagnostic-override');

test('continues application lookup when customer replies only with year', async () => {
  const context = {
    active_intent: 'application_lookup',
    pending_field: 'application_year',
    equipment_tokens: ['FREIGHTLINER', 'DD60'],
    history: ['Tengo un Freightliner con motor DD60 y necesito un filtro de aceite']
  };

  assert.equal(classifyIntent('2012', [], context.equipment_tokens, context), 'application_lookup');
});

test('first application request asks for year without querying catalog', async () => {
  const result = await processQuery('Tengo un Freightliner con motor DD60 y necesito saber qué filtro de aceite me recomiendas', {});
  assert.equal(result.intent, 'application_lookup');
  assert.equal(result.phase, 'collecting_application_data');
  assert.equal(result.diagnostic.missing_field, 'application_year');
  assert.equal(result.evidence.validated, false);
});

test('image endpoint body is valid without text message', () => {
  assert.equal(validateBody({
    image_data_url: 'data:image/jpeg;base64,AAAA',
    channel: 'whatsapp',
    context: { conversation_id: '123' }
  }, { image: true }), null);
});

test('text endpoint still requires a message', () => {
  assert.equal(validateBody({ channel: 'whatsapp' }), 'message_is_required');
});

test('recommendation override preserves catalog evidence', () => {
  const payload = {
    protocol_version: '1.2.1',
    intent: 'application_lookup',
    phase: 'catalog_resolution',
    evidence: { validated: true, count: 1, products: [{ sku: 'EF12345' }] },
    answer: 'Aplicación confirmada'
  };
  assert.deepEqual(recommendationResponse({}, payload), payload);
});
