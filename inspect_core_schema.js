const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const tables = [
    'cross_reference_master',
    'oem_codes_clean',
    'product_model',
    'product_element',
    'kg_product_equipment'
  ];

  for (const t of tables) {

    const r = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `,[t]);

    console.log("\n=== " + t + " ===");
    console.table(r.rows);

  }

  await client.end();

})();
