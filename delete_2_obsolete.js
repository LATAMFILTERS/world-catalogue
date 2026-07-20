const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM product_element
    WHERE elimfilters_sku IN ('EA10273','EA11607')
  `);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku IN ('EA10273','EA11607')
  `);

  console.log('ELIMINADOS');

  await client.end();
})();
