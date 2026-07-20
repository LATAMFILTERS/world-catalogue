const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT DISTINCT product_sku
    FROM kg_product_equipment
    LIMIT 100
  `);

  console.table(r.rows);

  await client.end();

})();
