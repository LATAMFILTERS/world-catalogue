const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.LEGACY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT current_database(),
           current_schema(),
           version()
  `);

  console.log(r.rows[0]);

  await client.end();
})();
