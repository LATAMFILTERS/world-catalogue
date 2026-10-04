'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildManufacturerIdentityRecord } = require('../lib/catalog-manufacturer-identity');

const migrationPath = path.join(__dirname, '..', 'scripts', 'migrations', 'run_213_hermes_separate_manufacturer_identity_priority.js');

function row(overrides = {}) {
  return {
    sku: 'EF91234', current_codigo_base: 'FF-1234', codigo_base: 'FF1234',
    governance_state: 'PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY',
    required_authority: 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE',
    ...overrides,
  };
}

function evidence(overrides = {}) {
  return {
    id: 17, evidence_kind: 'OFFICIAL_PRODUCT_SITEMAP',
    authority: 'FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP', manufacturer: 'FLEETGUARD',
    reference_code: 'FF1234', normalized_reference: 'FF1234',
    source_url: 'https://www.fleetguard.com/product/FF1234',
    evidence_hash: 'evidence-hash', verified_at: '2026-10-04T12:00:00.000Z',
    ...overrides,
  };
}

test('exact official Fleetguard code evidence verifies code identity without approving equivalence or Donaldson absence', () => {
  const result = buildManufacturerIdentityRecord(row(), evidence());
  assert.equal(result.verification_status, 'VERIFIED');
  assert.equal(result.payload.manufacturer, 'FLEETGUARD');
  assert.equal(result.payload.code, 'FF-1234');
  assert.equal(result.payload.canonical_elimfilters_identity, false);
  assert.equal(result.payload.equivalence_approved, false);
  assert.equal(result.payload.applications_approved, false);
  assert.equal(result.payload.publication_approved, false);
  assert.equal(result.payload.donaldson_absence_verified, false);
  assert.equal(result.payload.manufacturer_priority_status, 'PENDING');
  assert.equal(result.provenance.required_authority, 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE');
});

test('cross-reference, mismatched-code, and non-official evidence stay unverified', () => {
  for (const source of [
    evidence({ normalized_reference: 'OTHER1' }),
    evidence({ authority: 'CROSS_REFERENCE_ONLY' }),
    evidence({ source_url: 'https://example.com/product/FF1234' }),
    evidence({ evidence_kind: 'OFFICIAL_CROSS_REFERENCE' }),
  ]) {
    assert.equal(buildManufacturerIdentityRecord(row(), source).verification_status, 'REVIEW_REQUIRED');
  }
  assert.equal(buildManufacturerIdentityRecord(row(), null).verification_status, 'REVIEW_REQUIRED');
});

test('migration writes only the separate HERMES evidence axis and leaves queue priority untouched', () => {
  const source = fs.readFileSync(migrationPath, 'utf8');
  assert.match(source, /MANUFACTURER_IDENTITY/);
  assert.match(source, /INSERT INTO hermes_catalogue_evidence/i);
  assert.doesNotMatch(source, /UPDATE\s+(?:public\.)?elimfilters_catalog/i);
  assert.doesNotMatch(source, /UPDATE\s+(?:public\.)?catalog_codigo_base_sanitation_queue/i);
  assert.doesNotMatch(source, /UPDATE\s+(?:public\.)?catalog_identity_evidence/i);
});
