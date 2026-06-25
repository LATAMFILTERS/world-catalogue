const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     column_name,
     data_type
 FROM information_schema.columns
 WHERE table_name='elimfilters_catalog'
 ORDER BY ordinal_position

 `);

 console.table(r.rows);

 await client.end();

})();
