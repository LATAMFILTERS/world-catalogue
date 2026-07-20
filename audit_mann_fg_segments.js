const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      mann_segment,
      COUNT(*) total
    FROM mann_fleetguard_matches
    GROUP BY mann_segment
    ORDER BY total DESC
  `);

  console.table(r.rows);

  await client.end();

})();
