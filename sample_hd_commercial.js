const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT sku
    FROM mann_oem_clean
    WHERE segment='HD'
      AND (
        sku LIKE 'C%'
        OR sku LIKE 'CF%'
        OR sku LIKE 'CU%'
        OR sku LIKE 'CUK%'
        OR sku LIKE 'WK%'
        OR sku LIKE 'PU%'
        OR sku LIKE 'HU%'
        OR sku LIKE 'W%'
        OR sku LIKE 'BF%'
        OR sku LIKE 'LB%'
      )
    ORDER BY sku
    LIMIT 20
  `);

  console.table(r.rows);

  await client.end();

})();
