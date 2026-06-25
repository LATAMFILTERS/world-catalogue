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
      fg.fleetguard_part,
      fg.oem_brand,
      fg.oem_normalized,
      d.donaldson_part,
      d.elimfilters_sku
    FROM cross_reference_master fg
    JOIN cross_reference_master d
      ON d.oem_normalized = fg.oem_normalized
     AND d.donaldson_part IS NOT NULL
    WHERE fg.fleetguard_part IS NOT NULL
      AND fg.donaldson_part IS NULL
    ORDER BY fg.fleetguard_part, fg.oem_brand
    LIMIT 500
  `);

  console.table(r.rows);

  await client.end();
})();
