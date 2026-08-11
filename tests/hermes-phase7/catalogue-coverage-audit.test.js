import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogueCoverageAudit, extractCatalogueManufacturers, normalizeManufacturer } from '../../scripts/hermes/catalogue-coverage-audit.mjs';

test('normalizes corporate suffixes without merging unrelated brands', () => {
  assert.equal(normalizeManufacturer('Toyota Motor Corporation'), 'TOYOTA');
  assert.equal(normalizeManufacturer('MANN+HUMMEL'), 'MANN HUMMEL');
  assert.notEqual(normalizeManufacturer('MAN Truck & Bus'), normalizeManufacturer('MANN+HUMMEL'));
});

test('extracts manufacturers from applications and cross references', () => {
  const result = extractCatalogueManufacturers([{ sku: 'EA30001', applications: [{ make: 'Ferrari' }], oem_codes: [{ manufacturer: 'Ferrari' }] }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].normalized, 'FERRARI');
  assert.equal(result[0].sku_count, 1);
  assert.deepEqual(result[0].sample_skus, ['EA30001']);
});

test('classifies exact, possible-parent and missing manufacturers without writes', () => {
  const report = buildCatalogueCoverageAudit({
    generatedAt: '2026-08-11T00:00:00.000Z',
    products: [
      { sku: 'A', applications: [{ make: 'Toyota' }] },
      { sku: 'B', applications: [{ make: 'Porsche' }] },
      { sku: 'C', applications: [{ make: 'Ferrari' }] }
    ],
    organizations: [
      { id: 'toyota', name: 'Toyota Motor Corporation', parent_company: null, notes: '' },
      { id: 'volkswagen_group', name: 'Volkswagen Group', parent_company: null, notes: 'VW/Audi/SEAT/Skoda/Porsche.' }
    ]
  });
  assert.equal(report.summary.exact_registry_matches, 1);
  assert.equal(report.summary.possible_parent_or_alias_matches, 1);
  assert.equal(report.summary.missing_from_registry, 1);
  assert.equal(report.possible_matches[0].normalized, 'PORSCHE');
  assert.equal(report.missing_manufacturers[0].normalized, 'FERRARI');
  assert.equal(report.database_write, false);
});
