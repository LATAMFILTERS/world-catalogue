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
      codigo_base,
      sku,
      created_at,
      COALESCE(jsonb_array_length(oem_codes),0) oem,
      COALESCE(jsonb_array_length(competitor_codes),0) cross,
      COALESCE(jsonb_array_length(equipment_applications),0) equip
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      SELECT codigo_base
      FROM elimfilters_catalog
      GROUP BY codigo_base
      HAVING COUNT(*) > 1
    )
    ORDER BY codigo_base, created_at
  `);

  fs.writeFileSync(
    "duplicates_detailed.json",
    JSON.stringify(r.rows,null,2)
  );

  console.log("EXPORTADOS:", r.rows.length);

  await client.end();
})();
