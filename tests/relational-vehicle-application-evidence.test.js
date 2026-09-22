'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyVerifiedRelationalVehicleApplications } = require('../lib/catalog-application-write-service');
const {
  AIR_CLOSURE,
  validateOfficialRows,
  validateOfficialInterchange,
  applicationsFromEvidence,
} = require('../scripts/hermes/close-isuzu-n-series-us-wix');

test('WIX 2022 N-Series evidence closes NPR-HD and NPR-XD without inventing plain NPR', () => {
  const rows = [
    {
      MakeModel: '2022 - ISUZU TRUCKS - N SERIES NPR-HD (On-Highway Trucks, Buses & Misc. Equip.)',
      Engine: 'NPR-HD - L4 5.2L 317 CID Turbo Diesel Isuzu (Turbo 4HK1TC Diesel )',
      PartNumber: '46932',
      FilterType: 'Air',
    },
    {
      MakeModel: '2022 - ISUZU TRUCKS - N SERIES NPR-XD (On-Highway Trucks, Buses & Misc. Equip.)',
      Engine: 'NPR-XD - L4 5.2L 317 CID Turbo Diesel Isuzu (Turbo 4HK1TC Diesel )',
      PartNumber: '46932',
      FilterType: 'Air',
    },
    {
      MakeModel: '2022 - ISUZU TRUCKS - N SERIES NPR-HD (On-Highway Trucks, Buses & Misc. Equip.)',
      Engine: 'NPR-HD - L4 5.2L 317 CID Turbo Diesel Isuzu (Turbo 4HK1TC Diesel )',
      PartNumber: '33128',
      FilterType: 'Fuel',
    },
  ];
  const checked = validateOfficialRows(rows);
  assert.equal(checked.plain_npr_observed, false);
  assert.deepEqual([...checked.byModel.keys()].sort(), ['NPR-HD', 'NPR-XD']);
  const apps = applicationsFromEvidence(checked);
  assert.deepEqual(apps.map(item => item.model), AIR_CLOSURE.expected_models);
  assert.equal(apps.every(item => item.engine === '4HK1-TC' && item.engine_displacement === '5.2L'), true);
});

test('official WIX interchange must explicitly tie Donaldson P543614 to WIX 46932', () => {
  const row = validateOfficialInterchange([{
    PartID: '129266',
    PartNumber: 'P543614',
    ChildPartNumber: '46932',
    Manufacturer: 'DONALDSON',
    Status: 'A'
  }]);
  assert.equal(row.PartNumber, AIR_CLOSURE.canonical_base);
  assert.equal(row.ChildPartNumber, AIR_CLOSURE.source_part_number);
  assert.throws(() => validateOfficialInterchange([{
    PartNumber: 'P543614',
    ChildPartNumber: 'OTHER',
    Manufacturer: 'DONALDSON'
  }]), /does not map/);
});

test('WIX evidence fails closed when one exact required model is absent', () => {
  assert.throws(() => validateOfficialRows([{
    MakeModel: '2022 - ISUZU TRUCKS - N SERIES NPR-HD (On-Highway Trucks, Buses & Misc. Equip.)',
    Engine: 'NPR-HD - L4 5.2L 317 CID Turbo Diesel Isuzu (Turbo 4HK1TC Diesel )',
    PartNumber: '46932',
    FilterType: 'Air',
  }]), /NPR-XD/);
});

test('relational writer records HD applications as EQUIPMENT evidence without certifying legacy JSONB', async () => {
  const evidenceInserts = [];
  const relationalWrites = [];
  const client = {
    async query(sql, params = []) {
      const text = String(sql);
      if (text.includes('SELECT sku,duty,codigo_base FROM elimfilters_catalog')) {
        return { rowCount: 1, rows: [{ sku: 'EA13614', duty: 'HEAVY_DUTY', codigo_base: 'P543614' }] };
      }
      if (text.startsWith('SELECT md5(')) return { rowCount: 1, rows: [{ hash: 'payloadhash' }] };
      if (text.includes('INSERT INTO ld_catalog.ld_vehicle_applications')) {
        relationalWrites.push(params);
        return { rowCount: 1, rows: [{ id: 501 + relationalWrites.length }] };
      }
      if (text.includes('INSERT INTO catalog_application_evidence')) {
        evidenceInserts.push(params);
        return { rowCount: 1, rows: [] };
      }
      throw new Error('unexpected query: '+text);
    }
  };

  const result = await applyVerifiedRelationalVehicleApplications(client, {
    sku: 'EA13614',
    source_sku: '46932',
    applications: [{
      market: 'US',
      make: 'ISUZU',
      platform: 'N-SERIES',
      model: 'NPR-HD',
      model_type: 'N-SERIES 5.2L TURBO DIESEL',
      year: 2022,
      engine: '4HK1-TC',
      engine_displacement: '5.2L',
      fuel_type: 'DIESEL',
      filter_position: 'AIR_PRIMARY',
      source_origin: 'WIX_US_OFFICIAL_VEHICLE_SEARCH',
    }],
    evidence: {
      authority: 'WIX FILTERS',
      source_url: 'https://m.wixfilters.com/search/SearchPartsByVehicle3?vehicleYear=2022&section=8&make=2153&model=85958&engine=136672',
      evidence_hash: 'sourcehash',
    },
  });

  assert.equal(result.application_kind, 'EQUIPMENT');
  assert.equal(result.verified_applications, 1);
  assert.equal(relationalWrites.length, 1);
  assert.equal(evidenceInserts.length, 2);
  assert.equal(evidenceInserts[0][1], 'EQUIPMENT');
  assert.equal(evidenceInserts[1][1], 'ENGINE');
  assert.equal(relationalWrites[0][3], 'NPR-HD');
  assert.equal(relationalWrites[0][17], 'AIR_PRIMARY');
});
