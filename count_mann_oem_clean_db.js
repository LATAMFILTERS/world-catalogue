const { Client } = require("pg");

const client = new Client({
 host:"dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
 port:5432,
 database:"catalogo_elimfilters",
 user:"catalogo_elimfilters_user",
 password:"d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
 ssl:{rejectUnauthorized:false}
});

(async()=>{

 await client.connect();

 const r1 = await client.query(`
   SELECT COUNT(*) total
   FROM mann_oem_clean
 `);

 console.log("TOTAL_ROWS");
 console.table(r1.rows);

 const r2 = await client.query(`
   SELECT COUNT(DISTINCT sku) total
   FROM mann_oem_clean
 `);

 console.log("DISTINCT_SKU");
 console.table(r2.rows);

 await client.end();

})();
