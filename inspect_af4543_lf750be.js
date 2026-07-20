const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT
      sku,
      codigo_base,
      created_at,
      COALESCE(jsonb_array_length(oem_codes),0) oem,
      COALESCE(jsonb_array_length(competitor_codes),0) cross,
      COALESCE(jsonb_array_length(equipment_applications),0) equip
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      'AF4543',
      'LF750BE'
    )
    ORDER BY codigo_base, created_at
  `);

  console.table(r.rows);

  await client.end();
})();
