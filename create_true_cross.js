const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 await client.query(`

 DROP TABLE IF EXISTS fleetguard_true_cross;

 CREATE TABLE fleetguard_true_cross(
   fleetguard_part text PRIMARY KEY,
   donaldson_part text,
   elimfilters_sku text,
   source text
 );

 `);

 console.log("fleetguard_true_cross created");

 await client.end();

})();

