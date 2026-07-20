const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   COUNT(DISTINCT mf.fleetguard_part) fleetguard_parts,
   COUNT(DISTINCT md.donaldson_part) donaldson_parts

 FROM mann_fleetguard_matches mf
 JOIN mann_donaldson_matches md
      ON mf.mann_part = md.mann_part

 `);

 console.table(r.rows);

 await client.end();

})();
