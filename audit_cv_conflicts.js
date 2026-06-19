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
      codigo_base,
      sku,
      filter_type,
      technology
    FROM elimfilters_catalog
    WHERE codigo_base IN (
      'CV50304',
      'CV50840',
      'CV50841',
      'CV50842',
      'CV50843',
      'CV50850',
      'CV50854',
      'CV50855'
    )
    ORDER BY codigo_base, sku
  `);

  console.table(r.rows);

  await client.end();
})();
