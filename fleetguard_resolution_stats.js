const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   COUNT(*) total,
   SUM(CASE WHEN don_count=1 THEN 1 ELSE 0 END) unique_match,
   SUM(CASE WHEN don_count>1 THEN 1 ELSE 0 END) ambiguous_match
 FROM (

     SELECT
        mf.fleetguard_part,
        COUNT(DISTINCT md.donaldson_part) don_count
     FROM mann_fleetguard_matches mf
     JOIN mann_donaldson_matches md
          ON mf.mann_part = md.mann_part
     GROUP BY mf.fleetguard_part

 ) x

 `);

 console.table(r.rows);

 await client.end();

})();
