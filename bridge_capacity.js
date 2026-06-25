const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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
