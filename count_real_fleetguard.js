const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(*) total_rows,
     COUNT(DISTINCT fleetguard_part) fleetguard_parts
 FROM cross_reference_master
 WHERE manufacturer='FLEETGUARD'

 `);

 console.table(r.rows);

 await client.end();

})();
