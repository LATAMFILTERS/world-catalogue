const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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
