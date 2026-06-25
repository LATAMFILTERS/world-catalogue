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

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    ux_catalog_codigo_base
    ON elimfilters_catalog(codigo_base)
  `);

  console.log("UNIQUE INDEX CREADO");

  await client.end();
})();
