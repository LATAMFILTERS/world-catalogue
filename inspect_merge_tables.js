const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.LEGACY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  console.log("\n=== PRODUCT_MODEL ===");

  const pm = await client.query(`
    SELECT column_name,data_type
    FROM information_schema.columns
    WHERE table_name='product_model'
    ORDER BY ordinal_position
  `);

  console.table(pm.rows);

  console.log("\n=== PRODUCT_ELEMENT ===");

  const pe = await client.query(`
    SELECT column_name,data_type
    FROM information_schema.columns
    WHERE table_name='product_element'
    ORDER BY ordinal_position
  `);

  console.table(pe.rows);

  console.log("\n=== FK REFERENCES ===");

  const fk = await client.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type='FOREIGN KEY'
      AND ccu.table_name='elimfilters_catalog'
      AND ccu.column_name='sku'
    ORDER BY tc.table_name
  `);

  console.table(fk.rows);

  await client.end();
})();
