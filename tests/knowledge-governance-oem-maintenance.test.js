const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createOemMaintenanceRecord,
  validateOemMaintenanceRecord,
  isPublishableOemInterval,
  canRecommendFilterAfterRepair,
  APPROVED_GENERAL_PRACTICES,
  isGeneralPracticeApproved
} = require('../lib/knowledge-governance/oem-maintenance-contract');

function approvedEvidence(overrides = {}) {
  return {
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: 'obsidian-doc-123',
    source_type: 'oem_manual',
    equipment: { brand: 'FREIGHTLINER', model: null, engine: 'SERIES 60', year: 2007 },
    approved_for_bot_use: true,
    ...overrides
  };
}

// Case 19: Intervalo sin unidad -> bloqueado.
test('an interval value without a unit is rejected as invalid', () => {
  const record = createOemMaintenanceRecord({
    status: 'validated',
    equipment: { brand: 'FREIGHTLINER', year: 2007 },
    interval: { value: 500, unit: null },
    technical_evidence: approvedEvidence()
  });
  assert.equal(validateOemMaintenanceRecord(record).valid, false);
  assert.equal(isPublishableOemInterval(record), false);
});

test('a fully specified, approved interval is publishable', () => {
  const record = createOemMaintenanceRecord({
    status: 'validated',
    equipment: { brand: 'FREIGHTLINER', year: 2007 },
    interval: { value: 500, unit: 'hours' },
    technical_evidence: approvedEvidence({ equipment: { brand: 'FREIGHTLINER', year: 2007 } })
  });
  assert.equal(isPublishableOemInterval(record), true);
});

test('a non-validated status is never publishable even with good evidence', () => {
  const record = createOemMaintenanceRecord({
    status: 'pending_research',
    interval: { value: 500, unit: 'hours' },
    technical_evidence: approvedEvidence()
  });
  assert.equal(isPublishableOemInterval(record), false);
});

test('canRecommendFilterAfterRepair requires both a post-failure justification and approved evidence', () => {
  const withJustification = createOemMaintenanceRecord({
    equipment: { brand: 'FREIGHTLINER', year: 2007 },
    post_failure_actions: ['replace primary fuel filter'],
    technical_evidence: approvedEvidence({ equipment: { brand: 'FREIGHTLINER', year: 2007 } })
  });
  assert.equal(canRecommendFilterAfterRepair(withJustification), true);

  const withoutJustification = createOemMaintenanceRecord({ technical_evidence: approvedEvidence() });
  assert.equal(canRecommendFilterAfterRepair(withoutJustification), false);
});

// Case 17: Práctica general aprobada no se presenta como intervalo OEM.
test('general approved practices are never shaped like an OEM interval', () => {
  assert.ok(APPROVED_GENERAL_PRACTICES.length > 0);
  for (const practice of APPROVED_GENERAL_PRACTICES) {
    assert.equal(practice.type, 'general_approved_practice');
    assert.equal(practice.interval, undefined);
    assert.equal(isGeneralPracticeApproved(practice), true);
  }
});

test('a practice not marked internally approved is not treated as approved', () => {
  assert.equal(isGeneralPracticeApproved({ type: 'general_approved_practice', internally_approved: false }), false);
  assert.equal(isGeneralPracticeApproved({ type: 'oem_interval' }), false);
});
