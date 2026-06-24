require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT sku, codigo_base, oem_codes, competitor_codes
    FROM public.elimfilters_catalog 
    WHERE sku IN ('EL81016', 'EL82100')
  `);
  
  for (const row of res.rows) {
    console.log('SKU:', row.sku);
    console.log('Codigo base:', row.codigo_base);
    const hasLF3620_oem = JSON.stringify(row.oem_codes).includes('LF3620');
    const hasLF3620_comp = JSON.stringify(row.competitor_codes).includes('LF3620');
    console.log('Has LF3620 in OEM?', hasLF3620_oem);
    console.log('Has LF3620 in Comp?', hasLF3620_comp);
    console.log('---');
  }

  // Find all HD SKUs containing LF3620
  const allLF3620 = await client.query(`
    SELECT sku, codigo_base FROM public.elimfilters_catalog
    WHERE oem_codes::text ILIKE '%LF3620%'
       OR competitor_codes::text ILIKE '%LF3620%'
  `);
  console.log('All HD SKUs containing LF3620:');
  console.table(allLF3620.rows);

  await client.end();
}
run();
