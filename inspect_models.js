const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM kg_equipment_models
    ORDER BY id
    LIMIT 50
  `);

  console.table(r.rows);

  await client.end();
})();
