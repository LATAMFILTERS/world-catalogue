const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT COUNT(*) total
    FROM mann_donaldson_matches
  `);

  console.table(r.rows);

  await client.end();

})();
