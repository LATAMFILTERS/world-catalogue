'use strict';

/**
 * Applies verified OFFICIAL unit-packaged measurements by codigo_base.
 * Product dimensions remain separate from packaged dimensions.
 * Existing values are preserved. OEM/cross-reference/enrichment fields and
 * governed identity columns are never touched. units_per_case and master
 * carton values require separate derived/plant-confirmed evidence.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATION = '101_DONALDSON_UNIT_PACKAGING_APPLY_V3';
const RESULTS_FILE = process.env.DONALDSON_CRM_RESULTS || path.join(__dirname, '..', 'donaldson_crm_results.jsonl');

const PACKAGED_FIELDS = [
  'unit_packaged_length_cm',
  'unit_packaged_width_cm',
  'unit_packaged_height_cm',
  'unit_packaged_weight_kg',
  'unit_packaged_volume_m3',
];

function entries() {
  const best = new Map();
  for (const line of fs.readFileSync(RESULTS_FILE, 'utf8').split(/\r?\n/).filter(Boolean)) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.status !== 'OK' || !e.codigo_base || !e.source_url || !e.metric) continue;
    if (!PACKAGED_FIELDS.some((field) => e.metric[field] != null)) continue;
    best.set(String(e.codigo_base).trim().toUpperCase(), e);
  }
  return [...best.values()];
}

function hasCompletePackagedDimensions(metric) {
  return PACKAGED_FIELDS.every((field) => metric[field] != null);
}

async function ensureSchema(client) {
  await client.query(`
    ALTER TABLE elimfilters_catalog
      ADD COLUMN IF NOT EXISTS unit_packaged_length_cm numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_width_cm numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_height_cm numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_weight_kg numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_volume_m3 numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_length_ft numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_width_ft numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_height_ft numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_weight_lb numeric,
      ADD COLUMN IF NOT EXISTS unit_packaged_volume_ft3 numeric
  `);
}

async function apply() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const dryRun = !process.argv.includes('--apply');
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    dry_run: dryRun,
    candidates: 0,
    matching_rows: 0,
    updated_rows: 0,
    complete_packaged_dimensions: 0,
    partial_packaged_dimensions: 0,
    skipped: [],
  };

  try {
    await client.query('BEGIN');
    await ensureSchema(client);

    for (const e of entries()) {
      report.candidates++;
      const code = String(e.codigo_base).trim().toUpperCase();
      const complete = hasCompletePackagedDimensions(e.metric);
      if (complete) report.complete_packaged_dimensions++;
      else report.partial_packaged_dimensions++;

      const count = await client.query(
        `SELECT count(*)::int n FROM elimfilters_catalog WHERE duty='HD' AND upper(trim(codigo_base))=$1`,
        [code]
      );
      const n = count.rows[0].n;
      report.matching_rows += n;
      if (!n) {
        report.skipped.push({ codigo_base: code, reason: 'NO_HD_MATCH' });
        continue;
      }
      if (dryRun) continue;

      const status = complete ? 'FULL_UNIT_PACKAGED_OFFICIAL' : 'PARTIAL_UNIT_PACKAGED_OFFICIAL';
      const notes = 'Official Donaldson product page: unit packaged measurements from Packaged Dimensions. Product dimensions are stored separately. Master-carton quantities/dimensions and units_per_case are not asserted by this source.';

      const r = await client.query(`
        UPDATE elimfilters_catalog SET
          unit_packaged_length_cm = COALESCE(unit_packaged_length_cm,$1),
          unit_packaged_width_cm = COALESCE(unit_packaged_width_cm,$2),
          unit_packaged_height_cm = COALESCE(unit_packaged_height_cm,$3),
          unit_packaged_weight_kg = COALESCE(unit_packaged_weight_kg,$4),
          unit_packaged_volume_m3 = COALESCE(unit_packaged_volume_m3,$5),
          unit_packaged_length_ft = COALESCE(unit_packaged_length_ft,$6),
          unit_packaged_width_ft = COALESCE(unit_packaged_width_ft,$7),
          unit_packaged_height_ft = COALESCE(unit_packaged_height_ft,$8),
          unit_packaged_weight_lb = COALESCE(unit_packaged_weight_lb,$9),
          unit_packaged_volume_ft3 = COALESCE(unit_packaged_volume_ft3,$10),
          packaging_source = COALESCE(packaging_source,'OFFICIAL_SOURCE_SCRAPE'),
          packaging_source_url = COALESCE(packaging_source_url,$11),
          packaging_validated_at = COALESCE(packaging_validated_at,$12::timestamptz),
          packaging_validation_status = CASE
            WHEN $13 = 'FULL_UNIT_PACKAGED_OFFICIAL' THEN 'FULL_UNIT_PACKAGED_OFFICIAL'
            ELSE COALESCE(packaging_validation_status,$13)
          END,
          packaging_notes = COALESCE(packaging_notes,$14)
        WHERE duty='HD' AND upper(trim(codigo_base))=$15
      `, [
        e.metric.unit_packaged_length_cm,
        e.metric.unit_packaged_width_cm,
        e.metric.unit_packaged_height_cm,
        e.metric.unit_packaged_weight_kg,
        e.metric.unit_packaged_volume_m3,
        e.metric.unit_packaged_length_ft,
        e.metric.unit_packaged_width_ft,
        e.metric.unit_packaged_height_ft,
        e.metric.unit_packaged_weight_lb,
        e.metric.unit_packaged_volume_ft3,
        e.source_url,
        e.scraped_at,
        status,
        notes,
        code,
      ]);
      report.updated_rows += r.rowCount;
    }

    if (dryRun) await client.query('ROLLBACK');
    else await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  apply()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { MIGRATION, apply, entries, hasCompletePackagedDimensions };
