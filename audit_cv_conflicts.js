const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
