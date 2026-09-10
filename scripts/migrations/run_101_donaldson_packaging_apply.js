'use strict';

/**
 * Applies only verified OFFICIAL unit-packaged measurements by codigo_base.
 * Existing values are preserved. OEM/cross-reference/enrichment fields and
 * governed identity columns are never touched. units_per_case and master
 * carton values require separate derived/plant-confirmed evidence.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATION = '101_DONALDSON_UNIT_PACKAGING_APPLY_V2';
const RESULTS_FILE = process.env.DONALDSON_CRM_RESULTS || path.join(__dirname, '..', 'donaldson_crm_results.jsonl');

function entries() {
  const best = new Map();
  for (const line of fs.readFileSync(RESULTS_FILE, 'utf8').split(/\r?\n/).filter(Boolean)) {
    let e; try { e = JSON.parse(line); } catch { continue; }
    if (e.status !== 'OK' || !e.codigo_base || !e.source_url || !e.metric) continue;
    if (e.metric.unit_packaged_weight_kg == null && e.metric.unit_packaged_volume_m3 == null) continue;
    best.set(String(e.codigo_base).trim().toUpperCase(), e);
  }
  return [...best.values()];
}

async function apply() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const dryRun = !process.argv.includes('--apply');
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, dry_run: dryRun, candidates: 0, matching_rows: 0, updated_rows: 0, skipped: [] };
  try {
    await client.query('BEGIN');
    for (const e of entries()) {
      report.candidates++;
      const code = String(e.codigo_base).trim().toUpperCase();
      const count = await client.query(`SELECT count(*)::int n FROM elimfilters_catalog WHERE duty='HD' AND upper(trim(codigo_base))=$1`, [code]);
      const n = count.rows[0].n; report.matching_rows += n;
      if (!n) { report.skipped.push({ codigo_base: code, reason: 'NO_HD_MATCH' }); continue; }
      if (dryRun) continue;
      const notes = `Official Donaldson product page: unit packaged measurements from Packaged Dimensions. Master-carton quantities/dimensions and units_per_case are not asserted by this source.`;
      const r = await client.query(`
        UPDATE elimfilters_catalog SET
          unit_packaged_weight_kg = COALESCE(unit_packaged_weight_kg,$1),
          unit_packaged_volume_m3 = COALESCE(unit_packaged_volume_m3,$2),
          packaging_source = COALESCE(packaging_source,'OFFICIAL_SOURCE_SCRAPE'),
          packaging_source_url = COALESCE(packaging_source_url,$3),
          packaging_validated_at = COALESCE(packaging_validated_at,$4::timestamptz),
          packaging_validation_status = COALESCE(packaging_validation_status,'PARTIAL_UNIT_PACKAGED_OFFICIAL'),
          packaging_notes = COALESCE(packaging_notes,$5)
        WHERE duty='HD' AND upper(trim(codigo_base))=$6
      `, [e.metric.unit_packaged_weight_kg, e.metric.unit_packaged_volume_m3, e.source_url, e.scraped_at, notes, code]);
      report.updated_rows += r.rowCount;
    }
    if (dryRun) await client.query('ROLLBACK'); else await client.query('COMMIT');
    return report;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}

if (require.main === module) apply().then((r) => console.log(JSON.stringify(r,null,2))).catch((e) => { console.error(e); process.exit(1); });
module.exports = { MIGRATION, apply };

