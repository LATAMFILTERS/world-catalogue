const { Client } = require("pg");

const skus = [
'EF90062',
'EF90175',
'EF91623',
'EF92196',
'EF92197',
'EF94840',
'EF94901',
'EF95006'
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
    RETURNING sku
  `,[skus]);

  console.log("ELIMINADOS:", r.rowCount);

  await client.end();
})();
