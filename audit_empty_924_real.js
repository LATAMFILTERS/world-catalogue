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

  const r = await client.query(`
    SELECT
      e.sku,
      e.codigo_base,

      (SELECT COUNT(*)
       FROM product_model pm
       WHERE pm.elimfilters_sku = e.sku) models,

      (SELECT COUNT(*)
       FROM product_element pe
       WHERE pe.elimfilters_sku = e.sku) elements,

      (SELECT COUNT(*)
       FROM kg_product_equipment k
       WHERE k.product_sku = e.sku) equipment

    FROM elimfilters_catalog e
    WHERE e.fleetguard_attributes IS NULL
  `);

  const deletable = r.rows.filter(x =>
    Number(x.models) === 0 &&
    Number(x.elements) === 0 &&
    Number(x.equipment) === 0
  );

  console.log("TOTAL EMPTY:", r.rows.length);
  console.log("SAFE DELETE:", deletable.length);

  await client.end();

})();
