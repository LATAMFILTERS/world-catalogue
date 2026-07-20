const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      id,
      slug,
      name,
      (
        SELECT COUNT(*)
        FROM kg_product_systems ps
        WHERE ps.system_id = s.id
      ) products
    FROM kg_systems s
    ORDER BY id
  `);

  console.table(r.rows);

  await client.end();

})();
