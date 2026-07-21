'use strict';
/**
 * READ-ONLY diagnostic. Quantifies two data-quality issues surfaced
 * 2026-07-21 while cross-referencing Onan kit components: a single
 * Fleetguard code (AF25538) matched SKUs across oil/fuel/air/hydraulic
 * filter_types AND appeared duplicated inside a single SKU's oem_codes
 * array. This checks how widespread that is across the whole catalog
 * before any cleanup migration gets written.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log('--- 1) SKUs with duplicate entries inside their own oem_codes array ---');
  const dupOem = await client.query(`
    SELECT sku, count(*) AS total, count(DISTINCT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g'))) AS distinct_codes
      FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
     GROUP BY sku
    HAVING count(*) > count(DISTINCT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')))
  `);
  console.log(`  ${dupOem.rows.length} SKUs affected (oem_codes)`);
  dupOem.rows.slice(0, 10).forEach(r => console.log(`    ${r.sku}  total=${r.total}  distinct=${r.distinct_codes}`));

  console.log('\n--- 2) SKUs with duplicate entries inside their own competitor_codes array ---');
  const dupComp = await client.query(`
    SELECT sku, count(*) AS total, count(DISTINCT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g'))) AS distinct_codes
      FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
     GROUP BY sku
    HAVING count(*) > count(DISTINCT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')))
  `);
  console.log(`  ${dupComp.rows.length} SKUs affected (competitor_codes)`);
  dupComp.rows.slice(0, 10).forEach(r => console.log(`    ${r.sku}  total=${r.total}  distinct=${r.distinct_codes}`));

  console.log('\n--- 3) Codes that cross-reference SKUs of more than one filter_type (oem+competitor combined) ---');
  const crossType = await client.query(`
    SELECT normalized_code, count(DISTINCT filter_type) AS distinct_types,
           count(DISTINCT sku) AS distinct_skus, array_agg(DISTINCT filter_type) AS types
      FROM (
        SELECT sku, filter_type, UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) AS normalized_code
          FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
         UNION
        SELECT sku, filter_type, UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) AS normalized_code
          FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
      ) x
     WHERE normalized_code <> ''
     GROUP BY normalized_code
    HAVING count(DISTINCT filter_type) > 1
     ORDER BY distinct_skus DESC
     LIMIT 30
  `);
  console.log(`  showing top 30 by distinct_skus (there may be more - see total below)`);
  crossType.rows.forEach(r => console.log(`    ${r.normalized_code}  types=${r.types}  distinct_skus=${r.distinct_skus}`));

  const crossTypeCount = await client.query(`
    SELECT count(*) AS total FROM (
      SELECT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) AS normalized_code, filter_type
        FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
       UNION
      SELECT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) AS normalized_code, filter_type
        FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
    ) x
    WHERE normalized_code <> ''
    GROUP BY normalized_code
    HAVING count(DISTINCT filter_type) > 1
  `);
  console.log(`  TOTAL codes with cross-filter_type collisions: ${crossTypeCount.rows.length}`);

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
