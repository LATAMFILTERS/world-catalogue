/**
 * diagnose-ld-search.js
 * 
 * Diagnoses why PH3387A returns 500 and PH3614 returns wrong product.
 * Run on Render Shell: node scripts/diagnose-ld-search.js
 */
'use strict';

const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Run on Render shell.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected ✓\n');

  // 1. Check if EL80047 and EL82016 exist
  console.log('=== 1. Check target SKUs exist ===');
  const skus = await client.query(
    `SELECT sku, codigo_base, filter_type,
            jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) AS oem_count,
            jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) AS comp_count,
            CASE WHEN brand_crossrefs IS NULL OR brand_crossrefs = '{}'::jsonb THEN 'empty' ELSE 'present' END AS br_status
     FROM elimfilters_catalog
     WHERE sku IN ('EL80047','EL82016','EL80335','EL82100','EH60222')
     ORDER BY sku`
  );
  skus.rows.forEach(r => console.log(
    `  ${r.sku}  base=${r.codigo_base}  type=${r.filter_type}  oem_codes=${r.oem_count}  competitor_codes=${r.comp_count}  brand_crossrefs=${r.br_status}`
  ));

  // 2. Search oem_codes for PH3387A
  console.log('\n=== 2. oem_codes containing PH3387A ===');
  const oem387 = await client.query(
    `SELECT sku, codigo_base, elem->>'code' AS code, elem->>'manufacturer' AS mfr
     FROM elimfilters_catalog,
          jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) AS elem
     WHERE UPPER(elem->>'code') = 'PH3387A'`
  );
  if (oem387.rows.length === 0) console.log('  NONE');
  else oem387.rows.forEach(r => console.log(`  ${r.sku} (${r.codigo_base}) ${r.mfr} ${r.code}`));

  // 3. Search competitor_codes for PH3387A
  console.log('\n=== 3. competitor_codes containing PH3387A ===');
  const comp387 = await client.query(
    `SELECT sku, codigo_base, elem->>'code' AS code, elem->>'manufacturer' AS mfr
     FROM elimfilters_catalog,
          jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
     WHERE UPPER(elem->>'code') = 'PH3387A'`
  );
  if (comp387.rows.length === 0) console.log('  NONE');
  else comp387.rows.forEach(r => console.log(`  ${r.sku} (${r.codigo_base}) ${r.mfr} ${r.code}`));

  // 4. Search brand_crossrefs for PH3387A
  console.log('\n=== 4. brand_crossrefs containing PH3387A ===');
  try {
    const br387 = await client.query(
      `SELECT sku, codigo_base, kv.key AS brand, code_val
       FROM elimfilters_catalog,
            jsonb_each(COALESCE(brand_crossrefs,'{}'::jsonb)) AS kv,
            jsonb_array_elements_text(kv.value) AS code_val
       WHERE UPPER(code_val) = 'PH3387A'`
    );
    if (br387.rows.length === 0) console.log('  NONE');
    else br387.rows.forEach(r => console.log(`  ${r.sku} (${r.codigo_base}) ${r.brand} ${r.code_val}`));
  } catch (e) {
    console.log('  ERROR (brand_crossrefs query failed):', e.message);
  }

  // 5. Search oem_codes for PH3614
  console.log('\n=== 5. oem_codes containing PH3614 ===');
  const oem3614 = await client.query(
    `SELECT sku, codigo_base, elem->>'code' AS code, elem->>'manufacturer' AS mfr
     FROM elimfilters_catalog,
          jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) AS elem
     WHERE UPPER(elem->>'code') = 'PH3614'`
  );
  if (oem3614.rows.length === 0) console.log('  NONE');
  else oem3614.rows.forEach(r => console.log(`  ${r.sku} (${r.codigo_base}) ${r.mfr} ${r.code}`));

  // 6. Search competitor_codes for PH3614
  console.log('\n=== 6. competitor_codes containing PH3614 ===');
  const comp3614 = await client.query(
    `SELECT sku, codigo_base, elem->>'code' AS code, elem->>'manufacturer' AS mfr
     FROM elimfilters_catalog,
          jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) AS elem
     WHERE UPPER(elem->>'code') = 'PH3614'`
  );
  if (comp3614.rows.length === 0) console.log('  NONE');
  else comp3614.rows.forEach(r => console.log(`  ${r.sku} (${r.codigo_base}) ${r.mfr} ${r.code}`));

  // 7. Check if any brand_crossrefs has non-array values (would crash Tier 5)
  console.log('\n=== 7. Checking for malformed brand_crossrefs (non-array values) ===');
  try {
    const bad = await client.query(
      `SELECT sku, codigo_base
       FROM elimfilters_catalog,
            jsonb_each(COALESCE(brand_crossrefs,'{}'::jsonb)) AS kv
       WHERE jsonb_typeof(kv.value) != 'array'
       LIMIT 10`
    );
    if (bad.rows.length === 0) console.log('  All brand_crossrefs values are arrays ✓');
    else {
      console.log('  WARNING: Non-array brand_crossrefs values found:');
      bad.rows.forEach(r => console.log(`    ${r.sku} (${r.codigo_base})`));
    }
  } catch (e) {
    console.log('  ERROR:', e.message);
  }

  // 8. Count products per category
  console.log('\n=== 8. Catalog overview ===');
  const cats = await client.query(
    `SELECT filter_type, COUNT(*) as n FROM elimfilters_catalog GROUP BY filter_type ORDER BY n DESC`
  );
  cats.rows.forEach(r => console.log(`  ${r.filter_type || 'NULL'}: ${r.n}`));

  await client.end();
  console.log('\nDone.');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
