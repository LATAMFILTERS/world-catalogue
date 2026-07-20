const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT mann_part
    FROM cross_reference_master
    WHERE mann_part IS NOT NULL
    LIMIT 50
  `);

  console.table(r.rows);

  await client.end();

})();
