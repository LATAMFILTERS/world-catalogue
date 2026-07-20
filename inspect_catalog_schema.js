const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'elimfilters_catalog'
    ORDER BY ordinal_position
  `);

  console.table(r.rows);

  await client.end();
})();
