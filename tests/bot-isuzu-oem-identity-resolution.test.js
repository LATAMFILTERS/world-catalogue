'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEmptyState } = require('../lib/bot-protocol-memory');
const { resolveApplicationIdentityAction } = require('../lib/bot-conversation-orchestrator');

function stateWith(equipment) {
  const state = createEmptyState();
  state.intent = 'application_lookup';
  state.equipment = { ...state.equipment, ...equipment };
  return state;
}

test('customer NPR 2022 5.2 is stopped before catalog lookup until variant is known', () => {
  const state = stateWith({ brand: 'ISUZU', model: 'NPR', engine: '5.2L', year: 2022 });
  const action = resolveApplicationIdentityAction(state);
  assert.equal(action.phase, 'collecting_application_data');
  assert.equal(action.pendingField, 'vehicle_model_variant');
  assert.match(action.question, /NPR-HD/);
  assert.match(action.question, /NPR-XD/);
});

test('exact NPR-HD 2022 is OEM-closed and may proceed to catalog resolution', () => {
  const state = stateWith({ brand: 'ISUZU', model: 'NPR-HD', engine: '5.2L', year: 2022 });
  const action = resolveApplicationIdentityAction(state);
  assert.equal(action.pendingField, null);
  assert.equal(action.phase, 'catalog_resolution');
  assert.equal(state.equipment.model, 'NPR-HD');
});

test('plain 2023 NPR gas remains a valid separate OEM identity', () => {
  const state = stateWith({ brand: 'ISUZU', model: 'NPR', engine: '6.6L', year: 2023 });
  const action = resolveApplicationIdentityAction(state);
  assert.equal(action.pendingField, null);
  assert.equal(action.phase, 'catalog_resolution');
  assert.equal(state.equipment.model, 'NPR');
});
