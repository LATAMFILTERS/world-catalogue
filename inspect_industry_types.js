const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT DISTINCT industry_type
    FROM kg_equipment_makes
    WHERE industry_type IS NOT NULL
    ORDER BY industry_type
  `);

  console.table(r.rows);

  await client.end();
})();
