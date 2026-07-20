const fs = require("fs");
const { Client } = require("pg");

const skus = fs.readFileSync(
  "hf_obsolete_confirmed.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM model_element_compatibility
    WHERE product_model_id IN (
      SELECT id
      FROM product_model
      WHERE elimfilters_sku = ANY($1)
    )
  `,[skus]);

  await client.query(`
    DELETE FROM product_model
    WHERE elimfilters_sku = ANY($1)
  `,[skus]);

  const r = await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE codigo_base = ANY($1)
    RETURNING sku,codigo_base
  `,[skus]);

  console.table(r.rows);

  await client.end();
})();
