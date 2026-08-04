const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isApprovedTechnicalEvidence,
  isApprovedOemMaintenanceEvidence,
  buildUnvalidatedEvidence,
  sanitizeTechnicalEvidence,
  validateTechnicalEvidence
} = require('../lib/knowledge-governance/technical-evidence-contract');

function approvedEvidence(overrides = {}) {
  return {
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: 'obsidian-doc-123',
    source_title: 'Detroit Series 60 Service Manual',
    source_type: 'oem_manual',
    manufacturer: 'DETROIT',
    equipment: { brand: 'FREIGHTLINER', model: null, engine: 'SERIES 60', year: 2007 },
    system: 'oil',
    approved_for_bot_use: true,
    approved_at: '2026-01-01T00:00:00.000Z',
    approved_by: 'reviewer@elimfilters.com',
    confidence: 'high',
    ...overrides
  };
}

// Case 3: Obsidian aprueba evidencia válida -> publicable.
test('approved obsidian evidence with a source_id is publishable', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence()), true);
});

// Case 4: Obsidian sin source_id -> no publicable.
test('obsidian evidence without a source_id is not publishable', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ source_id: null })), false);
});

test('evidence not authored by obsidian is never approved', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ source_authority: 'hermes' })), false);
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ source_authority: null })), false);
});

test('evidence not marked approved_for_bot_use is never approved', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ approved_for_bot_use: false })), false);
});

test('evidence with an invalid source_type is never approved', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ source_type: 'blog_post' })), false);
});

test('evidence without identified equipment is never approved', () => {
  assert.equal(isApprovedTechnicalEvidence(approvedEvidence({ equipment: { brand: null, model: null, engine: null, year: null } })), false);
});

// Case 16: Evidencia OEM con año diferente -> no aplicable.
test('OEM maintenance evidence for a different model year is not applicable', () => {
  const evidence = approvedEvidence({ equipment: { brand: 'FREIGHTLINER', model: null, engine: 'SERIES 60', year: 2015 } });
  assert.equal(isApprovedOemMaintenanceEvidence(evidence, { brand: 'FREIGHTLINER', year: 2007 }), false);
  assert.equal(isApprovedOemMaintenanceEvidence(evidence, { brand: 'FREIGHTLINER', year: 2015 }), true);
});

test('buildUnvalidatedEvidence always forces unapproved status regardless of input', () => {
  const evidence = buildUnvalidatedEvidence({
    technical_source_validated: true,
    source_authority: 'obsidian',
    approved_for_bot_use: true,
    source_id: 'attempted-forgery',
    extracted_statement: 'Groq or HERMES raw output'
  });
  assert.equal(evidence.technical_source_validated, false);
  assert.equal(evidence.source_authority, null);
  assert.equal(evidence.approved_for_bot_use, false);
  assert.equal(isApprovedTechnicalEvidence(evidence), false);
});

test('sanitizeTechnicalEvidence normalizes an arbitrary object into the canonical shape', () => {
  const sanitized = sanitizeTechnicalEvidence({});
  assert.deepEqual(Object.keys(sanitized).sort(), [
    'approved_at', 'approved_by', 'approved_for_bot_use', 'conflicting_sources', 'confidence',
    'conflicts_detected', 'document_revision', 'equipment', 'extracted_statement', 'manufacturer',
    'page', 'publication_date', 'retrieved_at', 'section', 'source_authority', 'source_id',
    'source_title', 'source_type', 'system', 'technical_source_validated'
  ].sort());
});

test('validateTechnicalEvidence rejects an approved record with no source_id', () => {
  const result = validateTechnicalEvidence({ approved_for_bot_use: true, source_id: null });
  assert.equal(result.valid, false);
});
