const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  await client.query(`
    UPDATE fleetguard_true_cross
    SET
      donaldson_part='P550012',
      elimfilters_sku='EF90012'
    WHERE fleetguard_part='FF149'
  `);

  console.log('FF149 FIXED');

  await client.end();

})();
