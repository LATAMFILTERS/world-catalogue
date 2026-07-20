const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(DISTINCT donaldson_part) donaldson_parts
 FROM cross_reference_master
 WHERE donaldson_part IS NOT NULL

 `);

 console.table(r.rows);

 await client.end();

})();
