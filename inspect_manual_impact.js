const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
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
