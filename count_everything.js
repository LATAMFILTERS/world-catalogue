const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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
