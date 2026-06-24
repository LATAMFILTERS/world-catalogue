const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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
