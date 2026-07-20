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
    WHERE codigo_base IN (
      'AF1836',
      'AF25673KM',
      'HF7082F',
      'HF7130F',
      'HF7049',
      'HF7050',
      'HF7083F',
      'HF7087F'
    )
    ORDER BY codigo_base, sku
  `);

  console.table(r.rows);

  await client.end();
})();
