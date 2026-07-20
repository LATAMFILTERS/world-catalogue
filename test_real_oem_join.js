const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   COUNT(DISTINCT m.sku) mann_with_don

 FROM mann_oem_clean m

 JOIN oem_codes_clean d
   ON d.code = m.oem_normalized

 `);

 console.table(r.rows);

 await client.end();

})();
