const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT codigo_base, COUNT(*)
    FROM elimfilters_catalog
    GROUP BY codigo_base
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 50
  `);

  console.table(r.rows);

  await client.end();
})();
