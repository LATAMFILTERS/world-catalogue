const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku IN ('EA11607','EA10273')
  `);

  console.log("ELIMINADOS");

  await client.end();
})();
