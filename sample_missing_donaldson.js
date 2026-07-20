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
    WHERE donaldson_part IS NULL
    LIMIT 100
  `);

  console.table(r.rows);

  await client.end();

})();
