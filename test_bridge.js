const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     mf.fleetguard_part,
     mf.mann_part,
     md.donaldson_part
 FROM mann_fleetguard_matches mf
 JOIN mann_donaldson_matches md
      ON mf.mann_part = md.mann_part
 LIMIT 20

 `);

 console.table(r.rows);

 await client.end();

})();
