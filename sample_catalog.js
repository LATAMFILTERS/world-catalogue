const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT sku, codigo_base, name
    FROM elimfilters_catalog
    ORDER BY RANDOM()
    LIMIT 20
  `);

  console.table(r.rows);

  await client.end();
})();
