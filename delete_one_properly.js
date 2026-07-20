const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const sku = 'EF91480';

  await client.query(
    `DELETE FROM model_element_compatibility
     WHERE product_model_id IN (
       SELECT id FROM product_model
       WHERE elimfilters_sku = $1
     )`,
    [sku]
  );

  await client.query(
    `DELETE FROM product_model
     WHERE elimfilters_sku = $1`,
    [sku]
  );

  const r = await client.query(
    `DELETE FROM elimfilters_catalog
     WHERE sku = $1
     RETURNING sku`,
    [sku]
  );

  console.table(r.rows);

  await client.end();
})();
