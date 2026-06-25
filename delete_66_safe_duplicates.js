const { Client } = require("pg");
const skus = require("./safe_delete_duplicates.json");

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
      SELECT id
      FROM product_element
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
