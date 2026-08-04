const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createHermesResearchRequest,
  validateHermesResearchRequest,
  createHermesResearchResponse,
  validateHermesResearchResponse,
  isReadyForObsidianReview,
  canAutoPublish
} = require('../lib/knowledge-governance/hermes-research-contract');

test('a well-formed research request validates', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-1',
    research_question: '¿Cuál es el intervalo de cambio de aceite para Detroit Series 60?'
  });
  assert.equal(validateHermesResearchRequest(request).valid, true);
});

// Case 2: HERMES devuelve intervalo con fuentes -> todavía no publicable.
test('a HERMES response with sources is ready for review but never auto-publishable', () => {
  const response = createHermesResearchResponse({
    research_request_id: 'req-1',
    status: 'completed',
    findings: ['Detroit recommends 500-hour oil change intervals under normal service'],
    sources: [{ title: 'Series 60 Service Manual', publisher: 'Detroit Diesel', source_type: 'oem_manual', authority_level: 'primary', confidence: 'high' }],
    answer_draft: 'Cambiar cada 500 horas.'
  });
  assert.equal(response.ready_for_obsidian_review, true);
  assert.equal(isReadyForObsidianReview(response), true);
  assert.equal(canAutoPublish(response), false);
  assert.equal(validateHermesResearchResponse(response).valid, true);
  assert.equal(Object.prototype.hasOwnProperty.call(response, 'approved_for_bot_use'), false);
});

// Case 14: HERMES sin fuentes -> no listo para revisión.
test('a HERMES response with no sources is never ready for review', () => {
  const response = createHermesResearchResponse({ research_request_id: 'req-2', status: 'completed', sources: [] });
  assert.equal(response.ready_for_obsidian_review, false);
});

// Case 15: HERMES con conflictos -> no publicación automática.
test('a HERMES response with detected conflicts is not ready for review and never auto-publishes', () => {
  const response = createHermesResearchResponse({
    research_request_id: 'req-3',
    status: 'conflicting_sources',
    sources: [{ title: 'Manual A' }, { title: 'Manual B' }],
    conflicts_detected: true,
    conflicts: [{ description: 'Manual A says 500 hours, Manual B says 250 hours' }]
  });
  assert.equal(response.ready_for_obsidian_review, false);
  assert.equal(canAutoPublish(response), false);
});

test('a HERMES response that claims approved_for_bot_use fails validation', () => {
  const response = createHermesResearchResponse({ research_request_id: 'req-4', status: 'completed', sources: [{ title: 'x' }] });
  response.approved_for_bot_use = true; // simulate a tampered/malicious payload
  assert.equal(validateHermesResearchResponse(response).valid, false);
});
