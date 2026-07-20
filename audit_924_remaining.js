const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      e.sku,
      e.codigo_base,

      (SELECT COUNT(*) FROM product_oem_reference o
       WHERE o.elimfilters_sku = e.sku) oem,

      (SELECT COUNT(*) FROM product_cross_reference c
       WHERE c.elimfilters_sku = e.sku) cross,

      (SELECT COUNT(*) FROM product_model m
       WHERE m.elimfilters_sku = e.sku) models

    FROM elimfilters_catalog e
    WHERE e.codigo_base IN (
      SELECT codigo_base
      FROM elimfilters_catalog
      WHERE fleetguard_attributes IS NULL
    )
  `);

  const deletables = r.rows.filter(x =>
    Number(x.oem) === 0 &&
    Number(x.cross) === 0 &&
    Number(x.models) === 0
  );

  fs.writeFileSync(
    "fleetguard_delete_candidates.json",
    JSON.stringify(deletables,null,2)
  );

  console.log("TOTAL:", r.rows.length);
  console.log("DELETE:", deletables.length);

  await client.end();

})();
