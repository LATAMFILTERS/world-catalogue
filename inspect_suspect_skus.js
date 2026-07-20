const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
     sku,
     codigo_base,
     description
   FROM elimfilters_catalog
   WHERE sku IN (
     'EL84002',
     'EL87300',
     'EL83363',
     'EL81670',
     'EF92131',
     'EF90390'
   )
 `);

 console.table(r.rows);

 await client.end();

})();
