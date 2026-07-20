const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      table_name,
      column_name
    FROM information_schema.columns
    WHERE
      column_name ILIKE '%fleet%'
      OR table_name ILIKE '%fleet%'
    ORDER BY table_name,column_name
  `);

  console.table(r.rows);

  await client.end();

})();
