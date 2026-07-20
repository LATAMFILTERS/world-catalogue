const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      fleetguard_part,
      COUNT(*) oems,
      STRING_AGG(DISTINCT oem_brand, ', ') brands
    FROM cross_reference_master
    WHERE fleetguard_part IS NOT NULL
      AND donaldson_part IS NULL
    GROUP BY fleetguard_part
    ORDER BY COUNT(*) DESC
  `);

  console.table(r.rows);

  await client.end();

})();
