import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot, normalizeCatalogueRow, exportCatalogueSnapshot } from '../../scripts/hermes/export-catalogue-snapshot.mjs';

test('normalizes canonical elimfilters_catalog fields for catalogue intelligence', () => {
  const product = normalizeCatalogueRow({
    sku: 'EA50090',
    duty: 'HEAVY_DUTY',
    filter_type: 'AIR_FILTER',
    vehicle_applications: [{ make: 'MACK', model: 'MP8' }],
    equipment_applications: [],
    oem_codes: [{ manufacturer: 'MACK', code: 'C30090' }],
    competitor_codes: [{ manufacturer: 'MANN', code: 'C 30 090' }],
    dimensions: { height_mm: 300 }
  });

  assert.equal(product.part_number, 'EA50090');
  assert.equal(product.product_family, 'AIR_FILTER');
  assert.equal(product.applications.length, 1);
  assert.equal(product.cross_references.length, 2);
});

test('builds a deterministic read-only snapshot envelope', () => {
  const rows = [{ sku: 'EF10001', filter_type: 'FUEL_FILTER' }];
  const first = buildSnapshot(rows);
  const second = buildSnapshot(rows);

  assert.equal(first.read_only, true);
  assert.equal(first.publication_enabled, false);
  assert.equal(first.row_count, 1);
  assert.equal(first.sha256, second.sha256);
});

test('opens a read-only transaction and never issues mutating SQL', async () => {
  const queries = [];
  const fakePool = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (String(sql).includes('FROM elimfilters_catalog')) {
        return { rows: [{ sku: 'EL30001', filter_type: 'OIL_FILTER' }] };
      }
      return { rows: [] };
    },
    async end() {}
  };

  const originalMkdir = await import('node:fs');
  const result = await exportCatalogueSnapshot({
    connectionString: 'postgres://readonly:test@localhost/catalogue',
    outputDir: 'hermes/test-output/catalogue-snapshots',
    limit: 1,
    poolFactory: () => fakePool
  });

  assert.equal(result.snapshot.row_count, 1);
  assert.equal(queries[0].sql, 'BEGIN READ ONLY');
  assert.ok(queries.some((entry) => entry.sql.includes('SELECT')));
  assert.ok(queries.some((entry) => entry.sql === 'COMMIT'));
  assert.equal(queries.some((entry) => /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|TRUNCATE)\b/i.test(entry.sql)), false);
  assert.equal(originalMkdir.existsSync(result.output), true);
  originalMkdir.rmSync('hermes/test-output', { recursive: true, force: true });
});
