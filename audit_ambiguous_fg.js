const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     fleetguard_part,
     COUNT(DISTINCT donaldson_part) don_count,
     STRING_AGG(DISTINCT donaldson_part, ', ') donaldsons
 FROM cross_reference_master
 WHERE fleetguard_part IS NOT NULL
   AND donaldson_part IS NOT NULL
 GROUP BY fleetguard_part
 HAVING COUNT(DISTINCT donaldson_part) > 1
 ORDER BY don_count DESC

 `);

 console.table(r.rows);

 await client.end();

})();
