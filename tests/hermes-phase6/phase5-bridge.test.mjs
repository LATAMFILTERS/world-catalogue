import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertPhase5Candidate,
  buildDiscoveryEnvelope
} from '../../scripts/hermes/phase5-to-catalogue-discoveries.mjs';

function phase5Candidate(overrides = {}) {
  return {
    entity_type: 'intelligence_candidate',
    entity_code: 'HERMES_REAL_OEM_ABC12345',
    workflow_status: 'PENDING_REVIEW',
    source_url: 'https://official.example-oem.com/catalogue/part-123',
    source_publisher: 'Example OEM',
    source_title: 'Official product bulletin',
    captured_at: '2026-08-05T20:00:00.000Z',
    evidence_level: 'PRIMARY',
    claim_scope: 'SOURCE_REPORTED',
    source_hash: 'abc123',
    deduplication_key: 'real-oem-abc123',
    catalogue_discovery: {
      change_type: 'new_product',
      manufacturer: 'Example OEM',
      part_number: 'P-123',
      source_date: '2026-08-05T00:00:00.000Z',
      product_family: 'fuel_filter'
    },
    ...overrides
  };
}

test('converts structured official Phase 5 evidence into a Phase 6 discovery', () => {
  const { discovery, reason } = convertPhase5Candidate(phase5Candidate());
  assert.equal(reason, null);
  assert.equal(discovery.manufacturer, 'Example OEM');
  assert.equal(discovery.part_number, 'P-123');
  assert.equal(discovery.status, 'VERIFIED_OFFICIAL');
  assert.equal(discovery.approval, null);
  assert.deepEqual(discovery.source_urls, ['https://official.example-oem.com/catalogue/part-123']);
});

test('does not invent catalogue facts from a generic page-change candidate', () => {
  const candidate = phase5Candidate();
  delete candidate.catalogue_discovery;
  const { discovery, reason } = convertPhase5Candidate(candidate);
  assert.equal(discovery, null);
  assert.equal(reason, 'structured_catalogue_discovery_required');
});

test('rejects legacy test and placeholder discovery data', () => {
  const { discovery, reason } = convertPhase5Candidate(phase5Candidate({
    source_url: 'https://example.com/test',
    catalogue_discovery: {
      change_type: 'new_product',
      manufacturer: 'TEST MANUFACTURER',
      part_number: 'TEST-0001',
      source_date: '2026-08-05T00:00:00.000Z'
    }
  }));
  assert.equal(discovery, null);
  assert.equal(reason, 'placeholder_data_rejected');
});

test('keeps publication disabled and deduplicates discoveries', () => {
  const candidate = phase5Candidate();
  const envelope = buildDiscoveryEnvelope([candidate, candidate]);
  assert.equal(envelope.dry_run, true);
  assert.equal(envelope.publication_enabled, false);
  assert.equal(envelope.discoveries.length, 1);
  assert.equal(envelope.skipped[0].reason, 'duplicate_discovery');
});

test('downgrades non-primary evidence to review required', () => {
  const { discovery } = convertPhase5Candidate(phase5Candidate({
    evidence_level: 'SECONDARY_VERIFIED'
  }));
  assert.equal(discovery.status, 'REVIEW_REQUIRED');
});
