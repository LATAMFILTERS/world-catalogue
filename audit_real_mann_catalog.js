const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
      segment,
      COUNT(DISTINCT sku) unique_skus
   FROM mann_oem_clean
   GROUP BY segment
   ORDER BY unique_skus DESC
 `);

 console.table(r.rows);

 await client.end();

})();
