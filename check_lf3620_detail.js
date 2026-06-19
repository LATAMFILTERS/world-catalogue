require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT sku, codigo_base, oem_codes, competitor_codes
    FROM public.elimfilters_catalog 
    WHERE sku IN ('EL81016', 'EL82100', 'EL83998')
  `);
  
  for (const row of res.rows) {
    console.log('\\n=== SKU:', row.sku, '===');
    const oem = row.oem_codes || [];
    const comp = row.competitor_codes || [];
    const matchOem = oem.filter(c => String(c.code).toUpperCase() === 'LF3620' || String(c.part_number).toUpperCase() === 'LF3620');
    const matchComp = comp.filter(c => String(c.code).toUpperCase() === 'LF3620' || String(c.part_number).toUpperCase() === 'LF3620');
    
    console.log('OEM matches:', matchOem);
    console.log('Comp matches:', matchComp);
    
    // Are there alternatives configured?
    const altRes = await client.query(`SELECT alternatives FROM public.elimfilters_catalog WHERE sku = $1`, [row.sku]);
    console.log('Alternatives:', altRes.rows[0].alternatives);
  }

  await client.end();
}
run();
