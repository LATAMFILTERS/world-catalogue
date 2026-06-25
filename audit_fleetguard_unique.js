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
      COUNT(*) FILTER (
        WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
      ) AS total_fg,

      COUNT(*) FILTER (
        WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
          AND oem_codes IS NOT NULL
          AND jsonb_array_length(oem_codes) > 0
      ) AS con_oem,

      COUNT(*) FILTER (
        WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
          AND competitor_codes IS NOT NULL
          AND jsonb_array_length(competitor_codes) > 0
      ) AS con_cross,

      COUNT(*) FILTER (
        WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
          AND equipment_applications IS NOT NULL
          AND jsonb_array_length(equipment_applications) > 0
      ) AS con_equipment

    FROM elimfilters_catalog
  `);

  console.table(r.rows);

  await client.end();
})();
