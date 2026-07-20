const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM fleetguard_true_cross
    WHERE fleetguard_part='FF149'
  `);

  console.table(r.rows);

  await client.end();

})();
