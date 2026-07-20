const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT DISTINCT
   fleetguard_part,
   elimfilters_sku

 FROM mann_fleetguard_matches

 WHERE fleetguard_part IN (
   'FF42131',
   'FF149',
   'LF777',
   'LF3914',
   'LF756',
   'HF6054',
   'LF14009NN',
   'LF3363',
   'FF238',
   'LF16231',
   'LF17810',
   'FF5683',
   'LF14002NN'
 )

 ORDER BY fleetguard_part

 `);

 console.table(r.rows);

 await client.end();

})();
