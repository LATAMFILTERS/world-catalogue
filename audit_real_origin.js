const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
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
