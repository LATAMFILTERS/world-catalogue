const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(*) total_rows
    FROM cross_reference_master
    WHERE fleetguard_part IS NOT NULL
      AND donaldson_part IS NULL
  `);

  console.table(r.rows);

  await client.end();

})();
