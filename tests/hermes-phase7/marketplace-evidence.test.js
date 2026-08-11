import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMarketplaceEvidence } from '../../scripts/hermes/marketplace-evidence.mjs';

const base = {
  marketplace: 'ebay', listing_id: '1', seller_id: 'seller-a', url: 'https://www.ebay.com/itm/1',
  manufacturer: 'MANN', part_number: 'W 950/26', captured_at: '2026-08-11T00:00:00.000Z',
  dimensions: { height_mm: 170 }, applications: [{ make: 'MAN', model: 'TGS' }], cross_references: ['LF9009']
};

test('one marketplace listing remains unverified and cannot publish', () => {
  const report = buildMarketplaceEvidence([base]);
  assert.equal(report.evidence_bundles[0].evidence_level, 'SECONDARY_UNVERIFIED');
  assert.equal(report.evidence_bundles[0].workflow_status, 'NEEDS_RESEARCH');
  assert.equal(report.evidence_bundles[0].automatic_publication_allowed, false);
  assert.equal(report.publication_enabled, false);
});

test('two independent identical sellers can only reach secondary verified', () => {
  const report = buildMarketplaceEvidence([base, {
    ...base, marketplace: 'amazon', listing_id: 'ASIN-1', seller_id: 'seller-b', url: 'https://www.amazon.com/dp/ASIN-1'
  }]);
  assert.equal(report.evidence_bundles[0].independent_sellers, 2);
  assert.equal(report.evidence_bundles[0].evidence_level, 'SECONDARY_VERIFIED');
  assert.equal(report.evidence_bundles[0].workflow_status, 'PENDING_REVIEW');
  assert.equal(report.evidence_bundles[0].automatic_publication_allowed, false);
});

test('conflicting seller claims remain research even with multiple sellers', () => {
  const report = buildMarketplaceEvidence([base, {
    ...base, listing_id: '2', seller_id: 'seller-b', url: 'https://www.ebay.com/itm/2', dimensions: { height_mm: 190 }
  }]);
  assert.equal(report.evidence_bundles[0].conflicting_claims, true);
  assert.equal(report.evidence_bundles[0].evidence_level, 'SECONDARY_UNVERIFIED');
  assert.equal(report.evidence_bundles[0].workflow_status, 'NEEDS_RESEARCH');
});
