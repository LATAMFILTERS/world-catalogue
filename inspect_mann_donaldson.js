const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM mann_donaldson_matches
    LIMIT 5
  `);

  console.table(r.rows);

  await client.end();

})();
