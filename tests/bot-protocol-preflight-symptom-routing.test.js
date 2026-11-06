'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createEmptyState } = require('../lib/bot-protocol-memory');
const { shouldPreflight } = require('../lib/bot-protocol-reference-preflight');

test('Kenworth T680 reported as equipment with power loss never becomes a bare reference lookup', () => {
  const message = 'Tengo un Kenworth T680 2018 con pérdida de potencia';
  assert.equal(shouldPreflight(message, createEmptyState(), ['T680']), false);
});

test('explicit code lookup still uses canonical reference authority', () => {
  assert.equal(shouldPreflight('¿Qué equivalencia tiene P552100?', createEmptyState(), ['P552100']), true);
});

test('reported low oil pressure reaches diagnostic even with model-like alphanumerics', () => {
  assert.equal(
    shouldPreflight('Tengo un Kenworth T680 2018: baja la presión de aceite', createEmptyState(), ['T680']),
    false
  );
});
