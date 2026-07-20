const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
