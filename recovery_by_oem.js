const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
