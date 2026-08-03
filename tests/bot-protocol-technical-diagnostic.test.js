const test = require('node:test');
const assert = require('node:assert/strict');

const {
  extractFilterReferences,
  extractYear,
  needsTechnicalIdentification,
  currentMessageAnswersFilterQuestion
} = require('../lib/bot-protocol-installed-filter-step');

test('extracts P552100 without treating 2007 as a filter reference', () => {
  assert.deepEqual(extractFilterReferences('Es modelo 2007. El filtro es Donaldson P552100.'), ['P552100']);
  assert.equal(extractYear('Es modelo 2007. El filtro es Donaldson P552100.'), '2007');
});

test('requests year and installed filter after equipment and symptom are known', () => {
  const payload = {
    intent: 'diagnostic',
    entities: { equipment_tokens: ['FREIGHTLINER', 'DETROIT', 'SERIES', '60'], year: null },
    diagnostic: { equipment_tokens: ['FREIGHTLINER'], symptoms: ['pressure_loss'] }
  };
  assert.equal(needsTechnicalIdentification(payload, { context: {} }), true);
});

test('recognizes a response to the combined technical-identification question', () => {
  const body = {
    message: '2007, Donaldson P552100',
    context: { pending_field: 'technical_identification' }
  };
  assert.equal(currentMessageAnswersFilterQuestion(body), true);
});

test('does not request technical identification again when year and validated filter are present', () => {
  const payload = {
    intent: 'diagnostic',
    entities: { equipment_tokens: ['FREIGHTLINER'], year: '2007' },
    diagnostic: {
      equipment_tokens: ['FREIGHTLINER'],
      symptoms: ['pressure_loss'],
      current_filter_status: 'validated'
    }
  };
  assert.equal(needsTechnicalIdentification(payload, { context: {} }), false);
});
