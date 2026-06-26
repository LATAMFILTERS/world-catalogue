/**
 * fix-ld-search.js
 * Fixes 3 confirmed DB issues:
 * 1. Malformed brand_crossrefs on EL883713/EF984001/EF984002 (causes 500 on Tier 5)
 * 2. PH3614 wrongly in EH60222 oem_codes (hydraulic ≠ lube FRAM code)
 * 3. Missing FRAM codes in EL80047 (PH3387A) and EL82016 (PH3614)
 */
'use strict';

const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Run on Render shell.');
  process.exit(1);
}

const DRY = process.argv.includes('--dry');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log(`Connected ✓  (${DRY ? 'DRY RUN' : 'LIVE'})\n`);

  // ── Fix 1: Remove malformed brand_crossrefs entries (non-array values) ──────
  // These cause jsonb_array_elements_text to throw in Tier 5, returning HTTP 500
  console.log('=== Fix 1: Repair malformed brand_crossrefs ===');
  const badRows = await client.query(
    `SELECT DISTINCT sku, codigo_base, brand_crossrefs
     FROM elimfilters_catalog,
          jsonb_each(COALESCE(brand_crossrefs,'{}')) AS kv
     WHERE jsonb_typeof(kv.value) != 'array'`
  );
  console.log(`  Found ${badRows.rows.length} affected SKUs`);
  for (const row of badRows.rows) {
    const orig = row.brand_crossrefs;
    // Convert any non-array value to a single-element array
    const fixed = {};
    for (const [k, v] of Object.entries(orig)) {
      if (Array.isArray(v)) {
        fixed[k] = v;
      } else if (v === null) {
        // skip null values
      } else {
        fixed[k] = [String(v)];
      }
    }
    console.log(`  ${row.sku} (${row.codigo_base}): converting non-array values`);
    if (!DRY) {
      await client.query(
        `UPDATE elimfilters_catalog SET brand_crossrefs = $1::jsonb WHERE sku = $2`,
        [JSON.stringify(fixed), row.sku]
      );
    }
  }
  console.log('  Fix 1 done ✓\n');

  // ── Fix 2: Remove PH3614 from EH60222 oem_codes (hydraulic, wrong category) ─
  console.log('=== Fix 2: Remove PH3614 from EH60222 oem_codes ===');
  const eh = await client.query(
    `SELECT sku, oem_codes FROM elimfilters_catalog WHERE sku = 'EH60222'`
  );
  if (eh.rows.length) {
    const orig = eh.rows[0].oem_codes || [];
    const before = orig.length;
    const cleaned = orig.filter(e => (e.code || '').toUpperCase() !== 'PH3614');
    console.log(`  EH60222: oem_codes ${before} → ${cleaned.length} entries (removed ${before - cleaned.length})`);
    if (!DRY) {
      await client.query(
        `UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = 'EH60222'`,
        [JSON.stringify(cleaned)]
      );
    }
  } else {
    console.log('  EH60222 not found');
  }
  console.log('  Fix 2 done ✓\n');

  // Also remove PH3614 from EL87780 if it's there incorrectly (it appeared in oem_codes too)
  console.log('=== Fix 2b: Check EL87780 for PH3614 ===');
  const el87 = await client.query(
    `SELECT sku, filter_type, oem_codes FROM elimfilters_catalog WHERE sku = 'EL87780'`
  );
  if (el87.rows.length) {
    const row = el87.rows[0];
    console.log(`  EL87780 filter_type=${row.filter_type}`);
    const hasph = (row.oem_codes || []).some(e => (e.code || '').toUpperCase() === 'PH3614');
    if (hasph && row.filter_type !== 'lube') {
      const cleaned = (row.oem_codes || []).filter(e => (e.code || '').toUpperCase() !== 'PH3614');
      console.log(`  Removing PH3614 from non-lube EL87780`);
      if (!DRY) {
        await client.query(
          `UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = 'EL87780'`,
          [JSON.stringify(cleaned)]
        );
      }
    } else if (hasph) {
      console.log(`  EL87780 is lube — keeping PH3614`);
    } else {
      console.log(`  No PH3614 in EL87780 oem_codes`);
    }
  }
  console.log('  Fix 2b done ✓\n');

  // ── Fix 3: Add missing FRAM codes to EL80047 and EL82016 ──────────────────
  // Source: donaldson_lube_results.json (authoritative)
  const corrections = [
    {
      sku: 'EL80047',
      // FRAM codes from donaldson_lube_results.json P550047
      newCodes: [
        {manufacturer:'FRAM',code:'DG3387A'},{manufacturer:'FRAM',code:'PH2862C'},
        {manufacturer:'FRAM',code:'PH3354'},{manufacturer:'FRAM',code:'PH3387'},
        {manufacturer:'FRAM',code:'PH3387A'},{manufacturer:'FRAM',code:'PH3387AFP'},
        {manufacturer:'FRAM',code:'PH4722'},{manufacturer:'FRAM',code:'PH4722A'},
        {manufacturer:'FRAM',code:'TG3387A'},{manufacturer:'FRAM',code:'XG3387A'},
      ]
    },
    {
      sku: 'EL82016',
      // FRAM codes from donaldson_lube_results.json P502016
      newCodes: [
        {manufacturer:'FRAM',code:'PH2964'},{manufacturer:'FRAM',code:'PH3614'},
      ]
    },
  ];

  console.log('=== Fix 3: Add missing FRAM codes to EL80047 and EL82016 ===');
  for (const {sku, newCodes} of corrections) {
    const res = await client.query(
      `SELECT sku, oem_codes FROM elimfilters_catalog WHERE sku = $1`, [sku]
    );
    if (!res.rows.length) { console.log(`  ${sku} not found — skipping`); continue; }
    const existing = res.rows[0].oem_codes || [];
    const existingKeys = new Set(existing.map(e => `${e.manufacturer}|${e.code}`.toUpperCase()));
    const toAdd = newCodes.filter(e => !existingKeys.has(`${e.manufacturer}|${e.code}`.toUpperCase()));
    console.log(`  ${sku}: adding ${toAdd.length} new codes (${toAdd.map(e=>e.code).join(',')})`);
    if (toAdd.length && !DRY) {
      await client.query(
        `UPDATE elimfilters_catalog SET oem_codes = oem_codes || $1::jsonb WHERE sku = $2`,
        [JSON.stringify(toAdd), sku]
      );
    }
  }
  console.log('  Fix 3 done ✓\n');

  // ── Verify fixes ─────────────────────────────────────────────────────────
  if (!DRY) {
    console.log('=== Verification ===');
    const v1 = await client.query(
      `SELECT COUNT(*) AS n FROM elimfilters_catalog,jsonb_each(COALESCE(brand_crossrefs,'{}')) AS kv WHERE jsonb_typeof(kv.value)!='array'`
    );
    console.log(`  Malformed brand_crossrefs remaining: ${v1.rows[0].n} (expect 0)`);

    const v2 = await client.query(
      `SELECT sku FROM elimfilters_catalog,jsonb_array_elements(COALESCE(oem_codes,'[]')) AS elem WHERE UPPER(elem->>'code') IN ('PH3387A','PH3614') ORDER BY sku`
    );
    console.log(`  PH3387A/PH3614 in oem_codes:`);
    v2.rows.forEach(r => console.log(`    ${r.sku}`));
  }

  await client.end();
  console.log('\nAll fixes applied.');
}

run().catch(e => { console.error('FATAL:', e.message); client.end(); process.exit(1); });
