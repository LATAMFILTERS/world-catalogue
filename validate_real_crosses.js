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
   donaldson_part,
   elimfilters_sku

 FROM (
     SELECT
       mf.fleetguard_part,
       mf.mann_part,
       md.donaldson_part,
       md.elimfilters_sku
     FROM mann_fleetguard_matches mf
     LEFT JOIN mann_donaldson_matches md
       ON md.mann_part = mf.mann_part
 ) x

 WHERE fleetguard_part IN (
   'FF42131',
   'LF14002NN',
   'LF3363'
 )

 ORDER BY fleetguard_part

 `);

 console.table(r.rows);

 await client.end();

})();
