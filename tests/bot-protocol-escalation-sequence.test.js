'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeState, createEmptyState } = require('../lib/bot-protocol-memory');
const { shouldEscalate, formatForChannel } = require('../lib/bot-protocol-channel-format');

function payload(overrides = {}) {
  return {
    intent: 'diagnostic',
    phase: 'collecting_diagnostic_data',
    pending_field: 'operating_and_filter',
    state: {
      ...createEmptyState(),
      intent: 'diagnostic',
      phase: 'collecting_diagnostic_data',
      pendingField: 'operating_and_filter',
      unresolvedAttempts: 5
    },
    evidence: {
      source: 'elimfilters_catalog',
      count: 0,
      validated: false,
      lookup_status: 'not_required',
      products: []
    },
    answer: '¿En qué operación trabaja el equipo y qué filtro está usando?',
    ...overrides
  };
}

test('active diagnostic clarification clears stale unresolved attempts', () => {
  const state = normalizeState({
    ...createEmptyState(),
    intent: 'diagnostic',
    phase: 'collecting_diagnostic_data',
    pendingField: 'operating_and_filter',
    unresolvedAttempts: 9
  });
  assert.equal(state.unresolvedAttempts, 0);
});

test('never escalates while the protocol is collecting required data', () => {
  assert.equal(shouldEscalate(payload()), false);
});

test('never escalates when no catalog lookup was required', () => {
  assert.equal(shouldEscalate(payload({
    phase: 'diagnostic_assessment',
    pending_field: null,
    state: { ...payload().state, phase: 'diagnostic_assessment', pendingField: null, unresolvedAttempts: 8 }
  })), false);
});

test('never escalates when PostgreSQL lookup failed', () => {
  assert.equal(shouldEscalate(payload({
    phase: 'diagnostic_assessment',
    pending_field: null,
    state: { ...payload().state, phase: 'diagnostic_assessment', pendingField: null, unresolvedAttempts: 8 },
    evidence: { count: 0, validated: false, lookup_status: 'error', products: [] }
  })), false);
});

test('escalates only after five completed evidence-free resolutions', () => {
  assert.equal(shouldEscalate(payload({
    phase: 'diagnostic_assessment',
    pending_field: null,
    state: { ...payload().state, phase: 'diagnostic_assessment', pendingField: null, unresolvedAttempts: 5 },
    evidence: { count: 0, validated: false, lookup_status: 'completed', products: [] }
  })), true);
});

test('a requested filter-code response is preserved and not replaced by a ticket', () => {
  const result = formatForChannel(payload(), {
    channel: 'whatsapp',
    conversation_id: 'regression-sequence-1',
    message: 'P550425'
  });

  assert.equal(result.escalation, null);
  assert.match(result.answer, /operación|filtro/i);
  assert.doesNotMatch(result.answer, /Ticket\s+#/i);
});
