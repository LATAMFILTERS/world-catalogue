const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM product_element
    WHERE elimfilters_sku IN ('EA10273','EA11607')
  `);

  console.table(r.rows);

  await client.end();
})();
