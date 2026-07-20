const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     fleetguard_part,
     mann_part,
     oem_normalized,
     oem_brand
 FROM cross_reference_master
 WHERE donaldson_part IS NULL
 LIMIT 50

 `);

 console.table(r.rows);

 await client.end();

})();
