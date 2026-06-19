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
    SELECT COUNT(*) total
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      SELECT codigo_base
      FROM elimfilters_catalog
      GROUP BY codigo_base
      HAVING COUNT(*) > 1
    )
  `);

  console.table(r.rows);

  await client.end();
})();
