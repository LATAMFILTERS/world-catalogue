const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT
      product_sku,
      COUNT(*) relations
    FROM kg_product_equipment
    GROUP BY product_sku
    ORDER BY relations DESC
    LIMIT 25
  `);

  console.table(r.rows);

  await client.end();
})();
