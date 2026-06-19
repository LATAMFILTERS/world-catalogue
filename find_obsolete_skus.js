const { Client } = require("pg");
const fs = require("fs");

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

  const codes = fs.readFileSync(
    "confirmed_obsolete.txt",
    "utf8"
  ).split(/\r?\n/).filter(Boolean);

  const r = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE codigo_base = ANY($1)`,
    [codes]
  );

  console.table(r.rows);

  await client.end();
})();
