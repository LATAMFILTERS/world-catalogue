'use strict';

/**
 * Loads the active Fleetguard fuel processor housings (Fuel Pro / Diesel Pro /
 * Industrial Pro / Sea Pro) as ET9 TURBOCORE™ products, plus the three
 * replacement elements that had no catalog product, as ES9 HYDROCORE™.
 *
 * Operator ruling 2026-10-11: fuel processors extracted from the Fleetguard
 * "Carcasa del filtro de combustible" category belong to TURBOCORE / ET9;
 * elements Fleetguard labels as fuel/water separators are ES9.
 * SKU = prefix + last four digits of the Fleetguard code, suffix letters dropped.
 *
 * Data: run_231_fleetguard_fuel_processors.data.json, built from the captured
 * official product pages. Only published values are stored; nothing is derived.
 * No applications, packaging or logistics fields are written.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const DATA = require('./run_231_fleetguard_fuel_processors.data.json');

const MIGRATION = '231_LOAD_FLEETGUARD_FUEL_PROCESSORS';
const APPLY = process.argv.includes('--execute');
const VERIFIED_AT = '2026-10-11T00:00:00.000Z';
const JSON_COLS = new Set(['oem_codes', 'competitor_codes', 'alternatives', 'canonical_evidence', 'duty_evidence', 'enrichment_data']);

const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function buildRow(item, kind) {
  const housing = kind === 'housing';
  const evidenceHash = sha(item);
  const row = {
    sku: item.sku,
    codigo_base: item.code,
    filter_type: housing ? 'fuel' : 'water',
    technology: housing ? 'TURBOCORE™' : 'HYDROCORE™',
    sub_type: housing ? 'Fuel Processor Housing' : 'Fuel/Water Separator',
    description: housing
      ? `ELIMFILTERS® ${item.sku} fuel processor housing for diesel fuel/water separation. Canonical source: Fleetguard ${item.code}.`
      : `ELIMFILTERS® ${item.sku} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`,
    duty: 'HEAVY_DUTY',
    height_mm: item.height_mm || null,
    outer_diameter_mm: item.outer_diameter_mm || null,
    micron_rating: item.micron_rating || null,
    oem_codes: item.oem.map(([manufacturer, code]) => ({ manufacturer, code, classification: 'OEM', source_url: item.url })),
    competitor_codes: [],
    alternatives: item.elements || [],
    canonical_source_brand: 'FLEETGUARD',
    canonical_source_code: item.code,
    canonical_source_url: item.url,
    canonical_source_status: 'VERIFIED',
    canonical_verified_at: VERIFIED_AT,
    canonical_evidence: { source: DATA.source, source_url: item.url, evidence_hash: evidenceHash },
    duty_source_brand: 'ELIMFILTERS_GOVERNANCE',
    duty_source_url: item.url,
    duty_validation_status: 'VERIFIED',
    duty_verified_at: VERIFIED_AT,
    duty_evidence: {
      approved_family: housing ? 'ET9' : 'ES9',
      approved_technology: housing ? 'TURBOCORE™' : 'HYDROCORE™',
      base_rule: 'FLEETGUARD_LAST_4_OPERATOR_RULING_20261011',
    },
    enrichment_data: {
      codigo_base_governance: {
        policy_version: '2026-08-19-v3.1',
        state: 'CANONICAL_VERIFIED',
        required_authority: 'VERIFIED_AFTERMARKET_FALLBACK',
        primary_manufacturer_verified: false,
        donaldson_absence_verified: true,
        donaldson_absence_note: housing
          ? `ELIMFILTERS operator ruling 2026-10-11: Fleetguard fuel processor housings are ET9 with the Fleetguard code as base; ${item.code} is the approved commercial base.`
          : `ELIMFILTERS operator ruling 2026-10-11: elements Fleetguard labels as fuel/water separators are ES9; the Fleetguard page for ${item.code} lists no Donaldson cross.`,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        approved_manufacturer: 'FLEETGUARD',
        approved_codigo_base: item.code,
        approved_source_column: 'COMPETITOR_CODES',
        current_codigo_base: item.code,
        verification_method: 'ELIMFILTERS_OPERATOR_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PRODUCT_PAGE',
        evidence_url: item.url,
        verified_at: VERIFIED_AT,
      },
      evidence_source: `FLEETGUARD_${item.code}_OFFICIAL`,
      fleetguard_source: item.source,
    },
  };
  return { row, evidenceHash };
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { migration: MIGRATION, mode: APPLY ? 'execute' : 'dry-run', inserted: [], warnings: [] };

  try {
    await db.query('BEGIN');
    // elements first: housings link to them through alternatives
    const batch = [...DATA.elements.map((i) => [i, 'element']), ...DATA.housings.map((i) => [i, 'housing'])];
    for (const [item, kind] of batch) {
      const clash = await db.query(
        `SELECT sku, codigo_base FROM public.elimfilters_catalog
          WHERE sku = $1 OR upper(regexp_replace(codigo_base, '[^A-Za-z0-9]', '', 'g')) = $2`,
        [item.sku, norm(item.code)]);
      if (clash.rowCount) throw new Error(`SKU_OR_BASE_ALREADY_EXISTS ${item.sku}/${item.code} ${JSON.stringify(clash.rows)}`);

      for (const el of item.elements || []) {
        const ok = await db.query('SELECT 1 FROM public.elimfilters_catalog_active_v WHERE sku = $1', [el]);
        if (!ok.rowCount) throw new Error(`ELEMENT_SKU_MISSING ${item.sku} -> ${el}`);
      }

      // informational: the same code already cited by another product makes the search ambiguous
      const cited = await db.query(
        `SELECT DISTINCT r.code, r.sku FROM public.crossref_resolved_cache r
          WHERE upper(regexp_replace(r.code, '[^A-Za-z0-9]', '', 'g')) = ANY($1::text[])`,
        [[item.code, ...item.oem.map(([, c]) => c)].map(norm)]);
      if (cited.rowCount) report.warnings.push({ sku: item.sku, already_cited: cited.rows });

      const { row, evidenceHash } = buildRow(item, kind);
      assertCanonicalWrite(row);
      const cols = Object.keys(row);
      await db.query(
        `INSERT INTO public.elimfilters_catalog (${cols.map((c) => `"${c}"`).join(',')})
         VALUES (${cols.map((c, i) => `$${i + 1}${JSON_COLS.has(c) ? '::jsonb' : ''}`).join(',')})`,
        cols.map((c) => (JSON_COLS.has(c) ? JSON.stringify(row[c]) : row[c])));
      await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'OFFICIAL_PRODUCT_PAGE', 'FLEETGUARD', 'FLEETGUARD', $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT DO NOTHING`,
        [item.sku, item.code, norm(item.code), item.url, evidenceHash, VERIFIED_AT, JSON.stringify({ migration: MIGRATION })]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [item.sku]);
      report.inserted.push(item.sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    report.count = report.inserted.length;
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
