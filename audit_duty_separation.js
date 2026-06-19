require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // 1. What duty values exist in HD catalog?
  const duties = await client.query(`SELECT duty, COUNT(*) as c FROM public.elimfilters_catalog GROUP BY duty ORDER BY c DESC`);
  console.log('DUTY distribution in HD catalog:');
  console.table(duties.rows);

  // 2. Are there LD-flagged products in HD catalog?
  const ldInHd = await client.query(`SELECT sku, duty FROM public.elimfilters_catalog WHERE duty ILIKE '%ld%' OR duty ILIKE '%light%' LIMIT 20`);
  console.log('\nLD products found in HD catalog:');
  console.table(ldInHd.rows);

  // 3. Cross-check: EL51222 in HD?
  const el51222hd = await client.query(`SELECT sku, duty, oem_codes::text FROM public.elimfilters_catalog WHERE sku = 'EL51222'`);
  console.log('\nEL51222 in HD catalog:');
  console.table(el51222hd.rows);

  // 4. EL80047 duty?
  const el80047 = await client.query(`SELECT sku, duty, name FROM public.elimfilters_catalog WHERE sku = 'EL80047'`);
  console.log('\nEL80047 (HD):');
  console.table(el80047.rows);

  // 5. Is W712/22 actually in EL80047 oem_codes?
  const check = await client.query(`
    SELECT sku, duty FROM public.elimfilters_catalog
    WHERE oem_codes::text ILIKE '%712/22%'
       OR oem_codes::text ILIKE '%712_22%'
       OR competitor_codes::text ILIKE '%712/22%'
  `);
  console.log('\nSKUs in HD with W712/22 in any codes:');
  console.table(check.rows);

  // 6. Check LD SKUs in HD (SKU prefix EL5xxxx = LD)
  const ldSkusInHd = await client.query(`
    SELECT sku, duty, filter_type::text FROM public.elimfilters_catalog 
    WHERE sku LIKE 'EL5%' OR sku LIKE 'EL6%' OR sku LIKE 'EL7%'
    LIMIT 10
  `);
  console.log('\nLD-style SKUs (EL5/6/7xxx) in HD catalog:');
  console.table(ldSkusInHd.rows);

  await client.end();
}
run();
