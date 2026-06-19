const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     fleetguard_part,
     COUNT(*) rows,
     COUNT(donaldson_part) rows_with_donaldson
 FROM cross_reference_master
 WHERE fleetguard_part IS NOT NULL
 GROUP BY fleetguard_part
 HAVING COUNT(donaldson_part) > 0
    AND COUNT(donaldson_part) < COUNT(*)
 ORDER BY rows DESC

 `);

 console.table(r.rows);

 await client.end();

})();
