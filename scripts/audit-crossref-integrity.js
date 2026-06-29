'use strict';
/**
 * audit-crossref-integrity.js
 *
 * Audits the entire elimfilters_catalog for:
 * 1. SKU prefix vs filter_type mismatches
 * 2. Fleetguard LF-codes (lube) in non-Oil Filter records (exact match)
 * 3. Fleetguard FF-codes (fuel) in non-Fuel Filter records
 * 4. Fleetguard HF-codes (hydraulic) in non-Hydraulic Filter records
 * 5. filter_type values that are non-standard (not matching canonical names)
 * 6. Products with contradictory technology vs filter_type
 *
 * Run on Render Shell:
 *   node scripts/audit-crossref-integrity.js
 */

const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

// Canonical filter_type → expected SKU prefix
// HD (Heavy Duty, Donaldson-based): EL8, EA1, EH6, EF9, EC1, EW7
// LD (Light Duty, Mann-based):      EL3, EA3, EF3, EC3
const PREFIX_MAP = {
  // ── Heavy Duty (HD) ──────────────────────────────────────────────────────
  'Air Filter':              'EA1',
  'Air Housing':             'EA2',
  'Air Dryer':               'ED4',
  'Hydraulic Filter':        'EH6',
  'Oil Filter':              'EL8',
  'Marine Filter':           'EM9',
  'Fuel/Water Separator':    'ES9',
  'Turbine Filter':          'ET9',
  'Cabin Air Filter':        'EC1',
  'Fuel Filter':             'EF9',
  'Coolant Filter':          'EW7',
  // ── Light Duty (LD) — Mann Filter ────────────────────────────────────────
  // SKU format: prefix (3 chars) + last 4 digits of Mann part number
  // codigo_base = last 4 digits only (no dashes, spaces, or symbols)
  // Example: MANN ML 1003 → codigo_base=1003 → SKU=EL31003
  'Oil Filter LD':           'EL3',
  'Air Filter LD':           'EA3',
  'Cabin Filter LD':         'EC3',
  'Fuel Filter LD':          'EF3',
};

// Non-canonical filter_type values seen in DB (must be normalized)
const NON_CANONICAL = [
  'lube', 'Lube Filter', 'oil', 'Oil', 'fuel', 'Fuel',
  'hydraulic', 'Hydraulic', 'air', 'Air', 'cabin', 'Cabin',
  'coolant', 'Coolant', 'dryer', 'Dryer'
];

// Fleetguard code prefixes by filter type
// LF = Lube/Oil, FF = Fuel, HF = Hydraulic, AF = Air, CF/WF = Coolant
const FG_LUBE_PATTERN    = /^LF\d/i;
const FG_FUEL_PATTERN    = /^FF\d/i;
const FG_HYD_PATTERN     = /^HF\d/i;
const FG_AIR_PATTERN     = /^AF\d/i;
const FG_COOLANT_PATTERN = /^(WF|CF)\d/i;

async function run() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('\n' + '='.repeat(70));
  console.log('ELIMFILTERS CROSS-REFERENCE INTEGRITY AUDIT');
  console.log('='.repeat(70) + '\n');

  try {
    // ── 1. SKU prefix vs filter_type mismatches ──────────────────────────────
    console.log('── 1. SKU PREFIX vs FILTER_TYPE MISMATCHES ──');
    const mismatches = await client.query(`
      SELECT sku, filter_type, codigo_base,
        CASE filter_type
          WHEN 'Air Filter'           THEN 'EA1'
          WHEN 'Air Housing'          THEN 'EA2'
          WHEN 'Air Dryer'            THEN 'ED4'
          WHEN 'Hydraulic Filter'     THEN 'EH6'
          WHEN 'Oil Filter'           THEN 'EL8'
          WHEN 'Marine Filter'        THEN 'EM9'
          WHEN 'Fuel/Water Separator' THEN 'ES9'
          WHEN 'Turbine Filter'       THEN 'ET9'
          WHEN 'Cabin Air Filter'     THEN 'EC1'
          WHEN 'Fuel Filter'          THEN 'EF9'
          WHEN 'Coolant Filter'       THEN 'EW7'
          ELSE NULL
        END AS expected_prefix
      FROM elimfilters_catalog
      WHERE filter_type IS NOT NULL
        AND filter_type NOT IN ('Kit Filter','Marine Filter','Air Housing')
      ORDER BY filter_type, sku
    `);

    const prefixMismatches = mismatches.rows.filter(r => {
      if (!r.expected_prefix) return false;
      return !r.sku.startsWith(r.expected_prefix);
    });

    if (prefixMismatches.length === 0) {
      console.log('✅ No SKU prefix mismatches found.\n');
    } else {
      console.log(`⚠️  Found ${prefixMismatches.length} prefix mismatches:`);
      prefixMismatches.forEach(r => {
        console.log(`  ❌ ${r.sku} | type: "${r.filter_type}" | expected prefix: ${r.expected_prefix} | base: ${r.codigo_base}`);
      });
      console.log();
    }

    // ── 2. Non-canonical filter_type values ──────────────────────────────────
    console.log('── 2. NON-CANONICAL filter_type VALUES ──');
    const badTypes = await client.query(`
      SELECT DISTINCT filter_type, COUNT(*) as cnt
      FROM elimfilters_catalog
      WHERE filter_type IS NOT NULL
      GROUP BY filter_type
      ORDER BY filter_type
    `);

    const canonical = new Set(Object.keys(PREFIX_MAP).concat(['Kit Filter', 'Marine Filter', 'Air Housing', 'Fuel Filter - Water Separator', 'Fuel/Water Separator']));
    const nonCanonical = badTypes.rows.filter(r => !canonical.has(r.filter_type));

    if (nonCanonical.length === 0) {
      console.log('✅ All filter_type values are canonical.\n');
    } else {
      console.log(`⚠️  Found ${nonCanonical.length} non-canonical filter_type value(s):`);
      nonCanonical.forEach(r => {
        console.log(`  ❌ "${r.filter_type}" — ${r.cnt} record(s)`);
      });
      console.log();
    }

    // ── 3. Fleetguard LF codes in non-Oil-Filter records (EXACT match) ───────
    console.log('── 3. FLEETGUARD LF CODES IN NON-OIL FILTER RECORDS ──');
    const wrongLF = await client.query(`
      SELECT sku, filter_type,
             jsonb_agg(elem->>'code') FILTER (WHERE (elem->>'code') ~* '^LF[0-9]') as bad_codes
      FROM elimfilters_catalog,
           jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
      WHERE filter_type NOT IN ('Oil Filter','lube','Lube Filter')
        AND (elem->>'code') ~* '^LF[0-9]'
      GROUP BY sku, filter_type
      ORDER BY filter_type, sku
    `);

    if (wrongLF.rows.length === 0) {
      console.log('✅ No Fleetguard LF codes in non-Oil Filter records.\n');
    } else {
      console.log(`⚠️  Found ${wrongLF.rows.length} record(s) with LF codes in wrong filter type:`);
      wrongLF.rows.forEach(r => {
        console.log(`  ❌ ${r.sku} (${r.filter_type}) — bad LF codes: ${JSON.stringify(r.bad_codes)}`);
      });
      console.log();
    }

    // ── 4. Fleetguard FF codes in non-Fuel-Filter records ────────────────────
    console.log('── 4. FLEETGUARD FF CODES IN NON-FUEL FILTER RECORDS ──');
    const wrongFF = await client.query(`
      SELECT sku, filter_type,
             jsonb_agg(elem->>'code') FILTER (WHERE (elem->>'code') ~* '^FF[0-9]') as bad_codes
      FROM elimfilters_catalog,
           jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
      WHERE filter_type NOT IN ('Fuel Filter','Fuel/Water Separator','Fuel Filter - Water Separator')
        AND (elem->>'code') ~* '^FF[0-9]'
      GROUP BY sku, filter_type
      ORDER BY filter_type, sku
      LIMIT 20
    `);

    if (wrongFF.rows.length === 0) {
      console.log('✅ No Fleetguard FF codes in non-Fuel Filter records.\n');
    } else {
      console.log(`⚠️  Found ${wrongFF.rows.length} record(s) with FF codes in wrong filter type:`);
      wrongFF.rows.forEach(r => {
        console.log(`  ❌ ${r.sku} (${r.filter_type}) — bad FF codes: ${JSON.stringify(r.bad_codes)}`);
      });
      console.log();
    }

    // ── 5. Fleetguard HF codes in non-Hydraulic records ──────────────────────
    console.log('── 5. FLEETGUARD HF CODES IN NON-HYDRAULIC FILTER RECORDS ──');
    const wrongHF = await client.query(`
      SELECT sku, filter_type,
             jsonb_agg(elem->>'code') FILTER (WHERE (elem->>'code') ~* '^HF[0-9]') as bad_codes
      FROM elimfilters_catalog,
           jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
      WHERE filter_type NOT IN ('Hydraulic Filter')
        AND (elem->>'code') ~* '^HF[0-9]'
      GROUP BY sku, filter_type
      ORDER BY filter_type, sku
      LIMIT 20
    `);

    if (wrongHF.rows.length === 0) {
      console.log('✅ No Fleetguard HF codes in non-Hydraulic Filter records.\n');
    } else {
      console.log(`⚠️  Found ${wrongHF.rows.length} record(s) with HF codes in wrong filter type:`);
      wrongHF.rows.forEach(r => {
        console.log(`  ❌ ${r.sku} (${r.filter_type}) — bad HF codes: ${JSON.stringify(r.bad_codes)}`);
      });
      console.log();
    }

    // ── 6. Technology vs filter_type contradictions ───────────────────────────
    console.log('── 6. TECHNOLOGY vs FILTER_TYPE CONTRADICTIONS ──');
    const techContradictions = await client.query(`
      SELECT sku, filter_type, technology
      FROM elimfilters_catalog
      WHERE
        (UPPER(technology) LIKE '%SYNTRAX%' AND filter_type != 'Oil Filter')
        OR (UPPER(technology) LIKE '%SYNTEPORE%' AND filter_type NOT IN ('Fuel Filter','Fuel/Water Separator'))
        OR (UPPER(technology) LIKE '%MACROCORE%' AND filter_type != 'Air Filter')
        OR (UPPER(technology) LIKE '%NANOFORCE%' AND filter_type NOT IN ('Hydraulic Filter','Fuel Filter','Fuel/Water Separator'))
        OR (UPPER(technology) LIKE '%MICROKAPPA%' AND filter_type != 'Cabin Air Filter')
        OR (UPPER(technology) LIKE '%DRYCORE%' AND filter_type != 'Air Dryer')
        OR (UPPER(technology) LIKE '%THERMACORE%' AND filter_type != 'Coolant Filter')
      ORDER BY technology, sku
      LIMIT 30
    `);

    if (techContradictions.rows.length === 0) {
      console.log('✅ No technology vs filter_type contradictions.\n');
    } else {
      console.log(`⚠️  Found ${techContradictions.rows.length} technology contradiction(s):`);
      techContradictions.rows.forEach(r => {
        console.log(`  ❌ ${r.sku} | type: "${r.filter_type}" | tech: "${r.technology}"`);
      });
      console.log();
    }

    // ── 7. Summary ────────────────────────────────────────────────────────────
    const total = await client.query('SELECT COUNT(*) FROM elimfilters_catalog');
    console.log('── SUMMARY ──');
    console.log(`Total records in catalog: ${total.rows[0].count}`);
    console.log(`Prefix mismatches: ${prefixMismatches.length}`);
    console.log(`Non-canonical filter types: ${nonCanonical.length}`);
    console.log(`Wrong LF codes: ${wrongLF.rows.length}`);
    console.log(`Wrong FF codes: ${wrongFF.rows.length}`);
    console.log(`Wrong HF codes: ${wrongHF.rows.length}`);
    console.log(`Tech contradictions: ${techContradictions.rows.length}`);
    console.log('\nAudit complete.\n');

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

run();
