const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(*) total,

      SUM(
        CASE WHEN EXISTS(
          SELECT 1
          FROM product_model pm
          WHERE pm.elimfilters_sku = e.sku
        )
        THEN 1 ELSE 0 END
      ) as has_model,

      SUM(
        CASE WHEN EXISTS(
          SELECT 1
          FROM product_element pe
          WHERE pe.elimfilters_sku = e.sku
        )
        THEN 1 ELSE 0 END
      ) as has_element,

      SUM(
        CASE WHEN EXISTS(
          SELECT 1
          FROM kg_product_equipment k
          WHERE k.product_sku = e.sku
        )
        THEN 1 ELSE 0 END
      ) as has_equipment

    FROM elimfilters_catalog e

    WHERE codigo_base ~ '^(AF|LF|FF|FS|HF|WF|AH|ST|DB)'
      AND COALESCE(jsonb_array_length(oem_codes),0)=0
      AND COALESCE(jsonb_array_length(competitor_codes),0)=0
      AND COALESCE(jsonb_array_length(equipment_applications),0)=0
  `);

  console.table(r.rows);

  await client.end();

})();
