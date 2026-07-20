const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  console.log("\n=== SYSTEMS ===");

  let r = await client.query(`
    SELECT *
    FROM kg_systems
    ORDER BY id
  `);

  console.table(r.rows);

  console.log("\n=== TECHNOLOGIES ===");

  r = await client.query(`
    SELECT *
    FROM kg_technologies
    ORDER BY id
  `);

  console.table(r.rows);

  await client.end();
})();
