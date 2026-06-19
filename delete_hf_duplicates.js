const { Client } = require("pg");

const deleteSkus = [
  'EH60497',
  'EH60507',
  'EH60827',
  'EH60837',
  'EH60877',
  'EH61307'
];

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
    WHERE element_id IN (
      SELECT id FROM product_element
      WHERE elimfilters_sku = ANY($1)
    )
  `, [deleteSkus]);

  await client.query(`
    DELETE FROM product_element
    WHERE elimfilters_sku = ANY($1)
  `, [deleteSkus]);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku = ANY($1)
  `, [deleteSkus]);

  console.log('HF DUPLICADOS ELIMINADOS');

  await client.end();
})();
