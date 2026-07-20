const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku='EF91480'
    RETURNING sku
  `);

  console.table(r.rows);

  await client.end();
})();
