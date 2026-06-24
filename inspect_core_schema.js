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
