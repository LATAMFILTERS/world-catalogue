const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 await client.query(`
   INSERT INTO fleetguard_true_cross
   (fleetguard_part, donaldson_part, elimfilters_sku, source)
   VALUES ('FF149', NULL, 'EF90149', 'manual')
   ON CONFLICT (fleetguard_part)
   DO UPDATE SET
     donaldson_part = EXCLUDED.donaldson_part,
     elimfilters_sku = EXCLUDED.elimfilters_sku,
     source = EXCLUDED.source;
 `);

 console.log("FF149 override inserted");

 await client.end();

})();
