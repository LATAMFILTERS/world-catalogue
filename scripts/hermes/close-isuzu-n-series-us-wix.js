#!/usr/bin/env node
'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const { applyVerifiedRelationalVehicleApplications } = require('../../lib/catalog-application-write-service');
const { resolveBrandSearchEngines } = require('../../lib/hermes-brand-search-router');

const wixRoute = resolveBrandSearchEngines('WIX', { market: 'US', capability: 'vehicle_to_filter' });
if (!wixRoute.matched || !wixRoute.engines[0]) throw new Error('WIX specialized search engine is not configured');
const wixEngine = wixRoute.engines[0];
const wixPartsEndpoint = wixEngine.endpoints?.parts;
if (!wixPartsEndpoint) throw new Error('WIX specialized vehicle application endpoint is not configured');

function renderEndpoint(template, values) {
  return String(template).replace(/\{([a-z_]+)\}/gi, (_, key) => encodeURIComponent(values[key] ?? ''));
}

const SOURCE = Object.freeze({
  authority: 'WIX FILTERS',
  search_engine_id: wixEngine.id,
  search_engine_type: wixEngine.type,
  section: 8,
  year: 2022,
  make_id: 2153,
  model_id: 85958,
  engine_id: 136672,
  url: wixEngine.base_url + renderEndpoint(wixPartsEndpoint, {
    section: 8,
    year: 2022,
    make_id: 2153,
    model_id: 85958,
    engine_id: 136672,
  }),
  interchange_url: wixEngine.base_url + '/Search/InterchangeSearch?partnumber=P543614',
});

const AIR_CLOSURE = Object.freeze({
  source_part_number: '46932',
  canonical_base: 'P543614',
  elimfilters_sku: 'EA13614',
  filter_position: 'AIR_PRIMARY',
  expected_models: ['NPR-HD', 'NPR-XD'],
});

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalJson(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(
    typeof value === 'string' ? value : JSON.stringify(canonicalJson(value))
  ).digest('hex');
}

function sslFor(connectionString) {
  return /(?:localhost|127\.0\.0\.1)/i.test(String(connectionString || ''))
    ? false
    : { rejectUnauthorized: false };
}

function modelFromMakeModel(value) {
  const text = String(value || '');
  const match = text.match(/N SERIES\s+(NPR-HD|NPR-XD|NPR|NQR|NRR)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function validateOfficialRows(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('WIX official application response is empty');
  const exact = rows.filter(row =>
    String(row.PartNumber || '').toUpperCase() === AIR_CLOSURE.source_part_number &&
    String(row.FilterType || '').trim().toUpperCase() === 'AIR' &&
    /2022\s*-\s*ISUZU TRUCKS\s*-\s*N SERIES/i.test(String(row.MakeModel || '')) &&
    /5\.2L/i.test(String(row.Engine || '')) &&
    /4HK1TC/i.test(String(row.Engine || ''))
  );

  const byModel = new Map(exact.map(row => [modelFromMakeModel(row.MakeModel), row]).filter(([model]) => model));
  for (const model of AIR_CLOSURE.expected_models) {
    if (!byModel.has(model)) throw new Error(`WIX exact application missing for ${model}`);
  }

  const unexpectedNpr = exact.find(row => modelFromMakeModel(row.MakeModel) === 'NPR');
  return {
    exact,
    byModel,
    plain_npr_observed: Boolean(unexpectedNpr),
  };
}

function validateOfficialInterchange(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('WIX official interchange response is empty');
  const exact = rows.find(row =>
    String(row.PartNumber || '').toUpperCase() === AIR_CLOSURE.canonical_base &&
    String(row.ChildPartNumber || '').toUpperCase() === AIR_CLOSURE.source_part_number &&
    String(row.Manufacturer || '').toUpperCase() === 'DONALDSON'
  );
  if (!exact) {
    throw new Error(`WIX official interchange does not map ${AIR_CLOSURE.canonical_base} to ${AIR_CLOSURE.source_part_number}`);
  }
  return exact;
}

async function fetchOfficialEvidence() {
  const headers = { 'user-agent': 'ELIMFILTERS-HERMES-APPLICATION-CLOSURE/1.0' };
  const [applicationResponse, interchangeResponse] = await Promise.all([
    fetch(SOURCE.url, { headers, redirect: 'follow' }),
    fetch(SOURCE.interchange_url, { headers, redirect: 'follow' }),
  ]);
  if (!applicationResponse.ok) throw new Error(`WIX application source HTTP ${applicationResponse.status}`);
  if (!interchangeResponse.ok) throw new Error(`WIX interchange source HTTP ${interchangeResponse.status}`);
  const [rows, interchangeRows] = await Promise.all([
    applicationResponse.json(),
    interchangeResponse.json(),
  ]);
  const checked = validateOfficialRows(rows);
  const interchange = validateOfficialInterchange(interchangeRows);
  return {
    rows,
    interchange_rows: interchangeRows,
    source_hash: sha256({ applications: rows, interchange: interchangeRows }),
    checked,
    interchange,
  };
}

function applicationsFromEvidence(checked) {
  return AIR_CLOSURE.expected_models.map(model => {
    const row = checked.byModel.get(model);
    return {
      source_sku: AIR_CLOSURE.source_part_number,
      source_origin: 'WIX_US_OFFICIAL_VEHICLE_SEARCH',
      market: 'US',
      make: 'ISUZU',
      platform: 'N-SERIES',
      model,
      model_type: 'N-SERIES 5.2L TURBO DIESEL',
      model_variant: model,
      year: SOURCE.year,
      engine: '4HK1-TC',
      engine_displacement: '5.2L',
      fuel_type: 'DIESEL',
      filter_position: AIR_CLOSURE.filter_position,
      source_make_model: row.MakeModel,
      source_engine: row.Engine,
    };
  });
}

async function closeAirApplications({ apply = false } = {}) {
  const evidence = await fetchOfficialEvidence();
  const applications = applicationsFromEvidence(evidence.checked);
  const report = {
    outcome: apply ? 'PENDING_TRANSACTION' : 'DRY_RUN',
    source: SOURCE,
    source_hash: evidence.source_hash,
    source_part_number: AIR_CLOSURE.source_part_number,
    canonical_base: AIR_CLOSURE.canonical_base,
    interchange_verified: true,
    elimfilters_sku: AIR_CLOSURE.elimfilters_sku,
    exact_models: applications.map(item => item.model),
    plain_npr_observed: evidence.checked.plain_npr_observed,
    applications,
    database_write: false,
  };

  if (!apply) return report;
  if (String(process.env.HERMES_CATALOGUE_PUBLISH_LIVE || '').toLowerCase() !== 'true') {
    throw new Error('HERMES_CATALOGUE_PUBLISH_LIVE=true is required');
  }

  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: sslFor(databaseUrl), max: 1 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");

    const result = await applyVerifiedRelationalVehicleApplications(client, {
      sku: AIR_CLOSURE.elimfilters_sku,
      source_sku: AIR_CLOSURE.source_part_number,
      applications,
      evidence: {
        authority: SOURCE.authority,
        source_url: SOURCE.url,
        evidence_hash: evidence.source_hash,
        metadata: {
          source_type: 'official_filter_manufacturer_vehicle_application',
          market: 'US',
          source_section: SOURCE.section,
          source_year: SOURCE.year,
          source_make_id: SOURCE.make_id,
          source_model_id: SOURCE.model_id,
          source_engine_id: SOURCE.engine_id,
          source_part_number: AIR_CLOSURE.source_part_number,
          canonical_base: AIR_CLOSURE.canonical_base,
          interchange_source_url: SOURCE.interchange_url,
          interchange_manufacturer: evidence.interchange.Manufacturer,
          interchange_parent_part: evidence.interchange.PartNumber,
          interchange_child_part: evidence.interchange.ChildPartNumber,
          source_filter_type: 'Air',
        },
      },
    });

    await client.query('COMMIT');
    return {
      ...report,
      outcome: 'VERIFIED_APPLICATIONS_WRITTEN',
      database_write: true,
      result,
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  closeAirApplications({ apply: process.argv.includes('--apply') })
    .then(report => console.log(JSON.stringify(report, null, 2)))
    .catch(error => {
      console.error('[isuzu-n-series-us-wix-closure] failed', error);
      process.exit(1);
    });
}

module.exports = {
  SOURCE,
  AIR_CLOSURE,
  canonicalJson,
  sha256,
  modelFromMakeModel,
  validateOfficialRows,
  validateOfficialInterchange,
  applicationsFromEvidence,
  fetchOfficialEvidence,
  closeAirApplications,
};
