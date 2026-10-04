'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  candidateDecision,
  rejectedRelationPresence,
  cleanRejectedCompetitorCodes,
  cleanRejectedBrandCrossrefs,
} = require('../scripts/migrations/run_175_batch_rejected_fleetguard_inheritance_cleanup_20261004');

function row(overrides = {}) {
  return {
    sku: 'EH68936',
    codigo_base: 'HF28936',
    catalog_active: true,
    competitor_codes: [
      { manufacturer: 'DONALDSON', code: 'P560972' },
      { manufacturer: 'HASTINGS', code: 'HF1006' },
    ],
    brand_crossrefs: {
      DONALDSON: ['P560972'],
      HASTINGS: ['HF1006'],
    },
    enrichment_data: {
      equipment_inherited_from: 'EH65153',
      equipment_inheritance_shared_codes: 17,
    },
    ...overrides,
  };
}

test('eligible requires Fleetguard restored base, rejected Donaldson relation, and historical inheritance', () => {
  const decision = candidateDecision(row(), ['EH68936','P560972','HF28936'], { hasIndependentVerifiedApplications: false });
  assert.equal(decision.eligible, true);
  assert.equal(decision.inheritedFrom, 'EH65153');
});

test('independent verified application evidence forces exception review', () => {
  const decision = candidateDecision(row(), ['EH68936','P560972','HF28936'], { hasIndependentVerifiedApplications: true });
  assert.equal(decision.eligible, false);
  assert.equal(decision.reason, 'INDEPENDENT_APPLICATION_EVIDENCE');
});

test('already-cleaned relation is not processed again', () => {
  const clean = row({ competitor_codes: [{ manufacturer: 'HASTINGS', code: 'HF1006' }], brand_crossrefs: { HASTINGS: ['HF1006'] } });
  const decision = candidateDecision(clean, ['EH68936','P560972','HF28936'], { hasIndependentVerifiedApplications: false });
  assert.equal(decision.eligible, false);
  assert.equal(decision.reason, 'REJECTED_RELATION_ALREADY_REMOVED');
});

test('cleanup removes only the rejected Donaldson relation', () => {
  const source = row();
  const competitors = cleanRejectedCompetitorCodes(source, 'P560972');
  const refs = cleanRejectedBrandCrossrefs(source, 'P560972');
  assert.deepEqual(competitors, [{ manufacturer: 'HASTINGS', code: 'HF1006' }]);
  assert.deepEqual(refs, { HASTINGS: ['HF1006'] });
  assert.equal(rejectedRelationPresence({ ...source, competitor_codes: competitors, brand_crossrefs: refs }, 'P560972').present, false);
});

test('base mismatch and missing inheritance remain exceptions', () => {
  assert.equal(
    candidateDecision(row({ codigo_base: 'P560972' }), ['EH68936','P560972','HF28936'], {}).reason,
    'FLEETGUARD_BASE_NOT_RESTORED'
  );
  assert.equal(
    candidateDecision(row({ enrichment_data: {} }), ['EH68936','P560972','HF28936'], {}).reason,
    'NO_HISTORICAL_INHERITANCE'
  );
});
