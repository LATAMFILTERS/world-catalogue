const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
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
