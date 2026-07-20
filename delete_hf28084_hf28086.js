const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const skus = ['EH68084','EH68086'];

  await client.query(`
    DELETE FROM model_element_compatibility
    WHERE product_model_id IN (
      SELECT id
      FROM product_model
      WHERE elimfilters_sku = ANY($1)
    )
  `,[skus]);

  await client.query(`
    DELETE FROM product_model
    WHERE elimfilters_sku = ANY($1)
  `,[skus]);

  const r = await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku = ANY($1)
    RETURNING sku,codigo_base
  `,[skus]);

  console.table(r.rows);

  await client.end();
})();
