const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_name IN (
      'kg_technologies',
      'kg_systems',
      'kg_product_technologies',
      'kg_product_systems',
      'elimfilters_catalog'
    )
    ORDER BY table_name, ordinal_position
  `);

  console.table(r.rows);

  await client.end();
})();
