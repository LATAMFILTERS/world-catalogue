'use strict';
const { Client } = require('pg');
const client = new Client({
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('CONNECTED');

  console.log('\n=== Q4: Equipment manufacturers unique list (top 100) ===');
  let r = await client.query(`SELECT
    UPPER(TRIM(elem->>'manufacturer')) as manufacturer,
    COUNT(*) as product_count
  FROM elimfilters_catalog,
       jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb)) AS elem
  WHERE elem->>'manufacturer' IS NOT NULL
    AND elem->>'manufacturer' != ''
  GROUP BY UPPER(TRIM(elem->>'manufacturer'))
  ORDER BY product_count DESC
  LIMIT 100`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q5: Equipment applications sample ===');
  r = await client.query(`SELECT sku, equipment_applications
  FROM elimfilters_catalog
  WHERE equipment_applications IS NOT NULL
    AND jsonb_array_length(equipment_applications) > 0
  LIMIT 10`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q6: OEM codes format sample ===');
  r = await client.query(`SELECT sku, oem_codes
  FROM elimfilters_catalog
  WHERE oem_codes IS NOT NULL
    AND jsonb_array_length(oem_codes) > 0
  LIMIT 15`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q7: Competitor codes format sample ===');
  r = await client.query(`SELECT sku, competitor_codes
  FROM elimfilters_catalog
  WHERE competitor_codes IS NOT NULL
    AND jsonb_array_length(competitor_codes) > 0
  LIMIT 15`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q8: Brand crossrefs format sample ===');
  r = await client.query(`SELECT sku, brand_crossrefs
  FROM elimfilters_catalog
  WHERE brand_crossrefs IS NOT NULL
    AND brand_crossrefs != '{}'::jsonb
  LIMIT 10`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q9: OEM manufacturer distribution ===');
  r = await client.query(`SELECT
    UPPER(TRIM(elem->>'manufacturer')) as manufacturer,
    COUNT(*) as count
  FROM elimfilters_catalog,
       jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS elem
  WHERE elem->>'manufacturer' IS NOT NULL
  GROUP BY UPPER(TRIM(elem->>'manufacturer'))
  ORDER BY count DESC
  LIMIT 50`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q10: Competitor brand distribution ===');
  r = await client.query(`SELECT
    UPPER(TRIM(elem->>'manufacturer')) as brand,
    COUNT(*) as count
  FROM elimfilters_catalog,
       jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb)) AS elem
  WHERE elem->>'manufacturer' IS NOT NULL
  GROUP BY UPPER(TRIM(elem->>'manufacturer'))
  ORDER BY count DESC
  LIMIT 30`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  await client.end();
}
run().catch(e => { console.error('FAILED:', e.message, e.stack); process.exit(1); });
