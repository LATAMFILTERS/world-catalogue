const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(DISTINCT mann_part) mann_hd
    FROM mann_donaldson_matches
    WHERE assigned_segment='HD'
  `);

  console.table(r.rows);

  await client.end();

})();
