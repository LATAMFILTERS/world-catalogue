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
    SELECT sku,codigo_base
    FROM elimfilters_catalog
    WHERE sku IN (
      'EF94840',
      'EF91480',
      'EF94901',
      'EF91623',
      'EF92196',
      'EF92197',
      'EF90062',
      'EF95006',
      'EF90175'
    )
    ORDER BY sku
  `);

  console.table(r.rows);

  await client.end();
})();
