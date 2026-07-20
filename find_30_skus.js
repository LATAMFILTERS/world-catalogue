const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const codes = fs.readFileSync(
    "af1xxx_delete_candidates.txt",
    "utf8"
  ).split(/\r?\n/).filter(Boolean);

  const r = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE codigo_base = ANY($1)
     ORDER BY codigo_base`,
    [codes]
  );

  console.table(r.rows);

  await client.end();
})();
