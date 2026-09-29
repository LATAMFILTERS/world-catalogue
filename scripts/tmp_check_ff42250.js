const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const cross = await c.query('SELECT * FROM cross_reference WHERE UPPER(fleetguard_part)=UPPER($1) LIMIT 20', ['FF42250']);
  const catalog = await c.query('SELECT sku,codigo_base,filter_type,sub_type,technology FROM elimfilters_catalog WHERE UPPER(codigo_base)=UPPER($1) OR UPPER(sku)=UPPER($1) LIMIT 20', ['FF42250']);
  console.log(JSON.stringify({ cross: cross.rows, catalog: catalog.rows }, null, 2));
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });