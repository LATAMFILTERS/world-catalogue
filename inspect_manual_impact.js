const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
     t.fleetguard_part,
     h.qty,
     t.elimfilters_sku
   FROM fleetguard_true_cross t
   LEFT JOIN (
      SELECT fleetguard_part, COUNT(*)::int qty
      FROM cross_reference_master
      WHERE fleetguard_part IS NOT NULL
      GROUP BY fleetguard_part
   ) h USING(fleetguard_part)
   ORDER BY qty DESC NULLS LAST
 `);

 console.table(r.rows);

 await client.end();

})();
