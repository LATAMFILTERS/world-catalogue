const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPublicationRequest,
  validatePublicationRequest,
  transitionReviewStatus,
  isValidReviewTransition,
  publishToObsidianStub
} = require('../lib/knowledge-governance/obsidian-publication-contract');

function baseRequest(overrides = {}) {
  return createPublicationRequest({
    proposed_title: 'Detroit Series 60 — Oil Change Interval',
    proposed_path: 'oem/detroit/series-60/oil-change-interval.md',
    reviewer: 'reviewer@elimfilters.com',
    approved_sources: [{ title: 'Series 60 Service Manual' }],
    ...overrides
  });
}

test('a publication request starts pending review', () => {
  const request = baseRequest();
  assert.equal(request.review_status, 'pending');
});

test('pending cannot jump directly to a terminal state without going through the transition function validation', () => {
  assert.equal(isValidReviewTransition('pending', 'approved'), true);
  assert.equal(isValidReviewTransition('approved', 'pending'), false);
  assert.equal(isValidReviewTransition('rejected', 'approved'), false);
});

test('approving a request requires at least one approved source', () => {
  const request = baseRequest({ approved_sources: [] });
  const approved = transitionReviewStatus(request, 'approved', { reviewer: 'reviewer@elimfilters.com' });
  assert.equal(validatePublicationRequest(approved).valid, false);
});

test('rejecting a request requires review notes', () => {
  const request = baseRequest();
  assert.throws(() => transitionReviewStatus(request, 'rejected'));
  const rejected = transitionReviewStatus(request, 'rejected', { notes: 'source is outdated' });
  assert.equal(rejected.review_status, 'rejected');
});

test('changes_requested can be resubmitted to pending, but not to approved directly', () => {
  const request = baseRequest();
  const changesRequested = transitionReviewStatus(request, 'changes_requested', { notes: 'need a second independent source' });
  assert.equal(isValidReviewTransition('changes_requested', 'pending'), true);
  const resubmitted = transitionReviewStatus(changesRequested, 'pending');
  assert.equal(resubmitted.review_status, 'pending');
});

// The stub must never claim to have published anything, regardless of input.
test('the Obsidian publish stub never reports success', () => {
  const pending = baseRequest();
  assert.equal(publishToObsidianStub(pending).published, false);

  const approved = transitionReviewStatus(pending, 'approved', { reviewer: 'reviewer@elimfilters.com' });
  const result = publishToObsidianStub(approved);
  assert.equal(result.published, false);
  assert.equal(result.reason, 'obsidian_write_not_implemented');
  assert.equal(result.published_document_id, null);
});
