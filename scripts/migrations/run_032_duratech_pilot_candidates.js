'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_032_duratech_pilot_candidates.js
 *
 * DURATECH pilot - step 2: list ALL candidate SKUs per filter_type for
 * the two confirmed pilot platforms, so a human picks the final SKU per
 * type before any kit is created (no automatic selection - confirmed
 * with ELIMFILTERS given the risk of shipping the wrong part in a kit).
 *
 *   - HD platform: FREIGHTLINER COLUMBIA CL120 + Detroit Diesel DD15
 *   - LD platform: TOYOTA RAV4, model year 2022
 *
 * For LD, vehicle_applications year data comes in three shapes
 * (confirmed by run_031):
 *   1. legacy:  { model: "<free text, sometimes with an embedded date>" }
 *   2. current: { model_family, model_type, year: "MM/YY -> MM/YY" }
 *   3. hybrid:  { model, year_range: "MM/YY -> MM/YY" }
 * This normalizes all three in JS and keeps only entries whose date
 * range actually covers 2022 (or, for legacy entries with no parseable
 * range, includes them as unconfirmed candidates for manual review
 * rather than silently dropping them).
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const TARGET_YEAR = 2022;

function parseRangeCoversYear(rangeStr, year) {
  if (!rangeStr) return null; // unknown - can't confirm or deny
  const m = rangeStr.match(/(\d{2})\/(\d{2})\s*(?:→|->)\s*(?:(\d{2})\/(\d{2}))?/);
  if (!m) return null;
  // m: [full, startMM, startYY, endMM, endYY]
  const startMM = parseInt(m[1], 10);
  const startYY = 2000 + parseInt(m[2], 10);
  const hasEnd = m[3] !== undefined && m[4] !== undefined;
  const endYY = hasEnd ? 2000 + parseInt(m[4], 10) : null;
  if (year < startYY) return false;
  if (hasEnd && year > endYY) return false;
  return true;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log('\n=== HD PLATFORM: FREIGHTLINER COLUMBIA CL120 + Detroit Diesel DD15 ===');
  const { rows: hdRows } = await client.query(`
    SELECT DISTINCT c.sku, c.codigo_base, c.filter_type, c.technology, eq->>'equipment' AS equipment, eq->>'engine' AS engine
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications ELSE '[]'::jsonb END
      ) eq
    WHERE c.duty = 'HEAVY_DUTY'
      AND eq->>'equipment' ILIKE '%FREIGHTLINER%CL120%'
      AND eq->>'engine' ILIKE '%DD15%'
    ORDER BY c.filter_type, c.sku
  `);
  const hdByType = {};
  hdRows.forEach(r => {
    (hdByType[r.filter_type] = hdByType[r.filter_type] || []).push(r);
  });
  Object.entries(hdByType).forEach(([type, rows]) => {
    console.log(`\n  -- ${type} (${rows.length} candidates) --`);
    rows.forEach(r => console.log(`     ${r.sku}  (${r.codigo_base})  ${r.technology}`));
  });
  if (!hdRows.length) console.log('  No matches.');

  console.log('\n\n=== LD PLATFORM: TOYOTA RAV4, model year 2022 ===');
  const { rows: ldRaw } = await client.query(`
    SELECT c.sku, c.codigo_base, c.filter_type, c.technology, va
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications ELSE '[]'::jsonb END
      ) va
    WHERE c.duty = 'LIGHT_DUTY'
      AND va->>'make' ILIKE '%TOYOTA%'
      AND (
        va->>'model' ILIKE '%RAV%' OR
        va->>'model_family' ILIKE '%RAV%'
      )
  `);

  const confirmed = {};
  const unconfirmed = {};
  ldRaw.forEach(r => {
    const va = r.va;
    const rangeStr = va.year || va.year_range || null;
    const covers = parseRangeCoversYear(rangeStr, TARGET_YEAR);
    const model = va.model || [va.model_family, va.model_type].filter(Boolean).join(' ');
    const entry = { sku: r.sku, codigo_base: r.codigo_base, technology: r.technology, model, rangeStr };
    if (covers === true) {
      (confirmed[r.filter_type] = confirmed[r.filter_type] || []).push(entry);
    } else if (covers === null) {
      (unconfirmed[r.filter_type] = unconfirmed[r.filter_type] || []).push(entry);
    }
    // covers === false -> genuinely out of range, dropped
  });

  console.log('\n-- CONFIRMED (year range explicitly covers 2022) --');
  if (Object.keys(confirmed).length === 0) console.log('  None.');
  Object.entries(confirmed).forEach(([type, rows]) => {
    console.log(`\n  -- ${type} (${rows.length} candidates) --`);
    const seen = new Set();
    rows.forEach(r => {
      const key = r.sku;
      if (seen.has(key)) return;
      seen.add(key);
      console.log(`     ${r.sku}  (${r.codigo_base})  ${r.technology}  | ${r.model} | ${r.rangeStr}`);
    });
  });

  console.log('\n-- UNCONFIRMED (RAV4 match found, but no parseable year range - needs manual review) --');
  if (Object.keys(unconfirmed).length === 0) console.log('  None.');
  Object.entries(unconfirmed).forEach(([type, rows]) => {
    console.log(`\n  -- ${type} (${rows.length} candidates) --`);
    const seen = new Set();
    rows.slice(0, 15).forEach(r => {
      const key = r.sku;
      if (seen.has(key)) return;
      seen.add(key);
      console.log(`     ${r.sku}  (${r.codigo_base})  ${r.technology}  | ${r.model} | range=${r.rangeStr || 'none'}`);
    });
    if (rows.length > 15) console.log(`     ... and ${rows.length - 15} more`);
  });

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
