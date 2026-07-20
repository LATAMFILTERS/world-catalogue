const { Client } = require("pg");

const skus = [
  'EF90523',
  'EL80847',
  'EL80848',
  'EF91551'
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM model_element_compatibility
    WHERE product_model_id IN (
      SELECT id FROM product_model
      WHERE elimfilters_sku = ANY($1)
    )
  `,[skus]);

  await client.query(`
    DELETE FROM alternative_group_member
    WHERE element_id IN (
      SELECT id FROM product_element
      WHERE elimfilters_sku = ANY($1)
    )
  `,[skus]);

  await client.query(`
    DELETE FROM product_model
    WHERE elimfilters_sku = ANY($1)
  `,[skus]);

  await client.query(`
    DELETE FROM product_element
    WHERE elimfilters_sku = ANY($1)
  `,[skus]);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku = ANY($1)
  `,[skus]);

  console.log("ELIMINADOS:", skus.length);

  await client.end();
})();
