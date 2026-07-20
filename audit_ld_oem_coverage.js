const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(DISTINCT sku) total_ld,
      COUNT(DISTINCT CASE WHEN oem_normalized IS NOT NULL
                            AND oem_normalized <> ''
                          THEN sku END) ld_with_oem
    FROM mann_oem_clean
    WHERE segment='LD'
  `);

  console.table(r.rows);

  await client.end();

})();
