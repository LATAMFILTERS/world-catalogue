'use strict';

const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const MIGRATION = '115_CREATE_EF95112_FLEETGUARD_FF5112';
const APPLY = process.argv.includes('--apply');
const SKU = 'EF95112';
const SOURCE_CODE = 'FF5112';
const SOURCE_URL = 'https://www.fleetguard.com/product/FF5112';
const VERIFIED_AT = '2026-09-23T00:00:00.000Z';

function sha(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function sslFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  return ['127.0.0.1', 'localhost', '::1'].includes(host) ? false : { rejectUnauthorized: false };
}

const OEM_CODES = [
  ['CLARK EQUIPMENT','4155053'], ['CASE IH','1967093C1'],
  ['MERCEDES-BENZ','A0020921201'], ['MERCEDES-BENZ','A0010923201'],
  ['MERCEDES-BENZ','A0010922501'], ['MERCEDES-BENZ','A0010920501'],

  ['MERCEDES-BENZ','A0010920401'], ['MERCEDES-BENZ','A0000929501'],
  ['MERCEDES-BENZ','A0000929001'], ['MERCEDES-BENZ','929501'],
  ['MERCEDES-BENZ','929001'], ['MERCEDES-BENZ','20921201'],
  ['MERCEDES-BENZ','10922501'], ['MERCEDES-BENZ','10920501'],
  ['MERCEDES-BENZ','109204401'], ['MERCEDES-BENZ','10920401'],
  ['ORENSTEIN & KOPPEL','1449794'], ['ORENSTEIN & KOPPEL','1402608'],
  ['FORD','5014353'], ['NANNI DIESEL','622350'], ['NANNI DIESEL','970622350'],
  ['STILL','142340'], ['LANCER BOSS','D026840'],
  ['GENERAL MOTORS','9975337'], ['GENERAL MOTORS','25176758'],
].map(([manufacturer, code]) => ({
  manufacturer, code, classification: 'OEM', source_url: SOURCE_URL,
}));

const COMPETITOR_CODES = [
  ['FISPA','FNE314'], ['MULTIPART','VFF1006'], ['TRP DAF','1500528'],
  ['SAVARA','92826817'], ['GREYFRIARS','811S'], ['PERMATIC','GF270'],
  ['LOCKHEED','LK3224'], ['LOCKHEED','APF3224A'], ['LOCKHEED','AP3224'],
  ['BOSCH','9455160251'], ['BOSCH','1457434153'], ['BOSCH','1457434114'],
  ['BOSCH','1457434108'], ['BOSCH','1457434096'], ['BOSCH','1457434095'],
  ['CAV (LUCAS-CAV)','7176495'], ['CAV (LUCAS-CAV)','7111495'], ['CAV (LUCAS-CAV)','495'],
].map(([manufacturer, code]) => ({
  manufacturer, code, classification: 'AFTERMARKET', source_url: SOURCE_URL,
}));

const RAW_UNCERTAIN_REFS = [
  { manufacturer: 'ATLAS', code: 'GF502' },
  { manufacturer: 'MASTE', code: 'DK65F' },
];

const APPLICATIONS = [
  ['MERCEDES-BENZ','MB120','OM616','1990'],
  ['MERCEDES-BENZ','MB160','OM616','1990'],
  ['MERCEDES-BENZ','MB100D-KB','OM616','1990'],
  ['MERCEDES-BENZ','MB100D','OM615/ OM616','1988'],
  ['MERCEDES-BENZ','240D','SERIES W123 DIESEL','1988'],
  ['MERCEDES-BENZ','240GD','SERIES W123 DIESEL','1973'],
  ['MERCEDES-BENZ','309D','OM617',''],
  ['MERCEDES-BENZ','240D','',''],
  ['MERCEDES-BENZ','409D','OM617',''],
  ['MERCEDES-BENZ','220D','',''],
  ['MERCEDES-BENZ','UNSPECIFIED','OM617',''],
  ['MERCEDES-BENZ','0407D','OM617',''],
  ['MERCEDES-BENZ','300SD','',''],
  ['MERCEDES-BENZ','MB180D','OM616',''],
  ['MERCEDES-BENZ','300TD','',''],
  ['MERCEDES-BENZ','209D','OM617',''],
  ['MERCEDES-BENZ','240GD','',''],

  ['MERCEDES-BENZ','200D','',''],
  ['MERCEDES-BENZ','0409D','OM616',''],
  ['MERCEDES-BENZ','UNSPECIFIED','OM621',''],
  ['MERCEDES-BENZ','300D','',''],
  ['MERCEDES-BENZ','307D','OM616',''],
  ['MERCEDES-BENZ','0309D','OM616',''],
  ['MERCEDES-BENZ','0309D','OM617',''],
  ['MERCEDES-BENZ','0407D','OM616',''],
  ['MERCEDES-BENZ','UNSPECIFIED','OM616',''],
  ['MERCEDES-BENZ','300GD','',''],
  ['MERCEDES-BENZ','507D','OM616',''],
  ['MERCEDES-BENZ','207D','OM616',''],
  ['MERCEDES-BENZ','L407D','OM355LA',''],
  ['MERCEDES-BENZ','UNSPECIFIED','OM615',''],
  ['MERCEDES-BENZ','407D','OM616',''],
  ['MERCEDES-BENZ','0409D','OM617',''],
  ['MERCEDES-BENZ','240TD','',''],
  ['ADE','UNSPECIFIED','617','1984'],
  ['NANNI DIESEL','UNSPECIFIED','3.90HE',''],
  ['NANNI DIESEL','UNSPECIFIED','2.50HE',''],
  ['NANNI DIESEL','UNSPECIFIED','4.220HE',''],
  ['NANNI DIESEL','UNSPECIFIED','3.110HE',''],

  ['NANNI DIESEL','UNSPECIFIED','5.300T',''],
  ['NANNI DIESEL','UNSPECIFIED','5.3',''],
  ['NANNI DIESEL','UNSPECIFIED','5.280HE',''],
  ['NANNI DIESEL','UNSPECIFIED','4.24',''],
  ['NANNI DIESEL','UNSPECIFIED','4.200HE',''],
  ['NANNI DIESEL','UNSPECIFIED','6.280HE',''],
  ['NANNI DIESEL','UNSPECIFIED','3.75HE',''],
  ['NANNI DIESEL','UNSPECIFIED','2.40HE NM',''],
  ['NANNI DIESEL','UNSPECIFIED','4.195HE',''],
  ['NANNI DIESEL','UNSPECIFIED','4.150HE',''],
  ['NANNI DIESEL','UNSPECIFIED','4.190HE',''],
  ['NANNI DIESEL','UNSPECIFIED','2.40HE(14A)',''],
  ['AEBI','TP 57','OM 616',''],
  ['AEBI','TP 65','OM 616',''],
  ['AEBI','TP 67','OM 616',''],
].map(([make, model, engine, year]) => ({
  make,
  model,
  equipment: (make + ' ' + model).trim(),
  engine,
  year,
  qty_required: 1,
  source_brand: 'FLEETGUARD',
  source_code: SOURCE_CODE,
  source_url: SOURCE_URL,
}));

const SPECS = {
  thread_size: 'M14 X 1.5-6H INT',
  gasket_inside_diameter_mm: 62.53,
  gasket_outside_diameter_mm: 71.98,
  largest_outside_diameter_mm: 76.81,
  height_mm: 88.65,
  efficiency_test_standard: 'SAE J905',
  primary_particle_efficiency: '17.30 micron (c) @ 99%',
  media_type: 'Cellulose',
  standpipe: false,
  hydrostatic_burst_minimum_psi: 203,
  hydrostatic_burst_minimum_kpa: 1400,
  rated_flow_gpm: 0.84,
  rated_flow_l_min: 3.17,
  applicable_regions: [
    'North America','Europe','South America','South East Asia',
    'South Pacific','Mexico and Central America',
  ],
  raw_uncertain_cross_references: RAW_UNCERTAIN_REFS,
};

function governance() {
  return {
    policy_version: '2026-08-19-v3.1',
    state: 'CANONICAL_VERIFIED',
    required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
    primary_manufacturer_verified: false,
    donaldson_absence_verified: true,

    donaldson_absence_note: 'ELIMFILTERS operator-confirmed: Donaldson does not manufacture this filter; Fleetguard FF5112 is the approved commercial base.',
    fallback_manufacturer_verified: true,
    fallback_commercial_code_verified: true,
    approved_manufacturer: 'FLEETGUARD',
    approved_codigo_base: SOURCE_CODE,
    approved_source_column: 'COMPETITOR_CODES',
    current_codigo_base: SOURCE_CODE,
    verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
    evidence_url: SOURCE_URL,
    verified_at: VERIFIED_AT,
  };
}

function buildRow() {
  const evidencePayload = {
    sku: SKU,
    source_code: SOURCE_CODE,
    specs: SPECS,
    oem_codes: OEM_CODES,
    competitor_codes: COMPETITOR_CODES,
  };
  const evidenceHash = sha(evidencePayload);
  return {
    evidenceHash,
    row: {
      sku: SKU,
      codigo_base: SOURCE_CODE,
      name: 'Fuel Filter, Spin-On',
      description: 'ELIMFILTERS® EF95112 spin-on fuel filter. Canonical source: Fleetguard FF5112.',

      filter_type: 'fuel',
      sub_type: 'Fuel Filter, Spin-On',
      technology: 'SYNTAPORE™',
      installation_type: 'Spin-On',
      thread_size: SPECS.thread_size,
      height_mm: SPECS.height_mm,
      outer_diameter_mm: SPECS.largest_outside_diameter_mm,
      gasket_od_mm: SPECS.gasket_outside_diameter_mm,
      gasket_id_mm: SPECS.gasket_inside_diameter_mm,
      iso_test_method: SPECS.efficiency_test_standard,
      micron_rating: '17.30',
      nominal_efficiency: '99% @ 17.30 micron (c)',
      filter_media: SPECS.media_type,
      burst_pressure_psi: String(SPECS.hydrostatic_burst_minimum_psi),
      duty: 'HEAVY_DUTY',
      oem_codes: OEM_CODES,
      competitor_codes: COMPETITOR_CODES,
      equipment_applications: [],
      vehicle_applications: [],
      specs: SPECS,
      brand_crossrefs: {},
      alternative_products: [],
      alternatives: [],
      is_primary: true,
      product_length_mm: SPECS.height_mm,
      product_length_in: 3.49,
      product_dimensions_source: 'FLEETGUARD',
      product_dimensions_validation_status: 'VERIFIED',

      canonical_source_brand: 'FLEETGUARD',
      canonical_source_code: SOURCE_CODE,
      canonical_source_url: SOURCE_URL,
      canonical_source_status: 'VERIFIED',
      canonical_verified_at: VERIFIED_AT,
      canonical_evidence: {
        source: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        source_url: SOURCE_URL,
        evidence_hash: evidenceHash,
      },
      duty_source_brand: 'ELIMFILTERS_GOVERNANCE',
      duty_source_url: SOURCE_URL,
      duty_validation_status: 'VERIFIED',
      duty_verified_at: VERIFIED_AT,
      duty_evidence: {
        approved_family: 'EF9',
        approved_technology: 'SYNTAPORE™',
        base_rule: 'FLEETGUARD_LAST_4_WHEN_DONALDSON_NOT_MANUFACTURED',
      },
      enrichment_data: {
        codigo_base_governance: governance(),
        evidence_source: 'FLEETGUARD_FF5112_OFFICIAL',
      },
    },
  };
}

async function run() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const client = new Client({ connectionString: databaseUrl, ssl: sslFor(databaseUrl) });
  const report = {
    migration: MIGRATION,
    mode: APPLY ? 'apply' : 'dry-run',
    sku: SKU,
    inserted: false,
    application_count: 0,
  };

  await client.connect();
  try {
    await client.query('BEGIN');
    const legacy = await client.query(
      "SELECT count(*)::int n FROM public.elimfilters_catalog WHERE left(upper(sku),3)=ANY($1::text[])",
      [['EA5','EC5','EF5','EL5']]
    );
    if (legacy.rows[0].n !== 0) throw new Error('RETIRED_LD_PREFIX_ROWS_PRESENT');

    const existing = await client.query(
      'SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 OR codigo_base=$2 OR canonical_source_code=$2 FOR UPDATE',
      [SKU, SOURCE_CODE]
    );
    if (existing.rowCount) {
      throw new Error('SKU_OR_SOURCE_ALREADY_EXISTS ' + JSON.stringify(existing.rows));
    }

    const built = buildRow();
    const row = built.row;
    const validation = assertCanonicalWrite(row);
    report.gateway_validation = validation;

    if (APPLY) {
      const cols = Object.keys(row);
      const jsonCols = new Set([
        'oem_codes','competitor_codes','equipment_applications','vehicle_applications',
        'specs','brand_crossrefs','alternative_products','alternatives',
        'canonical_evidence','duty_evidence','enrichment_data',
      ]);
      const vals = cols.map((key) => jsonCols.has(key) ? JSON.stringify(row[key]) : row[key]);
      const placeholders = cols.map((key, index) =>
        '$' + (index + 1) + (jsonCols.has(key) ? '::jsonb' : '')
      );
      const insertSql =
        'INSERT INTO public.elimfilters_catalog (' +
        cols.map((key) => '"' + key + '"').join(',') +
        ') VALUES (' + placeholders.join(',') + ') RETURNING sku';
      const inserted = await client.query(insertSql, vals);
      if (inserted.rowCount !== 1) throw new Error('CATALOG_INSERT_FAILED');
      report.inserted = true;

      await client.query(
        "INSERT INTO catalog_codigo_base_evidence " +
        "(sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) " +
        "VALUES ($1,'OFFICIAL_PRODUCT_PAGE','FLEETGUARD','FLEETGUARD',$2,$2,$3,$4,$5,$6::jsonb) " +
        "ON CONFLICT DO NOTHING",
        [SKU, SOURCE_CODE, SOURCE_URL, built.evidenceHash, VERIFIED_AT,
          JSON.stringify({ migration: MIGRATION, source: 'Fleetguard official FF5112 page' })]
      );

      const appResult = await applyVerifiedApplications(client, {
        sku: SKU,
        equipment_applications: APPLICATIONS,
        vehicle_applications: [],
        evidence: {
          authority: 'FLEETGUARD_OFFICIAL',
          source_url: SOURCE_URL,
          evidence_hash: sha(APPLICATIONS),
          metadata: {
            source_code: SOURCE_CODE,
            migration: MIGRATION,
            qty_required_default: 1,
          },
        },
      });
      report.application_count = APPLICATIONS.length;
      report.application_write = appResult;

      await client.query('SELECT refresh_crossref_cache_sku($1)', [SKU]);
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }

    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    return report;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run()
    .then((report) => console.log('[ef95112-ff5112]', JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error('[ef95112-ff5112] failed', error.stack || error.message);
      process.exit(1);
    });
}

module.exports = {
  MIGRATION,
  SKU,
  SOURCE_CODE,
  SOURCE_URL,
  OEM_CODES,
  COMPETITOR_CODES,
  RAW_UNCERTAIN_REFS,
  APPLICATIONS,
  SPECS,
  buildRow,
  run,
};
