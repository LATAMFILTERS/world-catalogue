const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT COUNT(DISTINCT fleetguard_part) fg,
           COUNT(DISTINCT mann_part) mann
    FROM mann_fleetguard_matches
  `);

  console.table(r.rows);

  await client.end();

})();
