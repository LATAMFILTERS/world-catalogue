'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { searchByApplication } = require('../lib/bot-protocol-catalog');
const { extractApplicationEntities } = require('../lib/bot-protocol-unified-orchestrator');
const { parseVehicleSearchText } = require('../lib/vehicle-application-normalizer');

test.afterEach(() => __setProtocolPoolForTests(null));

test('model-only NPR search resolves the unique US Isuzu model namespace without widening to NPR-HD', () => {
  const result = parseVehicleSearchText('filtro de aire NPR 2022 motor 5.2', 'US');
  assert.equal(result.matched, true);
  assert.equal(result.make, 'ISUZU');
  assert.equal(result.model, 'NPR');
  assert.equal(result.year, 2022);
  assert.equal(result.engine, '5.2L');
  assert.equal(result.make_inferred_from_unique_model, true);
});

test('NPR-HD conversational lookup keeps the exact model variant', () => {
  const result = parseVehicleSearchText('filtro de aire para Isuzu NPR HD 2022 5.2L', 'US');
  assert.equal(result.make, 'ISUZU');
  assert.equal(result.model, 'NPR-HD');
  assert.equal(result.year, 2022);
  assert.equal(result.engine, '5.2L');
});

test('Chevrolet 4500 is not inferred as Isuzu', () => {
  const result = parseVehicleSearchText('Chevrolet 4500 HD 2022 5.2L', 'US');
  assert.equal(result.matched, false);
});

test('unified bot extracts canonical Isuzu vehicle entities', () => {
  const result = extractApplicationEntities('Necesito filtro de aire para un NPR HD 2022 motor 5.2');
  assert.equal(result.brand, 'ISUZU');
  assert.equal(result.model, 'NPR-HD');
  assert.equal(result.engine, '5.2L');
  assert.equal(result.year, 2022);
  assert.deepEqual(result.tokens, ['ISUZU', 'NPR-HD', '5.2L']);
  assert.equal(result.vehicleContext.matched, true);
});

test('verified vehicle lookup uses exact relational evidence and filters by system', async () => {
  let capturedSql = '';
  let capturedParams = null;
  __setProtocolPoolForTests({
    connect: async () => ({
      async query(sql, params = []) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
        capturedSql = text;
        capturedParams = params;
        return {
          rows: [
            {
              id: 1,
              sku: 'EA_TEST',
              codigo_base: 'P_TEST',
              duty: 'HEAVY_DUTY',
              filter_type: 'Air Filter',
              equipment_applications: [],
              vehicle_applications: [],
              oem_codes: [],
              competitor_codes: [],
              brand_crossrefs: {},
              specs: {},
              enrichment_data: {},
              is_primary: true
            },
            {
              id: 2,
              sku: 'EC_TEST',
              codigo_base: 'C_TEST',
              duty: 'LIGHT_DUTY',
              filter_type: 'Cabin Air Filter',
              equipment_applications: [],
              vehicle_applications: [],
              oem_codes: [],
              competitor_codes: [],
              brand_crossrefs: {},
              specs: {},
              enrichment_data: {},
              is_primary: false
            }
          ]
        };
      },
      release() {}
    })
  });

  const vehicleContext = parseVehicleSearchText('Isuzu NPR-HD 2022 5.2L', 'US');
  const result = await searchByApplication(['ISUZU', 'NPR-HD', '5.2L'], 2022, 'air', vehicleContext);

  assert.equal(result.lookupStatus, 'completed');
  assert.equal(result.applicationScope, 'VERIFIED_RELATIONAL_VEHICLE');
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].sku, 'EA_TEST');
  assert.match(capturedSql, /ld_catalog\.ld_vehicle_applications/);
  assert.match(capturedSql, /evidence_status = 'VERIFIED'/);
  assert.match(capturedSql, /catalog_application_evidence/);
  assert.deepEqual(capturedParams, ['ISUZU', 'NPRHD', 2022, '%52L%']);
});

test('generic NPR does not silently widen to NPR-HD', async () => {
  let capturedParams = null;
  __setProtocolPoolForTests({
    connect: async () => ({
      async query(sql, params = []) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
        capturedParams = params;
        return { rows: [] };
      },
      release() {}
    })
  });

  const vehicleContext = parseVehicleSearchText('NPR 2022 motor 5.2', 'US');
  const result = await searchByApplication(['ISUZU', 'NPR', '5.2L'], 2022, 'air', vehicleContext);
  assert.equal(vehicleContext.model, 'NPR');
  assert.equal(result.products.length, 0);
  assert.equal(capturedParams[1], 'NPR');
});

test('legacy equipment lookup remains backward compatible and does not claim vehicle verification', async () => {
  let capturedSql = '';
  __setProtocolPoolForTests({
    connect: async () => ({
      async query(sql) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
        capturedSql = text;
        return { rows: [] };
      },
      release() {}
    })
  });

  const result = await searchByApplication(['MACK', 'MP8'], null, null, null);
  assert.equal(result.lookupStatus, 'completed');
  assert.equal(result.applicationScope, 'EQUIPMENT');
  assert.match(capturedSql, /equipment_applications::text/);
  assert.doesNotMatch(capturedSql, /vehicle_verified/);
});
