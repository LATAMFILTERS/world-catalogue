const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(DISTINCT fleetguard_part) resolved
 FROM (
      SELECT fleetguard_part
      FROM cross_reference_master
      WHERE fleetguard_part IS NOT NULL
        AND donaldson_part IS NOT NULL
      GROUP BY fleetguard_part
      HAVING COUNT(DISTINCT donaldson_part)=1
 ) x

 `);

 console.table(r.rows);

 await client.end();

})();
