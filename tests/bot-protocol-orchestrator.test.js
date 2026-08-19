const test = require('node:test');
const assert = require('node:assert/strict');

const {
  deterministicClassify,
  mergeEntitiesIntoState,
  determineNextAction,
  detectSymptoms,
  extractInstalledFilter,
  buildDiagnosticAssessmentAnswer
} = require('../lib/bot-conversation-orchestrator');
const { createEmptyState } = require('../lib/bot-protocol-memory');

test('generic "agua en el sistema" is recorded as incomplete (system unknown)', () => {
  const symptoms = detectSymptoms('Mack 2024 agua en el sistema');
  assert.equal(symptoms.length, 1);
  assert.equal(symptoms[0].code, 'water_contamination');
  assert.equal(symptoms[0].system, 'unknown');
});

test('"agua en el combustible" is recorded as complete with system fuel', () => {
  const symptoms = detectSymptoms('agua en el combustible');
  assert.equal(symptoms[0].code, 'water_in_fuel');
  assert.equal(symptoms[0].system, 'fuel');
});

test('"agua en el aceite" resolves to the oil system, not fuel', () => {
  const symptoms = detectSymptoms('tengo agua en el aceite del motor');
  assert.equal(symptoms[0].code, 'water_in_oil');
  assert.equal(symptoms[0].system, 'oil');
});

test('next action asks which system when a water symptom has system: unknown', () => {
  const state = mergeEntitiesIntoState(createEmptyState(), deterministicClassify('Mack 2024 agua en el sistema', createEmptyState()), 'Mack 2024 agua en el sistema');
  const action = determineNextAction(state);
  assert.equal(action.pendingField, 'symptom_system');
  assert.match(action.question, /combustible, aceite, refrigerante, hidr[aá]ulico o aire/);
  assert.doesNotMatch(action.question, /qu[eé] s[ií]ntomas observás/i);
});

test('answering "combustible" resolves the pending system clarification instead of repeating it', () => {
  let state = mergeEntitiesIntoState(createEmptyState(), deterministicClassify('Mack 2024 agua en el sistema', createEmptyState()), 'Mack 2024 agua en el sistema');
  state.pendingField = determineNextAction(state).pendingField;
  assert.equal(state.pendingField, 'symptom_system');

  state = mergeEntitiesIntoState(state, deterministicClassify('combustible', state), 'combustible');
  assert.equal(state.symptoms[0].code, 'water_in_fuel');
  assert.equal(state.symptoms[0].system, 'fuel');

  const action = determineNextAction(state);
  assert.notEqual(action.pendingField, 'symptom_system');
});

test('a fully-informed first message does not re-ask for equipment or symptoms', () => {
  const message = 'Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.';
  let state = createEmptyState();
  state = mergeEntitiesIntoState(state, deterministicClassify(message, state), message);
  const action = determineNextAction(state);

  assert.equal(state.equipment.brand, 'FREIGHTLINER');
  assert.equal(state.equipment.year, 2007);
  assert.ok(state.symptoms.some(s => s.code === 'pressure_loss'));
  assert.notEqual(action.pendingField, 'equipment');
  assert.notEqual(action.pendingField, 'symptoms');
});

test('short reply "4 días" is understood as duration when pendingField is duration', () => {
  let state = createEmptyState();
  state.intent = 'diagnostic';
  state.equipment.brand = 'MACK';
  state.symptoms = [{ code: 'pressure_loss', raw: 'pierde presión', system: null }];
  state.pendingField = 'duration';

  state = mergeEntitiesIntoState(state, deterministicClassify('4 días', state), '4 días');
  assert.equal(state.duration, '4 días');
});

test('short reply "carretera" is understood as operatingContext', () => {
  let state = createEmptyState();
  state.intent = 'diagnostic';
  state.equipment.brand = 'MACK';
  state.symptoms = [{ code: 'pressure_loss', raw: 'pierde presión', system: null }];
  state.duration = '4 días';
  state.pendingField = 'operating_and_filter';

  state = mergeEntitiesIntoState(state, deterministicClassify('carretera', state), 'carretera');
  assert.equal(state.operatingContext, 'carretera');
});

test('extractInstalledFilter recognizes brand + reference in one message', () => {
  const filter = extractInstalledFilter('Carretera, con bastante ralentí. Tiene Donaldson P552100.');
  assert.equal(filter.brand, 'DONALDSON');
  assert.equal(filter.reference, 'P552100');
});

test('extractInstalledFilter recognizes "no lo sé" as unknown status', () => {
  const filter = extractInstalledFilter('No lo sé, no puedo verlo');
  assert.equal(filter.status, 'unknown');
  assert.equal(filter.reference, null);
});

test('diagnostic assessment answer never asserts the filter is the cause and never invents a SKU', () => {
  const state = {
    ...createEmptyState(),
    intent: 'diagnostic',
    operatingContext: 'carretera',
    installedFilter: { type: null, brand: 'DONALDSON', reference: 'P552100', status: 'reference_provided' },
    symptoms: [{ code: 'pressure_loss', raw: 'pierde presión', system: null }]
  };

  const withoutEvidence = buildDiagnosticAssessmentAnswer(state, { products: [] });
  assert.match(withoutEvidence, /No asignaré un SKU sin evidencia/);
  assert.doesNotMatch(withoutEvidence, /\bEL8\d{4}\b/);

  const withEvidence = buildDiagnosticAssessmentAnswer(state, { products: [{ sku: 'EL82100', codigo_base: 'P552100', filter_type: 'Oil Filter' }] });
  assert.match(withEvidence, /EL82100/);
  assert.doesNotMatch(withEvidence, /el filtro es la causa|causado por el filtro/i);
});

test('when the customer does not know the installed filter, no SKU is assigned', () => {
  const state = {
    ...createEmptyState(),
    intent: 'diagnostic',
    operatingContext: 'carretera',
    installedFilter: { type: null, brand: null, reference: null, status: 'unknown' },
    symptoms: [{ code: 'pressure_loss', raw: 'pierde presión', system: null }]
  };
  const answer = buildDiagnosticAssessmentAnswer(state, { products: [] });
  assert.match(answer, /No asignaré un SKU sin evidencia/);
});
