const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(*) total_rows,
      COUNT(DISTINCT mann_part) mann_parts,
      COUNT(DISTINCT fleetguard_part) fg_parts
    FROM mann_fleetguard_matches
  `);

  console.table(r.rows);

  await client.end();

})();
