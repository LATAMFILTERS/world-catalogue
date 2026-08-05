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
  RACOR_TURBINE_COMPATIBILITY,
  compatibleSeriesFromProduct,
  racorHousingModel,
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
      compatibleSeries: ['2020']
    }
  });

  assert.deepEqual(state.identifiedHousing, {
    sku: 'ET91000',
    externalReference: '1000FH',
    compatibleSeries: ['2020']
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

test('uses Parker-authorized turbine housing matrix', () => {
  assert.deepEqual(RACOR_TURBINE_COMPATIBILITY, {
    '500FG': '2010',
    '500FH': '2010',
    '900FG': '2040',
    '900FH': '2040',
    '1000FG': '2020',
    '1000FH': '2020'
  });
});

test('maps each turbine housing to the correct replacement element series', () => {
  assert.equal(compatibleSeriesFromProduct({ codigo_base: '500FH', filter_type: 'Fuel Water Separator Housing' }), '2010');
  assert.equal(compatibleSeriesFromProduct({ codigo_base: '900FH', filter_type: 'Fuel Water Separator Housing' }), '2040');
  assert.equal(compatibleSeriesFromProduct({ codigo_base: '1000FH', filter_type: 'Fuel Water Separator Housing' }), '2020');
});

test('structured compatibility overrides legacy description text', () => {
  assert.equal(compatibleSeriesFromProduct({
    codigo_base: '1000FH',
    specs: { compatible_element_series: '2020' },
    description: 'Legacy incorrect text: accepts 2040-series elements.'
  }), '2020');
});

test('Parker matrix overrides contradictory legacy description text', () => {
  assert.equal(compatibleSeriesFromProduct({
    codigo_base: '1000FH',
    description: 'Legacy incorrect text: accepts 2040-series elements.'
  }), '2020');
});

test('supports transitional description fallback only for unmapped legacy rows', () => {
  assert.equal(compatibleSeriesFromProduct({ description: 'Bowl class 2020. Accepts 2020-series elements.' }), '2020');
});

test('extracts Racor housing model from catalog authority fields', () => {
  assert.equal(racorHousingModel({ codigo_base: '1000FH' }), '1000FH');
  assert.equal(racorHousingModel({ oem_codes: [{ code: '900FG' }] }), '900FG');
});

test('recognizes only catalog products explicitly typed as housings', () => {
  assert.equal(isHousing({ filter_type: 'Fuel Water Separator Housing' }), true);
  assert.equal(isHousing({ filter_type: 'Fuel Water Separator Cartridge', description: 'Cross-reference 1000FH' }), false);
});
