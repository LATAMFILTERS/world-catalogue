const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT sku,codigo_base
    FROM elimfilters_catalog
    WHERE codigo_base IN ('HF28084','HF28086')
  `);

  console.table(r.rows);

  await client.end();
})();
