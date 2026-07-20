const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    codigo_base,
    sku,
    donaldson_url
 FROM elimfilters_catalog
 WHERE codigo_base LIKE 'AF%'
 LIMIT 20

 `);

 console.table(r.rows);

 await client.end();

})();
