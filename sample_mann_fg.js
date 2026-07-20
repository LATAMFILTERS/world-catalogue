const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM mann_fleetguard_matches
    LIMIT 10
  `);

  console.table(r.rows);

  await client.end();

})();
