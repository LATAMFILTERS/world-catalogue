const test = require('node:test');
const assert = require('node:assert/strict');

const {
  currentMessageAnswersFilterQuestion,
  extractFilterReferences,
  customerDoesNotKnow
} = require('../lib/bot-protocol-installed-filter-step');
const { memoryFromResponse, resetDiagnosticMemory } = require('../lib/bot-protocol-memory');

test('uses structured pending field instead of response-text matching', () => {
  assert.equal(currentMessageAnswersFilterQuestion({
    message: 'Donaldson P552100',
    context: { pending_field: 'current_filter', history: [] }
  }), true);
});

test('extracts and normalizes multiple filter references', () => {
  assert.deepEqual(
    extractFilterReferences('Donaldson P55-2100 y Baldwin B495'),
    ['P552100', 'B495']
  );
});

test('recognizes customer without installed-filter information', () => {
  assert.equal(customerDoesNotKnow('No tengo el código'), true);
});

test('persists the next diagnostic field in memory', () => {
  const next = memoryFromResponse(
    { history: [], active_intent: 'diagnostic' },
    { message: 'En carretera' },
    {
      answer: '¿Qué filtro está usando actualmente?',
      intent: 'diagnostic',
      diagnostic: {
        missing_field: 'current_filter',
        current_filter_status: 'pending',
        complete: false
      }
    }
  );

  assert.equal(next.pending_field, 'current_filter');
  assert.equal(next.current_filter_status, 'pending');
});

test('new diagnostic clears all prior filter state', () => {
  const reset = resetDiagnosticMemory({
    active_intent: 'diagnostic',
    pending_field: 'current_filter',
    current_filter: 'P552100',
    current_filter_references: ['P552100'],
    current_filter_status: 'validated'
  });

  assert.equal(reset.pending_field, null);
  assert.equal(reset.current_filter, null);
  assert.deepEqual(reset.current_filter_references, []);
  assert.equal(reset.current_filter_status, null);
});
