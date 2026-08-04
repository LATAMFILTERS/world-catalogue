'use strict';

// Verifies the A-F structured diagnostic answer format (spec section 6):
// an approved OEM citation is shown with its source, an unapproved one is
// never invented, and general approved practices are always labeled
// distinctly from an OEM interval.

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDiagnosticAssessmentAnswer } = require('../lib/bot-conversation-orchestrator');
const { sanitizeTechnicalEvidence } = require('../lib/knowledge-governance/technical-evidence-contract');

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
