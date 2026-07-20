const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM alternative_group_member
    WHERE element_id IN (330,332)
  `);

  console.table(r.rows);

  await client.end();
})();
