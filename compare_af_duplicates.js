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
      sku,
      codigo_base,
      jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) oem,
      jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) cross,
      jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) equip
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      'AF1836',
      'AF25673KM'
    )
    ORDER BY codigo_base, sku
  `);

  console.table(r.rows);

  await client.end();
})();
