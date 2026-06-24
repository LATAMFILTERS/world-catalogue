require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('SET search_path TO ld_catalog, public');

  // Find entries where the part number looks like a description (contains spaces + words)
  const res = await client.query(`
    SELECT id, elimfilters_sku, competitor_brand, competitor_part_number
    FROM ld_competitor_cross_references
    WHERE competitor_part_number LIKE '%PREMIUM%'
       OR competitor_part_number LIKE '%FILTER%'
       OR competitor_part_number LIKE '%SEAL%'
       OR competitor_part_number LIKE '% % % %'
    LIMIT 20
  `);
  
  console.log('Garbage samples:');
  console.table(res.rows);

  // Also check the frontend display: what does the HD catalog show for W 712/22
  const hdRes = await client.query(`
    SELECT sku, competitor_codes::text 
    FROM public.elimfilters_catalog 
    WHERE competitor_codes::text ILIKE '%712/22%' 
       OR competitor_codes::text ILIKE '%W71222%'
       OR oem_codes::text ILIKE '%712/22%'
    LIMIT 5
  `);
  console.log('\nHD catalog entries matching W 712/22:');
  console.table(hdRes.rows.map(r => ({ sku: r.sku })));

  await client.end();
}
run();
