const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT
      LEFT(codigo_base,2) AS prefix,
      COUNT(*) AS total
    FROM elimfilters_catalog
    WHERE codigo_base IS NOT NULL
    GROUP BY LEFT(codigo_base,2)
    ORDER BY total DESC
    LIMIT 30
  `);

  console.table(r.rows);

  await client.end();
})();
