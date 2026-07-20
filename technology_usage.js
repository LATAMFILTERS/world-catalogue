const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT
      technology_id,
      COUNT(*) products
    FROM kg_product_technologies
    GROUP BY technology_id
    ORDER BY products DESC
  `);

  console.table(r.rows);

  await client.end();
})();
