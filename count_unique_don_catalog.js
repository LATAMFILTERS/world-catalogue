const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    COUNT(DISTINCT codigo_base) unique_donaldson
 FROM elimfilters_catalog
 WHERE codigo_base LIKE 'P%'

 `);

 console.table(r.rows);

 await client.end();

})();
