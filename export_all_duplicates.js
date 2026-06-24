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
    SELECT codigo_base,
           ARRAY_AGG(sku ORDER BY sku) skus
    FROM elimfilters_catalog
    GROUP BY codigo_base
    HAVING COUNT(*) > 1
    ORDER BY codigo_base
  `);

  require("fs").writeFileSync(
    "duplicate_basecodes.json",
    JSON.stringify(r.rows,null,2)
  );

  console.log("EXPORTADOS:", r.rows.length);

  await client.end();
})();
