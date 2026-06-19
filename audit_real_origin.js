const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   CASE
      WHEN codigo_base LIKE 'P%' THEN 'DONALDSON'
      WHEN codigo_base LIKE 'LF%' THEN 'FLEETGUARD'
      WHEN codigo_base LIKE 'FF%' THEN 'FLEETGUARD'
      WHEN codigo_base LIKE 'HF%' THEN 'FLEETGUARD'
      WHEN codigo_base LIKE 'FS%' THEN 'FLEETGUARD'
      WHEN codigo_base LIKE 'AF%' THEN 'FLEETGUARD'
      ELSE 'OTHER'
   END origen,
   COUNT(*) total
 FROM elimfilters_catalog
 GROUP BY 1
 ORDER BY total DESC

 `);

 console.table(r.rows);

 await client.end();

})();
