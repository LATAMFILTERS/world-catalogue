const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    mf.fleetguard_part,
    COUNT(DISTINCT md.donaldson_part) don_count
 FROM mann_fleetguard_matches mf
 JOIN mann_donaldson_matches md
      ON mf.mann_part = md.mann_part
 GROUP BY mf.fleetguard_part
 ORDER BY don_count DESC, mf.fleetguard_part

 `);

 console.table(r.rows.slice(0,50));

 await client.end();

})();
