const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function queryCatalog() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM elimfilters_catalog');
    console.log(`Rows returned: ${result.rows.length}`);
    if (result.rows.length > 0) {
      console.log('Columns:', Object.keys(result.rows[0]));
      console.log(result.rows);
    } else {
      console.log('No rows found.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

queryCatalog().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
