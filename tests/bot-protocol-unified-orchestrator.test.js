'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PROTOCOL_VERSION,
  isReplacementElementRequest,
  extractApplicationEntities
} = require('../lib/bot-protocol-unified-orchestrator');
const {
  normalizeState,
  createEmptyState
} = require('../lib/bot-protocol-memory');
const {
  compatibleSeriesFromProduct,
  isHousing
} = require('../lib/bot-protocol-catalog');

test('uses one protocol version for unified responses', () => {
  assert.equal(PROTOCOL_VERSION, '3.3.0');
});

test('detects turbine replacement-element requests', () => {
  assert.equal(isReplacementElementRequest('¿Cuál cartucho lleva la turbina 1000FH?'), true);
  assert.equal(isReplacementElementRequest('Necesito el filtro de repuesto para la turbina'), true);
  assert.equal(isReplacementElementRequest('¿Cuál es la turbina recomendada?'), false);
});

test('extracts Mack MP8 application entities without treating them as a filter reference', () => {
  assert.deepEqual(extractApplicationEntities('Mack con motor MP8'), {
    brand: 'MACK',
    engine: 'MP8',
    year: null,
    tokens: ['MACK', 'MP8']
  });
});

test('persists identified housing in normalized conversation state', () => {
  const state = normalizeState({
    ...createEmptyState(),
    identifiedHousing: {
      sku: 'ET91000',
      externalReference: '1000FH',
      compatibleSeries: ['2040']
    }
  });

  assert.deepEqual(state.identifiedHousing, {
    sku: 'ET91000',
    externalReference: '1000FH',
    compatibleSeries: ['2040']
  });
});

test('resets housing state when a new diagnostic starts', () => {
  const state = createEmptyState();
  assert.deepEqual(state.identifiedHousing, {
    sku: null,
    externalReference: null,
    compatibleSeries: []
  });
});

test('prefers structured compatible series and supports transitional description fallback', () => {
  assert.equal(compatibleSeriesFromProduct({ specs: { compatible_element_series: '2040' } }), '2040');
  assert.equal(compatibleSeriesFromProduct({ description: 'Bowl class 2020. Accepts 2020-series elements.' }), '2020');
});

test('recognizes only catalog products explicitly typed as housings', () => {
  assert.equal(isHousing({ filter_type: 'Fuel Housing' }), true);
  assert.equal(isHousing({ filter_type: 'Fuel Filter Element', description: 'Cross-reference 1000FH' }), false);
});
