'use strict';
/**
 * fix-phantom-skus.js
 *
 * Diagnoses and fixes corrupted/phantom records in elimfilters_catalog.
 *
 * Known issues:
 *  1. EF90065 — phantom product (not in any source data), has LF3620 cross-ref
 *     that belongs to EL82100 (Oil Filter, Donaldson P552100)
 *  2. LF3620 (Fleetguard Lube Oil) incorrectly mapped to EF90065 instead of EL82100
 *
 * Run on Render Shell:
 *   node scripts/fix-phantom-skus.js [--dry-run]
 *
 * --dry-run  → shows what would be done without making any changes
 */

const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Run this on the Render Shell.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

// Expected prefix by filter_type (must match server.js logic)
const EXPECTED_PREFIX = {
  'Air Filter':           'EA1',
  'Air Housing':          'EA2',
  'Air Dryer':            'ED4',
  'Hydraulic Filter':     'EH6',
  'Oil Filter':           'EL8',
  'Marine Filter':        'EM9',
  'Fuel/Water Separator': 'ES9',
  'Turbine Filter':       'ET9',
  'Cabin Air Filter':     'EC1',
  'Fuel Filter':          'EF9',
  'Coolant Filter':       'EW7',
};

// Fleetguard lube oil codes — must NEVER appear in non-Oil Filter records
const LUBE_FG_PATTERN = /^LF\d+/i;

async function run() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log(`\n${'='.repeat(60)}`);
  console.log('ELIMFILTERS DATABASE FIX SCRIPT');
  console.log(DRY_RUN ? '*** DRY RUN — no changes will be made ***' : '*** LIVE MODE — changes will be applied ***');
  console.log('='.repeat(60) + '\n');

  try {
    // ─── STEP 1: Diagnose EF90065 ─────────────────────────────────────────────
    console.log('── STEP 1: Diagnose EF90065 ──');
    const ef90065 = await client.query(
      `SELECT sku, filter_type, technology, codigo_base, description,
              competitor_codes, oem_codes, brand_crossrefs
       FROM elimfilters_catalog WHERE sku = 'EF90065'`
    );

    if (ef90065.rows.length === 0) {
      console.log('✅ EF90065 not found in DB — already clean or was removed.');
    } else {
      const row = ef90065.rows[0];
      console.log('⚠️  EF90065 EXISTS:');
      console.log('  filter_type:', row.filter_type);
      console.log('  technology:', row.technology);
      console.log('  codigo_base:', row.codigo_base);
      console.log('  description:', JSON.stringify(row.description));
      console.log('  competitor_codes:', JSON.stringify(row.competitor_codes));
      console.log('  oem_codes:', JSON.stringify(row.oem_codes));
      console.log('  brand_crossrefs keys:', Object.keys(row.brand_crossrefs || {}));
    }

    // ─── STEP 2: Diagnose EL82100 ─────────────────────────────────────────────
    console.log('\n── STEP 2: Diagnose EL82100 ──');
    const el82100 = await client.query(
      `SELECT sku, filter_type, technology, codigo_base, description,
              competitor_codes, oem_codes, brand_crossrefs
       FROM elimfilters_catalog WHERE sku = 'EL82100'`
    );

    if (el82100.rows.length === 0) {
      console.log('❌ EL82100 NOT FOUND in DB — this is a problem!');
    } else {
      const row = el82100.rows[0];
      console.log('✅ EL82100 exists:');
      console.log('  filter_type:', row.filter_type);
      console.log('  technology:', row.technology);
      console.log('  codigo_base:', row.codigo_base);
      // Check if LF3620 is already in its codes
      const compCodes = JSON.stringify(row.competitor_codes || []);
      const brandCrossrefs = row.brand_crossrefs || {};
      const fgCodes = brandCrossrefs['FLEETGUARD'] || [];
      const hasLF3620inFG = fgCodes.includes('LF3620');
      const hasLF3620inComp = compCodes.includes('LF3620');
      console.log('  FLEETGUARD in brand_crossrefs:', fgCodes.slice(0, 5));
      console.log('  LF3620 in brand_crossrefs[FLEETGUARD]:', hasLF3620inFG);
      console.log('  LF3620 in competitor_codes:', hasLF3620inComp);
    }

    // ─── STEP 3: Find where LF3620 appears in the DB ─────────────────────────
    console.log('\n── STEP 3: Where does LF3620 appear in DB? ──');
    const lf3620search = await client.query(
      `SELECT sku, filter_type,
              competitor_codes::text ILIKE '%LF3620%' AS in_competitor,
              oem_codes::text ILIKE '%LF3620%' AS in_oem,
              brand_crossrefs::text ILIKE '%LF3620%' AS in_brand
       FROM elimfilters_catalog
       WHERE competitor_codes::text ILIKE '%LF3620%'
          OR oem_codes::text ILIKE '%LF3620%'
          OR brand_crossrefs::text ILIKE '%LF3620%'`
    );
    console.log(`Found LF3620 in ${lf3620search.rows.length} record(s):`);
    lf3620search.rows.forEach(r => {
      const correct = r.filter_type === 'Oil Filter' ? '✅' : '❌ WRONG FILTER TYPE';
      console.log(`  ${correct} SKU: ${r.sku} | type: ${r.filter_type} | in_competitor: ${r.in_competitor} | in_oem: ${r.in_oem} | in_brand: ${r.in_brand}`);
    });

    // ─── STEP 4: Find SKU prefix mismatches ───────────────────────────────────
    console.log('\n── STEP 4: SKU prefix vs filter_type mismatches ──');
    const mismatches = await client.query(
      `SELECT sku, filter_type, codigo_base,
        CASE filter_type
          WHEN 'Air Filter'           THEN 'EA1'
          WHEN 'Air Dryer'            THEN 'ED4'
          WHEN 'Hydraulic Filter'     THEN 'EH6'
          WHEN 'Oil Filter'           THEN 'EL8'
          WHEN 'Fuel/Water Separator' THEN 'ES9'
          WHEN 'Turbine Filter'       THEN 'ET9'
          WHEN 'Cabin Air Filter'     THEN 'EC1'
          WHEN 'Fuel Filter'          THEN 'EF9'
          WHEN 'Coolant Filter'       THEN 'EW7'
          ELSE NULL
        END AS expected_prefix
       FROM elimfilters_catalog
       WHERE filter_type IS NOT NULL
         AND filter_type != 'Kit Filter'
         AND filter_type != 'Marine Filter'
         AND filter_type != 'Air Housing'
       HAVING
         CASE filter_type
           WHEN 'Air Filter'           THEN 'EA1'
           WHEN 'Air Dryer'            THEN 'ED4'
           WHEN 'Hydraulic Filter'     THEN 'EH6'
           WHEN 'Oil Filter'           THEN 'EL8'
           WHEN 'Fuel/Water Separator' THEN 'ES9'
           WHEN 'Turbine Filter'       THEN 'ET9'
           WHEN 'Cabin Air Filter'     THEN 'EC1'
           WHEN 'Fuel Filter'          THEN 'EF9'
           WHEN 'Coolant Filter'       THEN 'EW7'
           ELSE NULL
         END IS NOT NULL
         AND sku NOT LIKE (CASE filter_type
           WHEN 'Air Filter'           THEN 'EA1%'
           WHEN 'Air Dryer'            THEN 'ED4%'
           WHEN 'Hydraulic Filter'     THEN 'EH6%'
           WHEN 'Oil Filter'           THEN 'EL8%'
           WHEN 'Fuel/Water Separator' THEN 'ES9%'
           WHEN 'Turbine Filter'       THEN 'ET9%'
           WHEN 'Cabin Air Filter'     THEN 'EC1%'
           WHEN 'Fuel Filter'          THEN 'EF9%'
           WHEN 'Coolant Filter'       THEN 'EW7%'
           ELSE 'XXXXXXXXXXX'
         END)
       GROUP BY sku, filter_type, codigo_base
       ORDER BY filter_type, sku
       LIMIT 30`
    );
    if (mismatches.rows.length === 0) {
      console.log('✅ No SKU prefix mismatches found.');
    } else {
      console.log(`⚠️  Found ${mismatches.rows.length} SKU prefix mismatch(es):`);
      mismatches.rows.forEach(r => {
        console.log(`  ❌ SKU: ${r.sku} | type: ${r.filter_type} | expected prefix: ${r.expected_prefix} | codigo_base: ${r.codigo_base}`);
      });
    }

    // ─── STEP 5: Find Fleetguard LF-codes in non-Oil Filter records ───────────
    console.log('\n── STEP 5: Fleetguard LF-codes in non-Oil Filter records ──');
    const wrongLF = await client.query(
      `SELECT sku, filter_type, competitor_codes
       FROM elimfilters_catalog
       WHERE filter_type != 'Oil Filter'
         AND (
           EXISTS (
             SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
             WHERE UPPER(elem->>'code') ~ '^LF[0-9]'
                OR UPPER(elem->>'part_number') ~ '^LF[0-9]'
           )
           OR brand_crossrefs::text ~ '"FLEETGUARD":\\s*\\["LF'
         )
       LIMIT 20`
    );
    if (wrongLF.rows.length === 0) {
      console.log('✅ No Fleetguard LF-codes found in non-Oil Filter records.');
    } else {
      console.log(`⚠️  Found ${wrongLF.rows.length} non-Oil Filter record(s) with LF codes:`);
      wrongLF.rows.forEach(r => {
        console.log(`  ❌ SKU: ${r.sku} | type: ${r.filter_type}`);
      });
    }

    if (DRY_RUN) {
      console.log('\n*** DRY RUN complete — no changes made ***');
      console.log('Run without --dry-run to apply fixes.\n');
      return;
    }

    // ─── STEP 6: APPLY FIXES ──────────────────────────────────────────────────
    console.log('\n── STEP 6: Applying fixes ──');

    // Fix A: Delete EF90065 if it exists and is not in source data
    if (ef90065.rows.length > 0) {
      console.log('\n[Fix A] Deleting phantom product EF90065...');
      await client.query(`DELETE FROM elimfilters_catalog WHERE sku = 'EF90065'`);
      console.log('  ✅ EF90065 deleted.');
    }

    // Fix B: Ensure EL82100 has LF3620 in brand_crossrefs under FLEETGUARD
    if (el82100.rows.length > 0) {
      console.log('\n[Fix B] Ensuring EL82100 has correct FLEETGUARD cross-references...');
      const row = el82100.rows[0];
      const brandCrossrefs = row.brand_crossrefs || {};
      const currentFG = brandCrossrefs['FLEETGUARD'] || [];

      // Correct FLEETGUARD codes for P552100/EL82100
      const correctFGCodes = ['LF3620', 'LF3671', 'LF9620', 'MK13045', 'XLF5000'];
      const mergedFG = [...new Set([...currentFG, ...correctFGCodes])];

      if (JSON.stringify(mergedFG.sort()) !== JSON.stringify(currentFG.sort())) {
        brandCrossrefs['FLEETGUARD'] = mergedFG;
        await client.query(
          `UPDATE elimfilters_catalog SET brand_crossrefs = $1 WHERE sku = 'EL82100'`,
          [brandCrossrefs]
        );
        console.log('  ✅ Updated EL82100 FLEETGUARD codes:', mergedFG);
      } else {
        console.log('  ✅ EL82100 FLEETGUARD codes already correct.');
      }

      // Also ensure competitor_codes has LF3620 with FLEETGUARD manufacturer
      const compCodes = row.competitor_codes || [];
      const hasLF3620 = compCodes.some(c => c.code === 'LF3620' || c.part_number === 'LF3620');
      if (!hasLF3620) {
        const updatedCompCodes = [
          ...compCodes,
          { manufacturer: 'FLEETGUARD', code: 'LF3620' },
          { manufacturer: 'FLEETGUARD', code: 'LF3671' },
          { manufacturer: 'FLEETGUARD', code: 'LF9620' },
        ];
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = 'EL82100'`,
          [JSON.stringify(updatedCompCodes)]
        );
        console.log('  ✅ Added LF3620/LF3671/LF9620 to EL82100 competitor_codes.');
      }
    } else {
      console.log('\n[Fix B] ⚠️  EL82100 not found in DB — cannot update cross-references!');
      console.log('  You may need to re-import EL82100 from donaldson_lube_results.json (P552100).');
    }

    // Fix C: Remove LF3620 from any non-Oil Filter records
    for (const r of wrongLF.rows) {
      if (r.sku === 'EF90065') continue; // already deleted
      console.log(`\n[Fix C] Cleaning LF codes from ${r.sku} (${r.filter_type})...`);
      const codes = r.competitor_codes || [];
      const cleaned = codes.filter(c => {
        const code = (c.code || c.part_number || '').toUpperCase();
        return !LUBE_FG_PATTERN.test(code);
      });
      if (cleaned.length < codes.length) {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(cleaned), r.sku]
        );
        console.log(`  ✅ Removed ${codes.length - cleaned.length} LF code(s) from ${r.sku}`);
      }
    }

    // ─── STEP 7: Verify ───────────────────────────────────────────────────────
    console.log('\n── STEP 7: Verification ──');

    const verify1 = await client.query(`SELECT COUNT(*) FROM elimfilters_catalog WHERE sku = 'EF90065'`);
    console.log('EF90065 count (should be 0):', verify1.rows[0].count);

    const verify2 = await client.query(
      `SELECT sku, brand_crossrefs->'FLEETGUARD' AS fg_codes
       FROM elimfilters_catalog WHERE sku = 'EL82100'`
    );
    if (verify2.rows.length > 0) {
      console.log('EL82100 FLEETGUARD codes:', JSON.stringify(verify2.rows[0].fg_codes));
    }

    const verify3 = await client.query(
      `SELECT sku, filter_type FROM elimfilters_catalog
       WHERE (competitor_codes::text ILIKE '%LF3620%' OR oem_codes::text ILIKE '%LF3620%' OR brand_crossrefs::text ILIKE '%LF3620%')`
    );
    console.log('Records with LF3620 after fix:');
    verify3.rows.forEach(r => {
      const correct = r.filter_type === 'Oil Filter' ? '✅' : '❌ STILL WRONG';
      console.log(`  ${correct} ${r.sku} (${r.filter_type})`);
    });

    console.log('\n✅ Fix complete.\n');

  } catch (err) {
    console.error('ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

run();
