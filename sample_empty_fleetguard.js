const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT sku, codigo_base
    FROM elimfilters_catalog
    WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
      AND COALESCE(jsonb_array_length(oem_codes),0)=0
      AND COALESCE(jsonb_array_length(competitor_codes),0)=0
      AND COALESCE(jsonb_array_length(equipment_applications),0)=0
    ORDER BY codigo_base
    LIMIT 100
  `);

  console.table(r.rows);

  await client.end();
})();
