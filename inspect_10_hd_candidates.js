const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM mann_oem_clean
    WHERE sku IN (
      '1497687S01_MANN-FILTER',
      '3931070200_MANN-FILTER',
      '6220152911_MANN-FILTER',
      '6260253261_MANN-FILTER',
      '6770850131_MANN-FILTER',
      '6890330201_MANN-FILTER',
      '6893330101_MANN-FILTER',
      'BF1018/1_MANN-FILTER',
      'BFU811_MANN-FILTER',
      'C10005_MANN-FILTER'
    )
    LIMIT 50
  `);

  console.table(r.rows);

  await client.end();

})();
