const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const skus = [
    'EH60497',
    'EH60507',
    'EH60827',
    'EH60837',
    'EH60877',
    'EH61307'
  ];

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

  console.log("HF DUPLICADOS ELIMINADOS");

  await client.end();
})();
