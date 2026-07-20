const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const tables = [
   'fleetguard_true_cross',
   'mann_fleetguard_matches',
   'mann_donaldson_matches',
   'cross_reference_master',
   'elimfilters_catalog'
 ];

 for(const t of tables){

   const r = await client.query(`
      SELECT COUNT(*) total
      FROM ${t}
   `);

   console.log(t, r.rows[0].total);

 }

 await client.end();

})();
