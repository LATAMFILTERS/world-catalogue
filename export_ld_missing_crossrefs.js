const { Client } = require("pg");

const client = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized:false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT DISTINCT sku
   FROM mann_oem_clean
   WHERE segment='LD'
   EXCEPT
   SELECT DISTINCT mann_part
   FROM cross_reference_master
   WHERE mann_part IS NOT NULL
 `);

 console.log("MISSING:", r.rows.length);

 require("fs").writeFileSync(
   "ld_missing_crossrefs.txt",
   r.rows.map(x=>x.sku).join("\n")
 );

 await client.end();

})();
