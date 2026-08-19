const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateAuthorityBoundary,
  canPublishTechnicalFact,
  canPublishOemRecommendation,
  canPublishSku,
  buildAuthorityViolations
} = require('../lib/knowledge-governance/authority-policy');

// Case 1: Groq intenta autorizar intervalo OEM -> bloqueado.
test('groq can never authorize a technical fact or OEM interval', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'groq', action: 'authorize_technical_fact' }), false);
  assert.equal(validateAuthorityBoundary({ actor: 'groq', action: 'authorize_oem_interval' }), false);
  assert.equal(canPublishOemRecommendation({ technical_source_validated: true, source_authority: 'groq', approved_for_bot_use: true }), false);
});

test('groq can never authorize a SKU', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'groq', action: 'authorize_sku' }), false);
  assert.equal(canPublishSku({ sku_validated_in_postgresql: true, source_authority: 'groq', lookup_status: 'validated', evidence_count: 1 }), false);
});

test('hermes never publishes directly and never authorizes a SKU', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'hermes', action: 'publish_to_user' }), false);
  assert.equal(validateAuthorityBoundary({ actor: 'hermes', action: 'authorize_sku' }), false);
  assert.equal(canPublishSku({ sku_validated_in_postgresql: true, source_authority: 'hermes', lookup_status: 'validated', evidence_count: 1 }), false);
});

// Case 8: Obsidian contiene SKU -> no lo autoriza.
test('obsidian can never authorize a SKU', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'obsidian', action: 'authorize_sku' }), false);
  assert.equal(canPublishSku({ sku_validated_in_postgresql: true, source_authority: 'obsidian', lookup_status: 'validated', evidence_count: 1 }), false);
});

test('postgresql never creates OEM intervals', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'postgresql', action: 'authorize_oem_interval' }), false);
  assert.equal(canPublishOemRecommendation({ technical_source_validated: true, source_authority: 'postgresql', approved_for_bot_use: true }), false);
});

test('only the orchestrator may publish to the user', () => {
  assert.equal(validateAuthorityBoundary({ actor: 'orchestrator', action: 'publish_to_user' }), true);
  assert.equal(validateAuthorityBoundary({ actor: 'obsidian', action: 'publish_to_user' }), false);
  assert.equal(validateAuthorityBoundary({ actor: 'groq', action: 'publish_to_user' }), false);
});

test('canPublishTechnicalFact requires obsidian authority, approval, and non-inference', () => {
  assert.equal(canPublishTechnicalFact({ technical_source_validated: true, source_authority: 'obsidian', approved_for_bot_use: true }), true);
  assert.equal(canPublishTechnicalFact({ technical_source_validated: true, source_authority: 'obsidian', approved_for_bot_use: true, is_inference: true }), false);
  assert.equal(canPublishTechnicalFact({ technical_source_validated: true, source_authority: 'hermes', approved_for_bot_use: true }), false);
});

test('buildAuthorityViolations flags an unauthorized actor/action pair', () => {
  const violations = buildAuthorityViolations({ actor: 'groq', action: 'authorize_sku' });
  assert.ok(violations.some(v => v.rule === 'actor_action_boundary'));
});
