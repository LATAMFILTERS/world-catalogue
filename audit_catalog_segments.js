const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      filter_type,
      COUNT(*) total
    FROM elimfilters_catalog
    GROUP BY filter_type
    ORDER BY total DESC
  `);

  console.table(r.rows);

  await client.end();

})();
