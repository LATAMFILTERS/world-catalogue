const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`
 SELECT
    COUNT(*) total
 FROM elimfilters_catalog
 WHERE sku IS NULL
    OR codigo_base IS NULL
 `);

 console.table(r.rows);

 await client.end();

})();
