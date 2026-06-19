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
      codigo_base,
      sku,
      created_at,
      filter_type,
      technology,
      COALESCE(jsonb_array_length(oem_codes),0) oem,
      COALESCE(jsonb_array_length(competitor_codes),0) cross,
      COALESCE(jsonb_array_length(equipment_applications),0) equip
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      '3904840S',
      'SP1480',
      'SP1490',
      'SP1623',
      'SP72196',
      'SP72197',
      'ST2006HH',
      'TF15006',
      'TF15017'
    )
    ORDER BY codigo_base, sku
  `);

  console.table(r.rows);

  await client.end();
})();
