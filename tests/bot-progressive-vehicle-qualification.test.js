'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  deterministicClassify,
  groundVehicleApplicationIntent,
  mergeEntitiesIntoState,
  resolveApplicationIdentityAction
} = require('../lib/bot-conversation-orchestrator');
const { createEmptyState } = require('../lib/bot-protocol-memory');
const { parseVehicleSearchText } = require('../lib/vehicle-application-normalizer');

function stateWithMessage(message, initialState = createEmptyState()) {
  const vehicle = parseVehicleSearchText(message, 'US');
  const grounded = groundVehicleApplicationIntent(
    { intent: 'general', entities: { brand: null, model: null, engine: null, year: null, symptoms: [] } },
    message, initialState, vehicle
  );
  assert.equal(grounded?.intent, 'application_lookup');
  return mergeEntitiesIntoState(initialState, grounded, message);
}

test('misspelled NPR vehicle request overrides wrong LLM intent and asks variant', () => {
  const state = stateWithMessage('que fitros usa el npr 2022');
  assert.equal(state.equipment.brand, 'ISUZU');
  assert.equal(state.equipment.model, 'NPR');
  assert.equal(state.equipment.year, 2022);
  const action = resolveApplicationIdentityAction(state);
  assert.equal(action.pendingField, 'vehicle_model_variant');
});

test('variant follow-up asks engine, then allows catalogue resolution with supplied engine', () => {
  let state = stateWithMessage('que fitros usa el npr 2022');
  state.pendingField = 'vehicle_model_variant';
  const variantMessage = 'NPR-HD';
  const variantVehicle = parseVehicleSearchText([...state.conversationHistory, variantMessage].join('\n'), 'US');
  const variant = groundVehicleApplicationIntent(
    { intent: 'general', entities: {} }, variantMessage, state, variantVehicle
  );
  state = mergeEntitiesIntoState(state, variant, variantMessage);
  assert.equal(state.equipment.model, 'NPR-HD');
  assert.equal(resolveApplicationIdentityAction(state).pendingField, 'vehicle_engine');

  state.pendingField = 'vehicle_engine';
  const engineMessage = 'motor 5.2 litros diesel';
  const vehicle = parseVehicleSearchText([...state.conversationHistory, engineMessage].join('\n'), 'US');
  const engine = groundVehicleApplicationIntent(
    { intent: 'general', entities: {} }, engineMessage, state, vehicle
  );
  state = mergeEntitiesIntoState(state, engine, engineMessage);
  assert.equal(state.equipment.engine, '5.2L');
  assert.equal(resolveApplicationIdentityAction(state).pendingField, null);
});

test('known engine does not trigger an unnecessary engine question', () => {
  const state = stateWithMessage('que filtros usa el Isuzu NPR-HD 2022 motor 5.2L');
  assert.equal(resolveApplicationIdentityAction(state).pendingField, null);
});

test('a symptom report is not converted into a product search', () => {
  const state = createEmptyState();
  const message = 'Mi Isuzu NPR 2022 pierde potencia y sale humo negro';
  assert.equal(groundVehicleApplicationIntent(
    { intent: 'diagnostic', entities: {} }, message, state,
    parseVehicleSearchText(message, 'US')
  ), null);
});

test('model alone, without filter question or pending clarification, does not force application lookup', () => {
  const state = createEmptyState();
  const message = 'Isuzu NPR 2022';
  assert.equal(groundVehicleApplicationIntent(
    { intent: 'general', entities: {} }, message, state,
    parseVehicleSearchText(message, 'US')
  ), null);
});
