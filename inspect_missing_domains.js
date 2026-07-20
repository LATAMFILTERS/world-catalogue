const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public'
      AND (
        table_name ILIKE '%problem%'
        OR table_name ILIKE '%asset%'
        OR table_name ILIKE '%standard%'
      )
    ORDER BY table_name
  `);

  console.table(r.rows);

  await client.end();
})();
