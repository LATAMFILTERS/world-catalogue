const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 await client.query(`

 INSERT INTO fleetguard_true_cross
 (fleetguard_part, donaldson_part, elimfilters_sku, source)
 VALUES
 ('FF42131','P550390','EF90390','manual'),
 ('LF14002NN','DBL7300','EL87300','manual'),
 ('LF3363','P551670','EL81670','manual')
 ON CONFLICT (fleetguard_part) DO NOTHING;

 `);

 console.log("seeded");

 await client.end();

})();
