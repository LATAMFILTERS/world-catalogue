const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT COUNT(*) total
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      SELECT codigo_base
      FROM elimfilters_catalog
      GROUP BY codigo_base
      HAVING COUNT(*) > 1
    )
  `);

  console.table(r.rows);

  await client.end();
})();
