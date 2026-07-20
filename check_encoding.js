const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      id,
      display_name
    FROM kg_technologies
    ORDER BY id
  `);

  console.table(r.rows);

  await client.end();

})();
