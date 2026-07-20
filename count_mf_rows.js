const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(*) total_rows
 FROM mann_fleetguard_matches

 `);

 console.table(r.rows);

 await client.end();

})();
