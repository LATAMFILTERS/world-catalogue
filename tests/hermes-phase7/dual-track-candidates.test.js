import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDualTrackCandidates } from '../../scripts/hermes/dual-track-candidates.mjs';

const official = { discoveries: [{
  evidence_id: 'OFFICIAL_1', evidence_level: 'PRIMARY', workflow_status: 'PENDING_REVIEW',
  source_type: 'oem_catalogue', source_url: 'https://www.volvotrucks.com/filter', source_hash: 'a'.repeat(64),
  organization_name: 'Volvo Trucks', captured_at: '2026-08-11T00:00:00.000Z', change_type: 'application_update',
  manufacturer: 'Volvo', part_number: '21707132', product_family: 'oil_filter',
  applications: [{ make: 'Volvo', model: 'VNL', engine: 'D13' }], dimensions: {}, technical_specs: {},
  cross_references: [], confidence: 'high'
}] };

test('creates linked knowledge and catalogue candidates from one official source', () => {
  const report = buildDualTrackCandidates({ officialEvidence: official, generatedAt: '2026-08-11T00:00:00.000Z' });
  assert.equal(report.summary.linked_bundles, 1);
  const bundle = report.bundles[0];
  assert.equal(bundle.knowledge_candidate.research_bundle_id, bundle.catalogue_candidate.research_bundle_id);
  assert.equal(bundle.knowledge_candidate.evidence_level, 'PRIMARY');
  assert.equal(bundle.catalogue_candidate.status, 'VERIFIED_OFFICIAL');
  assert.equal(bundle.catalogue_candidate.publication_enabled, false);
  assert.equal(report.publication_enabled, false);
});

test('marketplace-only unverified evidence stays research on both tracks', () => {
  const marketplaceEvidence = { evidence_bundles: [{
    evidence_id: 'MKT_1', manufacturer: 'MANN', part_number: 'W95026', evidence_level: 'SECONDARY_UNVERIFIED',
    workflow_status: 'NEEDS_RESEARCH', conflicting_claims: false,
    listings: [{ url: 'https://www.ebay.com/itm/1', captured_at: '2026-08-11T00:00:00.000Z', applications: [], dimensions: {}, cross_references: ['LF9009'] }]
  }] };
  const bundle = buildDualTrackCandidates({ marketplaceEvidence }).bundles[0];
  assert.equal(bundle.knowledge_candidate.workflow_status, 'NEEDS_RESEARCH');
  assert.equal(bundle.catalogue_candidate.status, 'INSUFFICIENT_DATA');
  assert.equal(bundle.catalogue_candidate.evidence_level, 'SECONDARY_UNVERIFIED');
});

test('bundle identifiers are deterministic for idempotent retries', () => {
  const first = buildDualTrackCandidates({ officialEvidence: official }).bundles[0].research_bundle_id;
  const second = buildDualTrackCandidates({ officialEvidence: official }).bundles[0].research_bundle_id;
  assert.equal(first, second);
});
