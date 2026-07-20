const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(DISTINCT donaldson_part) donaldson_parts,
      COUNT(DISTINCT fleetguard_part) fleetguard_parts,
      COUNT(DISTINCT mann_part) mann_parts
    FROM cross_reference_master
  `);

  console.table(r.rows);

  await client.end();

})();
