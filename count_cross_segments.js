const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      segment,
      COUNT(*) total
    FROM cross_reference_master
    GROUP BY segment
    ORDER BY total DESC
  `);

  console.table(r.rows);

  await client.end();

})();
