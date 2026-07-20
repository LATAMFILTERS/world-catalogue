const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM alternative_group_member
    WHERE element_id IN (
      SELECT id FROM product_element
      WHERE elimfilters_sku IN ('EA18361','EA15673')
    )
  `);

  await client.query(`
    DELETE FROM product_element
    WHERE elimfilters_sku IN ('EA18361','EA15673')
  `);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku IN ('EA18361','EA15673')
  `);

  console.log('DUPLICADOS ELIMINADOS');

  await client.end();
})();
