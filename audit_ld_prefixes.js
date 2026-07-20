const { Client } = require("pg");

const client = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized:false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
     LEFT(sku,1) prefix,
     COUNT(DISTINCT sku) total
   FROM mann_oem_clean
   WHERE segment='LD'
   GROUP BY 1
   ORDER BY 2 DESC
 `);

 console.table(r.rows);

 await client.end();

})();
