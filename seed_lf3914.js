const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 await client.query(`
   INSERT INTO fleetguard_true_cross
   (fleetguard_part, donaldson_part, elimfilters_sku, source)
   VALUES
   ('LF3914','P550761','EL80761','manual')
   ON CONFLICT (fleetguard_part)
   DO UPDATE SET
     donaldson_part = EXCLUDED.donaldson_part,
     elimfilters_sku = EXCLUDED.elimfilters_sku,
     source = EXCLUDED.source;
 `);

 console.log("LF3914 inserted");

 await client.end();

})();
