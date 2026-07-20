const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM alternative_group_member
    WHERE element_id IN (330,332)
  `);

  await client.query(`
    DELETE FROM product_element
    WHERE id IN (330,332)
  `);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku IN ('EA10273','EA11607')
  `);

  console.log('ELIMINADOS');

  await client.end();
})();
