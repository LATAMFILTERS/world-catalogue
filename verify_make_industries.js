const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT COUNT(*) total
    FROM kg_make_industries
  `);

  console.log(r.rows[0]);

  await client.end();

})();
