'use strict';

/**
 * Evidence-bound, reversible-by-transaction registration of the official
 * Donaldson P601767 <-> DBA5231 alternative relationship.
 *
 * Dry-run by default. --execute is an explicit write action.
 * Does NOT copy equipment_applications, recertify fitment, or change canonical status.
 * FRG12 is recorded as an air-cleaner housing relationship, NOT as a machine.
 *
 * Usage (database connection via CATALOG_DATABASE_URL or DATABASE_URL):
 *   node scripts/migrations/run_285_register_dba5231_alternative.js
 *   node scripts/migrations/run_285_register_dba5231_alternative.js --execute
 */

require('dotenv').config();
const { Client } = require('pg');

const PAIR = Object.freeze([
  { sku: 'EA11767', base: 'P601767', other: 'EA15231', otherBase: 'DBA5231' },
  { sku: 'EA15231', base: 'DBA5231', other: 'EA11767', otherBase: 'P601767' },
]);
const OFFICIAL_SOURCE = 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/donaldson-blue/F111417-ENG/Donaldson-Blue-Filtration-Overview.pdf';
const HOUSING_SOURCE = 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/air-intake/north-america/F110027-ENG/Air-Intake-Systems-Product-Guide.pdf';

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function existingAlternativeCodes(items) {
  if (!Array.isArray(items)) throw new Error('INVALID_ALTERNATIVES_PAYLOAD');
  return items.map((item) => {
    if (typeof item === 'string') return item.toUpperCase();
    if (item && typeof item === 'object') return String(item.sku || item.code || '').trim().toUpperCase();
    return '';
  });
}

function planPair(rows) {
  if (!Array.isArray(rows) || rows.length !== 2) throw new Error('EXACT_PAIR_REQUIRED');
  const bySku = new Map(rows.map((r) => [r.sku, r]));
  if (bySku.size !== 2) throw new Error('DUPLICATE_OR_MISSING_SKU');
  return PAIR.map(({ sku, base, other, otherBase }) => {
    const row = bySku.get(sku);
    if (!row || String(row.codigo_base).toUpperCase() !== base ||
        row.duty !== 'HEAVY_DUTY' || row.catalog_active !== true ||
        !Array.isArray(row.equipment_applications)) {
      throw new Error('STALE_OR_INVALID_CATALOG_IDENTITY:' + sku);
    }
    const alt = Array.isArray(row.alternatives) ? row.alternatives : [];
    const codes = existingAlternativeCodes(alt);
    const alternatives = codes.includes(other) || codes.includes(otherBase)
      ? alt : [...alt, other];
    const enrichment = asObject(row.enrichment_data);
    const existing = asObject(enrichment.documented_alternative_relations);
    const relation = {
      ...existing,
      [other]: {
        relationship: 'INSTALLATION_COMPATIBLE_MEDIA_VARIANT',
        other_base: otherBase,
        official_authority: 'DONALDSON',
        source_url: OFFICIAL_SOURCE,
        air_cleaner_family: 'FRG12',
        air_cleaner_housing_source_url: HOUSING_SOURCE,
        equipment_applications_inherited: false,
        fitment_certification_status: 'NOT_ASSERTED',
        media_distinction: 'DONALDSON_BLUE_ULTRA_WEB_VS_STANDARD'
      }
    };
    return {
      sku,
      alternatives,
      enrichment_data: { ...enrichment, documented_alternative_relations: relation },
      equipment_before: row.equipment_applications
    };
  });
}

async function register(db, execute = false) {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE READ WRITE');
  try {
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '30s'");
    const { rows } = await db.query(`
      SELECT sku, codigo_base, duty, catalog_active, alternatives,
             enrichment_data, equipment_applications
      FROM public.elimfilters_catalog
      WHERE sku = ANY($1::text[])
      ORDER BY sku FOR UPDATE
    `, [PAIR.map((p) => p.sku)]);
    const plan = planPair(rows);
    const results = [];
    for (const item of plan) {
      const old = rows.find((r) => r.sku === item.sku);
      const changed = JSON.stringify(old.alternatives || []) !== JSON.stringify(item.alternatives) ||
        JSON.stringify(old.enrichment_data || {}) !== JSON.stringify(item.enrichment_data);
      if (execute && changed) {
        const { rowCount } = await db.query(`
          UPDATE public.elimfilters_catalog
          SET alternatives=$1::jsonb, enrichment_data=$2::jsonb
          WHERE sku=$3 AND codigo_base=$4 AND catalog_active IS TRUE AND duty='HEAVY_DUTY'
        `, [JSON.stringify(item.alternatives), JSON.stringify(item.enrichment_data),
          item.sku, PAIR.find((p) => p.sku === item.sku).base]);
        if (rowCount !== 1) throw new Error('CONCURRENT_UPDATE:' + item.sku);
      }
      results.push({ sku: item.sku, changed, alternatives: item.alternatives,
        equipment_count_untouched: item.equipment_before.length });
    }
    if (execute) {
      const { rows: after } = await db.query(`
        SELECT sku, equipment_applications FROM public.elimfilters_catalog
        WHERE sku = ANY($1::text[])
      `, [PAIR.map((p) => p.sku)]);
      for (const row of after) {
        const before = plan.find((p) => p.sku === row.sku);
        if (JSON.stringify(row.equipment_applications) !== JSON.stringify(before.equipment_before)) {
          throw new Error('EQUIPMENT_PAYLOAD_CHANGED:' + row.sku);
        }
      }
    }
    await db.query(execute ? 'COMMIT' : 'ROLLBACK');
    return { mode: execute ? 'EXECUTED' : 'DRY_RUN', relation: 'P601767 <-> DBA5231',
      housing: 'FRG12', equipment_applications_changed: 0,
      canonical_source_status_changed: 0, results };
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL or DATABASE_URL required');
  const parsed = new URL(url);
  const local = ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  try { console.log(JSON.stringify(await register(db, process.argv.includes('--execute')), null, 2)); }
  finally { await db.end(); }
}

if (require.main === module) {
  main().catch((error) => { console.error('[run_285] ' + error.message); process.exitCode = 1; });
}

module.exports = { PAIR, OFFICIAL_SOURCE, HOUSING_SOURCE, planPair, register };
