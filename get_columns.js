require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'elimfilters_catalog'");
  console.log(res.rows.map(r => r.column_name).join(', '));
  
  const cntRes = await client.query('SELECT COUNT(*) as c FROM public.elimfilters_catalog');
  console.log('HD_ROW_COUNT=' + cntRes.rows[0].c);

  await client.end();
}
run();
