import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogueCandidates } from '../../scripts/hermes/catalogue-intelligence.mjs';

test('creates a review candidate for a verified new official product', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [] },
    discoveries: [{
      change_type: 'new_product',
      manufacturer: 'Fleetguard',
      part_number: 'FF-99999',
      product_family: 'fuel_filter',
      source_urls: ['https://example.com/official-product'],
      source_date: '2026-08-04',
      status: 'VERIFIED_OFFICIAL',
      environmental_impact: { waste_impact: 'extended service interval' }
    }]
  });
  assert.equal(report.dry_run, true);
  assert.equal(report.publication_enabled, false);
  assert.equal(report.candidates[0].status, 'VERIFIED_OFFICIAL');
  assert.equal(report.candidates[0].catalogue_comparison.exists, false);
});

test('detects catalogue differences without writing to production', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{ brand: 'WIX', part_number: '12345', applications: ['old'] }] },
    discoveries: [{
      change_type: 'application_update',
      manufacturer: 'WIX',
      part_number: '12-345',
      applications: ['old', 'new'],
      source_urls: ['https://example.com/application'],
      source_date: '2026-08-04'
    }]
  });
  assert.equal(report.candidates[0].catalogue_comparison.exists, true);
  assert.equal(report.candidates[0].catalogue_comparison.differences[0].field, 'applications');
  assert.equal(report.candidates[0].status, 'REVIEW_REQUIRED');
});

test('rejects a discovery when it produces no catalogue change', () => {
  const report = buildCatalogueCandidates({
    catalog: { products: [{ brand: 'Baldwin', part_number: 'B2', applications: ['A'] }] },
    discoveries: [{
      change_type: 'application_update',
      manufacturer: 'Baldwin',
      part_number: 'B2',
      applications: ['A'],
      source_urls: ['https://example.com/b2'],
      source_date: '2026-08-04'
    }]
  });
  assert.equal(report.candidates[0].status, 'REJECTED');
  assert.equal(report.candidates[0].rejection_reason, 'No catalogue change detected');
});

test('marks incomplete evidence as insufficient data', () => {
  const report = buildCatalogueCandidates({
    catalog: [],
    discoveries: [{ change_type: 'new_product', manufacturer: 'Cummins', part_number: 'X1' }]
  });
  assert.equal(report.candidates[0].status, 'INSUFFICIENT_DATA');
  assert.ok(report.candidates[0].validation_errors.includes('at least one source_url required'));
});

test('requires approval metadata before publication approval', () => {
  const report = buildCatalogueCandidates({
    catalog: [],
    discoveries: [{
      change_type: 'new_product',
      manufacturer: 'Donaldson',
      part_number: 'P999999',
      source_urls: ['https://example.com/p999999'],
      source_date: '2026-08-04',
      status: 'APPROVED_FOR_PUBLICATION'
    }]
  });
  assert.equal(report.candidates[0].status, 'INSUFFICIENT_DATA');
  assert.ok(report.candidates[0].validation_errors.includes('approval metadata required'));
});
