const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r1 = await client.query(`
    SELECT COUNT(DISTINCT sku) total
    FROM mann_oem_clean
    WHERE segment='HD'
      AND sku LIKE '%_MANN-FILTER'
  `);

  console.log("HD TOTAL");
  console.table(r1.rows);

  const r2 = await client.query(`
    SELECT COUNT(DISTINCT sku) total
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
  `);

  console.log("COMMERCIAL FILTERS");
  console.table(r2.rows);

  await client.end();

})();
