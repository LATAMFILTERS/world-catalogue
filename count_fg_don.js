const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT COUNT(*) total
   FROM fleetguard_donaldson_cross
 `);

 console.table(r.rows);

 await client.end();

})();
