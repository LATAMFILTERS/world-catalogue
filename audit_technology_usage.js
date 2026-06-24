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
