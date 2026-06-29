const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  // 1. List all tables with 'mann' or 'ld' in name
  const tables = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  const mannTables = tables.rows.filter(r => r.tablename.includes('mann') || r.tablename.includes('ld') || r.tablename.includes('light'));
  console.log('=== MANN/LD Tables:', mannTables.map(r => r.tablename).join(', '));

  // 2. mann_oem_clean breakdown
  try {
    const mannClean = await client.query(`
      SELECT segment, COUNT(DISTINCT sku) as unique_skus, COUNT(*) as total_rows
      FROM mann_oem_clean
      GROUP BY segment ORDER BY unique_skus DESC
    `);
    console.log('\n=== mann_oem_clean by segment:');
    console.table(mannClean.rows);

    const mannTotal = await client.query(`SELECT COUNT(DISTINCT sku) as total FROM mann_oem_clean`);
    console.log('Total unique SKUs in mann_oem_clean:', mannTotal.rows[0].total);
  } catch(e) { console.log('mann_oem_clean error:', e.message); }

  // 3. Check other mann tables
  for (const t of ['mann_donaldson', 'mann_fleetguard', 'mann_oem_codes']) {
    try {
      const r = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
      const sample = await client.query(`SELECT * FROM ${t} LIMIT 1`);
      console.log(`\n=== ${t}: ${r.rows[0].cnt} rows`);
      if (sample.rows.length > 0) console.log('  Columns:', Object.keys(sample.rows[0]).join(', '));
    } catch(e) { console.log(`${t}: not found`); }
  }

  // 4. Check LD catalog tables
  for (const t of ['elimfilters_catalog', 'products', 'catalog']) {
    try {
      const r = await client.query(`
        SELECT duty_class, COUNT(*) as cnt 
        FROM ${t} 
        GROUP BY duty_class ORDER BY cnt DESC LIMIT 10
      `);
      console.log(`\n=== ${t} by duty_class:`);
      console.table(r.rows);
    } catch(e) {
      try {
        const r2 = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
        console.log(`\n=== ${t}: ${r2.rows[0].cnt} rows (no duty_class column)`);
      } catch(e2) { console.log(`${t}: not found`); }
    }
  }

  // 5. Sample mann_oem_clean columns
  try {
    const sample = await client.query(`SELECT * FROM mann_oem_clean LIMIT 2`);
    console.log('\n=== mann_oem_clean sample:');
    console.log('Columns:', Object.keys(sample.rows[0]).join(', '));
    sample.rows.forEach(r => console.log(JSON.stringify(r)));
  } catch(e) { console.log('sample error:', e.message); }

  await client.end();
})().catch(err => { console.error(err.message); process.exit(1); });
