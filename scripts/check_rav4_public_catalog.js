'use strict';
const { Client } = require('pg');
const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

(async () => {
  await client.connect();
  const skus = ['EA37063','EC31919','EL36006'];
  const result = await client.query(
    `SELECT sku, codigo_base, filter_type, name, is_primary
       FROM elimfilters_catalog
      WHERE sku = ANY($1::text[])
      ORDER BY sku`,
    [skus]
  );
  console.log(JSON.stringify(result.rows, null, 2));
  await client.end();
})().catch(async e => {
  console.error(e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
