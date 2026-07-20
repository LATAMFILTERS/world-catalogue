const { Client } = require("pg");

const client = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl:{rejectUnauthorized:false}
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
     table_name,
     column_name
   FROM information_schema.columns
   WHERE table_name IN (
      'mann_oem_clean',
      'cross_reference_master',
      'elimfilters_catalog'
   )
   ORDER BY table_name, ordinal_position
 `);

 console.table(r.rows);

 await client.end();

})();
