require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const query = "3387";

  console.log('--- BUSCANDO EN LD (3387) ---');
  try {
    const resLd = await client.query(`
      SELECT elimfilters_sku, competitor_brand, competitor_part_number 
      FROM ld_catalog.ld_competitor_cross_references 
      WHERE competitor_part_number ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    console.table(resLd.rows);
  } catch (e) { console.log(e.message); }

  console.log('\\n--- BUSCANDO EN HD (cross_reference_master) ---');
  try {
    const resHd1 = await client.query(`
      SELECT * 
      FROM public.cross_reference_master 
      WHERE target_code ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    console.table(resHd1.rows);
  } catch (e) { console.log(e.message); }

  console.log('\\n--- BUSCANDO EN HD (elimfilters_catalog competitor_codes) ---');
  try {
    const resHd2 = await client.query(`
      SELECT sku 
      FROM public.elimfilters_catalog 
      WHERE competitor_codes::text ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    console.table(resHd2.rows);
  } catch (e) { console.log(e.message); }

  await client.end();
}
run();
