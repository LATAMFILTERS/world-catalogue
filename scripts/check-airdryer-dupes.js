const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {

  // Los 4 sin sub_type
  const sinSubtipo = await c.query(`
    SELECT sku, codigo_base, name, sub_type
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Dryer' AND (sub_type IS NULL OR sub_type = '')
    ORDER BY sku
  `);
  console.log(`\nAir Dryer SIN sub_type (${sinSubtipo.rows.length}):`);
  sinSubtipo.rows.forEach(r =>
    console.log(`  ${r.sku} | ${r.codigo_base} | ${r.name || ""}`)
  );

  // Los 12 Spin-On
  const spinOn = await c.query(`
    SELECT sku, codigo_base, name
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Dryer' AND sub_type = 'Spin-On'
    ORDER BY sku
  `);
  console.log(`\nAir Dryer Spin-On (${spinOn.rows.length}):`);
  spinOn.rows.forEach(r =>
    console.log(`  ${r.sku} | ${r.codigo_base} | ${r.name || ""}`)
  );

  // Cruce: ¿algún SKU o codigo_base aparece en ambos grupos?
  const skusSinSubtipo   = sinSubtipo.rows.map(r => r.sku);
  const codigosSinSubtipo = sinSubtipo.rows.map(r => r.codigo_base);
  const overlap = spinOn.rows.filter(r =>
    skusSinSubtipo.includes(r.sku) || codigosSinSubtipo.includes(r.codigo_base)
  );
  if (overlap.length) {
    console.log(`\n⚠️  SOLAPAMIENTO (${overlap.length} productos en ambos grupos):`);
    overlap.forEach(r => console.log(`  ${r.sku} | ${r.codigo_base}`));
  } else {
    console.log("\n✅ Sin solapamiento de SKUs entre los dos grupos");
    console.log("   → Los 4 son productos DISTINTOS a los 12 Spin-On");
  }

  await c.end();
}).catch(e => console.error(e.message));
