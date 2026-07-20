const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
      COUNT(*) total_rows,
      COUNT(DISTINCT code) unique_oems,
      COUNT(DISTINCT sku) unique_skus
   FROM oem_codes_clean
 `);

 console.table(r.rows);

 await client.end();

})();
