const { Client } = require("pg");

const client = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized:false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   fleetguard_part,
   mann_part,
   elimfilters_sku,
   oem_normalized,
   oem_brand

 FROM mann_fleetguard_matches

 WHERE fleetguard_part='LF756'

 ORDER BY mann_part

 `);

 console.table(r.rows);

 await client.end();

})();

