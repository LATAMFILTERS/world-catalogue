const { Client } = require("pg");

const client = new Client({
 host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
 port: 5432,
 database: "catalogo_elimfilters",
 user: "catalogo_elimfilters_user",
 password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
 ssl: { rejectUnauthorized:false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT COUNT(DISTINCT fleetguard_part) recovered

 FROM (

   SELECT
     mf.fleetguard_part

   FROM mann_fleetguard_matches mf

   JOIN mann_donaldson_matches md
     ON md.mann_part = mf.mann_part

   WHERE mf.fleetguard_part IN (

      SELECT DISTINCT fleetguard_part
      FROM cross_reference_master
      WHERE fleetguard_part IS NOT NULL
        AND donaldson_part IS NULL

   )

 ) x

 `);

 console.table(r.rows);

 await client.end();

})();
