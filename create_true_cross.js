const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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

