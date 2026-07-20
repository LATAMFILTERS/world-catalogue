const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT sku,codigo_base,filter_type,technology
    FROM elimfilters_catalog
    WHERE codigo_base LIKE 'CV%'
    ORDER BY codigo_base, sku
    LIMIT 30
  `);

  console.table(r.rows);

  await client.end();
})();
