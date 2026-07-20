const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT mann_part, COUNT(*) qty
    FROM mann_donaldson_matches
    GROUP BY mann_part
    ORDER BY qty DESC
    LIMIT 20
  `);

  console.table(r.rows);

  await client.end();

})();
