const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT
      t.display_name,
      COUNT(*) products
    FROM kg_product_technologies pt
    JOIN kg_technologies t
      ON t.id = pt.technology_id
    GROUP BY t.display_name
    ORDER BY products DESC
  `);

  console.table(r.rows);

  await client.end();

})();
