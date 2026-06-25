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
      COALESCE(jsonb_array_length(oem_codes),0) AS oem_count,
      COALESCE(jsonb_array_length(competitor_codes),0) AS cross_count,
      COALESCE(jsonb_array_length(equipment_applications),0) AS equip_count
    FROM elimfilters_catalog
    WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
    ORDER BY RANDOM()
    LIMIT 50
  `);

  console.table(r.rows);

  await client.end();
})();
