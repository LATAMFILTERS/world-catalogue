const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT codigo_base,
           STRING_AGG(sku, ', ' ORDER BY sku) skus
    FROM elimfilters_catalog
    GROUP BY codigo_base
    HAVING COUNT(*) > 1
    ORDER BY codigo_base
  `);

  console.table(r.rows);

  await client.end();
})();
