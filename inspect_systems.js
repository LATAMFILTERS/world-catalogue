const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT id, slug, name
    FROM kg_systems
    ORDER BY id
  `);

  console.table(r.rows);

  await client.end();

})();

