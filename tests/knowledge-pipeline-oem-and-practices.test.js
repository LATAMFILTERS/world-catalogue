'use strict';

// Verifies the A-F structured diagnostic answer format (spec section 6):
// an approved OEM citation is shown with its source, an unapproved one is
// never invented, and general approved practices are always labeled
// distinctly from an OEM interval.

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDiagnosticAssessmentAnswer, buildMaintenanceIntervalAnswer, deterministicClassify, finalizeResponseGovernance } = require('../lib/bot-conversation-orchestrator');
const { sanitizeTechnicalEvidence } = require('../lib/knowledge-governance/technical-evidence-contract');
const { createOemMaintenanceRecord } = require('../lib/knowledge-governance/oem-maintenance-contract');
const { createEmptyState } = require('../lib/bot-protocol-memory');

function baseState(overrides = {}) {
  return {
    intent: 'diagnostic',
    phase: 'diagnostic_assessment',
    equipment: { brand: 'MACK', model: null, engine: 'MP8', year: 2019 },
    operatingContext: 'carretera',
    installedFilter: { type: null, brand: null, reference: null, status: 'unknown' },
    symptoms: [{ code: 'water_in_fuel', raw: 'agua en el combustible', system: 'fuel' }],
    ...overrides
  };
}

// Case 11: Intervalo OEM aprobado -> se muestra con fuente.
test('direct maintenance question is classified as maintenance_interval with vehicle entities', () => {
  const classification = deterministicClassify(
    'cada cuanto debo cambiarle los filtros a mi hyundai sonata 2022',
    createEmptyState()
  );
  assert.equal(classification.intent, 'maintenance_interval');
  assert.equal(classification.entities.brand, 'HYUNDAI');
  assert.equal(classification.entities.model, 'sonata');
  assert.equal(classification.entities.year, 2022);
});

test('maintenance interval answer refuses numeric text without a structured approved OEM record', () => {
  const state = {
    ...createEmptyState(),
    equipment: { brand: 'HYUNDAI', model: 'SONATA', engine: null, year: 2022 }
  };
  const answer = buildMaintenanceIntervalAnswer(state, {
    technicalKnowledge: {
      status: 'validated',
      answer: 'Cambiar cada 8,000 millas.',
      evidence: [],
      oem_maintenance: null
    }
  });
  assert.match(answer, /No tengo un intervalo OEM estructurado y aprobado/i);
  assert.doesNotMatch(answer, /8,000|8000/);
});

test('structured approved OEM maintenance record passes response governance', () => {
  const evidence = sanitizeTechnicalEvidence({
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: 'hyundai-sonata-2022-maintenance',
    source_type: 'oem_manual',
    source_title: 'Hyundai Sonata 2022 Owner Manual',
    equipment: { brand: 'HYUNDAI', model: 'SONATA', year: 2022 },
    approved_for_bot_use: true
  });
  const record = createOemMaintenanceRecord({
    status: 'validated',
    equipment: { brand: 'HYUNDAI', model: 'SONATA', year: 2022 },
    system: 'oil',
    component: 'engine oil filter',
    interval: { value: 8000, unit: 'miles', maximum_time_months: 12 },
    technical_evidence: evidence
  });
  const state = {
    ...createEmptyState(),
    intent: 'maintenance_interval',
    equipment: { brand: 'HYUNDAI', model: 'SONATA', engine: null, year: 2022 }
  };
  const pipeline = {
    technicalKnowledge: {
      status: 'validated',
      answer: 'Cambiar el filtro de aceite cada 8,000 millas o 12 meses.',
      evidence: [evidence],
      oem_maintenance: record
    },
    categoryRecommendation: { status: 'not_applicable', categories: [] },
    knowledgeGapRecord: null
  };
  const answer = buildMaintenanceIntervalAnswer(state, pipeline);
  assert.match(answer, /8,000 millas|8000 millas/i);
  const governed = finalizeResponseGovernance({
    requestId: 'test-maintenance',
    body: {},
    state,
    catalog: { products: [], lookupStatus: 'not_required' },
    answer,
    pipeline
  });
  assert.equal(governed.governance.oem_maintenance_found, true);
  assert.match(governed.answer, /8,000 millas|8000 millas/i);
});

test('validated technical knowledge is shown in the "Mantenimiento OEM" section with its source', () => {
  const evidence = sanitizeTechnicalEvidence({
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: 'src-1',
    source_type: 'oem_manual',
    source_title: 'Manual OEM Mack MP8',
    equipment: { brand: 'MACK', year: 2019 },
    approved_for_bot_use: true
  });
  const answer = buildDiagnosticAssessmentAnswer(baseState(), { products: [] }, {
    technicalKnowledge: { status: 'validated', answer: 'Drenar el separador cada 500 horas.', evidence: [evidence] },
    categoryRecommendation: { status: 'not_applicable', categories: [] }
  });

  assert.match(answer, /Mantenimiento OEM:/);
  assert.match(answer, /Manual OEM Mack MP8/);
  assert.match(answer, /Drenar el separador cada 500 horas\./);
});

// Case 12: Intervalo OEM no aprobado -> nunca se inventa, se declara no confirmado.
test('when technical knowledge is not validated, no interval is invented', () => {
  const answer = buildDiagnosticAssessmentAnswer(baseState(), { products: [] }, {
    technicalKnowledge: { status: 'not_found', answer: null, evidence: [] },
    categoryRecommendation: { status: 'not_applicable', categories: [] }
  });

  assert.match(answer, /No tengo confirmado el procedimiento o intervalo OEM exacto/);
  assert.doesNotMatch(answer, /\b\d{1,3}\s*(?:horas?|millas?|kil[oó]metros?|km|meses?)\b/i);
});

// Case 13: Práctica general aprobada -> se muestra como práctica general, nunca como OEM.
test('an applicable general approved practice is shown labeled distinctly from OEM maintenance', () => {
  const answer = buildDiagnosticAssessmentAnswer(baseState(), { products: [] }, {
    technicalKnowledge: { status: 'not_found', answer: null, evidence: [] },
    categoryRecommendation: { status: 'not_applicable', categories: [] }
  });

  assert.match(answer, /Prácticas generales aprobadas:/);
  // At least one fuel-applicable practice from oem-maintenance-contract.js.
  assert.match(answer, /solvente|filtros spin-on|indicadores de restricción|contaminación grave/i);
});

test('no general practice section appears when the system has none registered', () => {
  const answer = buildDiagnosticAssessmentAnswer(baseState({
    symptoms: [{ code: 'engine_stall', raw: 'se apaga', system: null }]
  }), { products: [] }, {
    technicalKnowledge: { status: 'not_found', answer: null, evidence: [] },
    categoryRecommendation: { status: 'not_applicable', categories: [] }
  });
  assert.doesNotMatch(answer, /Prácticas generales aprobadas:/);
});

test('a category recommendation is shown in the "Protección ELIMFILTERS" section', () => {
  const answer = buildDiagnosticAssessmentAnswer(baseState(), { products: [] }, {
    technicalKnowledge: { status: 'not_found', answer: null, evidence: [] },
    categoryRecommendation: {
      status: 'recommended',
      categories: [{ system: 'fuel', category: 'fuel_water_separator', priority: 'primary', conditional: false, reason: 'Contaminación por agua.' }]
    }
  });
  assert.match(answer, /Protección ELIMFILTERS:/);
  assert.match(answer, /fuel water separator/);
});

test('buildDiagnosticAssessmentAnswer still works with no pipeline argument at all (backward compatible)', () => {
  const answer = buildDiagnosticAssessmentAnswer(baseState(), { products: [] });
  assert.match(answer, /No asignaré un SKU sin evidencia/);
});
