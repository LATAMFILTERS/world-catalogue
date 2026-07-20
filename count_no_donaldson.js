const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(*) rows_without_donaldson
 FROM cross_reference_master
 WHERE donaldson_part IS NULL

 `);

 console.table(r.rows);

 await client.end();

})();
