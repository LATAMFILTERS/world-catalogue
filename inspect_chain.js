const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
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
     ON md.mann_part = mf.mann_part
   WHERE mf.fleetguard_part IN
   ('FF149','LF756','LF3914','LF14002NN','LF3363')
   LIMIT 100
 `);

 console.table(r.rows);

 await client.end();

})();
