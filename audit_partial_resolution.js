const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     fleetguard_part,
     COUNT(*) rows,
     COUNT(donaldson_part) rows_with_donaldson
 FROM cross_reference_master
 WHERE fleetguard_part IS NOT NULL
 GROUP BY fleetguard_part
 HAVING COUNT(donaldson_part) > 0
    AND COUNT(donaldson_part) < COUNT(*)
 ORDER BY rows DESC

 `);

 console.table(r.rows);

 await client.end();

})();
