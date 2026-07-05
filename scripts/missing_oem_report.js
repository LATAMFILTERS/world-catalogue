const fs = require("fs");
const { Client } = require("pg");

(async () => {

  const db = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await db.connect();

  const r = await db.query(`
    SELECT
      c.sku,
      c.duty,
      c.filter_type
    FROM elimfilters_catalog c
    WHERE NOT EXISTS (
      SELECT 1
      FROM oem_codes o
      WHERE o.catalog_id = c.id
    )
    ORDER BY c.duty, c.filter_type, c.sku
  `);

  fs.writeFileSync(
    "missing_oem.csv",
    "sku,duty,product_type`n" +
    r.rows.map(x => `${x.sku},${x.duty},${x.product_type}`).join("`n")
  );

  console.log("CSV generado:", r.rows.length);

  await db.end();

})().catch(err => {
  console.error(err);
  process.exit(1);
});

