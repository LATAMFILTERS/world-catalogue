'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertOwnedWrite,
  ownerForDomain,
  validateCrossRepoRequest
} = require('../lib/agency-domain-contract');

test('commercial truth stays in CRM and technical truth stays in world-catalogue', () => {
  assert.equal(ownerForDomain('opportunity'), 'crm');
  assert.equal(ownerForDomain('sku'), 'world-catalogue');
  assert.equal(ownerForDomain('technical_fact'), 'world-catalogue');
});

test('cross-domain writes fail closed', () => {
  assert.throws(() => assertOwnedWrite({ actorRepo: 'crm', domain: 'sku' }), /CROSS_DOMAIN_WRITE_DENIED/);
  assert.throws(() => assertOwnedWrite({ actorRepo: 'world-catalogue', domain: 'rfq' }), /CROSS_DOMAIN_WRITE_DENIED/);
});

test('accepts traced technical lookup request from CRM', () => {
  const result = validateCrossRepoRequest({
    type: 'TECHNICAL_SKU_LOOKUP',
    caller: 'crm',
    owner: 'world-catalogue',
    requestId: 'req-1',
    correlationId: 'corr-1'
  });
  assert.equal(result.valid, true);
  assert.equal(result.definition.mode, 'READ');
});

test('rejects direct cross-repo writes', () => {
  const result = validateCrossRepoRequest({
    type: 'COMMERCIAL_INTELLIGENCE_EVENT',
    caller: 'world-catalogue',
    owner: 'crm',
    requestId: 'req-2',
    correlationId: 'corr-2',
    writeTarget: 'crm.accounts'
  });
  assert.deepEqual(result, { valid: false, reason: 'DIRECT_CROSS_REPO_WRITE_FORBIDDEN' });
});
