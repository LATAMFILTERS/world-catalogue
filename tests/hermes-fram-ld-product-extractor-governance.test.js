'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  EVIDENCE_LAYERS,
  APPLICATION_STATUS,
  CROSS_STATUS,
  normalizeLdApplicationEvidence,
  validateLdApplicationEvidence,
  canWriteConfirmedCross,
  canWriteConfirmedApplication
} = require('../lib/knowledge-governance/hermes-evidence-layer-registry');

test('LD product-page evidence remains Automotive private candidate evidence', () => {
  const record = normalizeLdApplicationEvidence({
    source_url: 'https://www.fram.com/example-product',
    source_snapshot_sha256: 'a'.repeat(64),
    source_retrieved_at: '2026-09-11T00:00:00.000Z',
    source_market_scope: 'source_catalog_scope_unverified',
    source_product_number: 'CF12345',
    application: { year_start: 2024, year_end: 2024, make: 'Example', model: 'Vehicle', engine: '2.0L' },
    application_status: APPLICATION_STATUS.CANDIDATE,
    cross_reference: { manufacturer: null, part_number: 'ABC123', relation_type: 'source_listed_cross' },
    cross_status: CROSS_STATUS.CANDIDATE,
    independent_validation_sources: []
  });

  assert.equal(record.evidence_layer, EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE);
  assert.equal(record.knowledge_domain, 'LIGHT_DUTY_KNOWLEDGE_DOMAIN');
  assert.equal(record.industry, 'Automotive');
  assert.equal(record.public_exposure_allowed, false);
  assert.equal(record.catalog_write_eligible, false);
  assert.equal(record.confirmed_cross_write_eligible, false);
  assert.equal(record.confirmed_application_write_eligible, false);
  assert.deepEqual(validateLdApplicationEvidence(record), { valid: true, errors: [] });
  assert.equal(canWriteConfirmedCross(record), false);
  assert.equal(canWriteConfirmedApplication(record), false);
});

test('FRAM LD extractor has no catalog mutation SQL', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../scripts/hermes/extract-fram-ld-product-evidence.mjs'), 'utf8');
  assert.match(source, /READ_ONLY_RECONCILIATION/);
  assert.match(source, /database_write:false/);
  assert.doesNotMatch(source, /\bINSERT\s+INTO\s+elimfilters_catalog\b/i);
  assert.doesNotMatch(source, /\bUPDATE\s+elimfilters_catalog\b/i);
  assert.doesNotMatch(source, /\bDELETE\s+FROM\s+elimfilters_catalog\b/i);
  assert.doesNotMatch(source, /confirmed_cross_auto_write:\s*true/i);
  assert.doesNotMatch(source, /confirmed_application_auto_write:\s*true/i);
});

test('validated application or cross cannot be asserted without independent validation source', () => {
  const base = {
    source_url: 'https://www.fram.com/example-product',
    source_snapshot_sha256: 'b'.repeat(64),
    source_product_number: 'CF12345'
  };
  const app = normalizeLdApplicationEvidence({ ...base, application_status: APPLICATION_STATUS.VALIDATED });
  const cross = normalizeLdApplicationEvidence({ ...base, cross_status: CROSS_STATUS.VALIDATED });
  assert.equal(validateLdApplicationEvidence(app).valid, false);
  assert.equal(validateLdApplicationEvidence(cross).valid, false);
});
