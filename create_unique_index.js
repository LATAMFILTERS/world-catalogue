const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
