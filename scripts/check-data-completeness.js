/**
 * Verifica qué productos tienen cada sección de datos:
 *  - specs (Attributes)
 *  - crossRefs (Cross References)
 *  - alternateParts (Alternate Parts)
 *  - equipment (Equipment)
 */
const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log("PostgreSQL conectado\n");

  const total = await c.query(`SELECT COUNT(*) FROM elimfilters_catalog`);
  const n = parseInt(total.rows[0].count);
  console.log(`TOTAL PRODUCTOS: ${n}\n`);

  // Contar productos con cada sección completa
  const stats = await c.query(`
    SELECT
      COUNT(*) FILTER (WHERE oem_codes IS NOT NULL
        AND oem_codes::text != '[]' AND oem_codes::text != 'null')           AS con_crossrefs,
      COUNT(*) FILTER (WHERE competitor_codes IS NOT NULL
        AND competitor_codes::text != '[]' AND competitor_codes::text != 'null') AS con_alternates,
      COUNT(*) FILTER (WHERE equipment_applications IS NOT NULL
        AND equipment_applications::text != '[]' AND equipment_applications::text != 'null') AS con_equipment,
      COUNT(*) FILTER (WHERE thread_size IS NOT NULL OR height_mm IS NOT NULL
        OR outer_diameter_mm IS NOT NULL OR micron_rating IS NOT NULL)       AS con_specs
    FROM elimfilters_catalog
  `);

  const s = stats.rows[0];
  const pct = v => `${v} (${Math.round(v/n*100)}%)`;

  console.log("COMPLETITUD POR SECCIÓN:");
  console.log(`  Cross References  : ${pct(s.con_crossrefs)}`);
  console.log(`  Alternate Parts   : ${pct(s.con_alternates)}`);
  console.log(`  Equipment         : ${pct(s.con_equipment)}`);
  console.log(`  Specs/Attributes  : ${pct(s.con_specs)}`);

  // Productos sin NINGUNA sección
  const empty = await c.query(`
    SELECT COUNT(*) FROM elimfilters_catalog
    WHERE (oem_codes IS NULL OR oem_codes::text = '[]')
      AND (competitor_codes IS NULL OR competitor_codes::text = '[]')
      AND (equipment_applications IS NULL OR equipment_applications::text = '[]')
      AND thread_size IS NULL AND height_mm IS NULL
      AND outer_diameter_mm IS NULL AND micron_rating IS NULL
  `);
  console.log(`\n  Sin ninguna sección: ${empty.rows[0].count}`);

  // Desglose por tipo de filtro
  console.log("\nPOR TIPO DE FILTRO:");
  const byType = await c.query(`
    SELECT
      filter_type,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE oem_codes::text != '[]' AND oem_codes IS NOT NULL) as crossrefs,
      COUNT(*) FILTER (WHERE competitor_codes::text != '[]' AND competitor_codes IS NOT NULL) as alternates,
      COUNT(*) FILTER (WHERE equipment_applications::text != '[]' AND equipment_applications IS NOT NULL) as equipment
    FROM elimfilters_catalog
    GROUP BY filter_type
    ORDER BY total DESC
  `);
  byType.rows.forEach(r =>
    console.log(`  ${(r.filter_type||"").padEnd(16)} | total:${r.total} | xref:${r.crossrefs} | alt:${r.alternates} | equip:${r.equipment}`)
  );

  // Muestra productos sin equipment para revisar
  const noEquip = await c.query(`
    SELECT sku, codigo_base, filter_type
    FROM elimfilters_catalog
    WHERE equipment_applications IS NULL OR equipment_applications::text = '[]'
    LIMIT 10
  `);
  if (noEquip.rows.length) {
    console.log(`\nSIN EQUIPMENT (primeros 10):`);
    noEquip.rows.forEach(r =>
      console.log(`  ${r.sku} | ${r.codigo_base} | ${r.filter_type}`)
    );
  }

  await c.end();
  console.log("\nListo.");
}).catch(e => console.error(e.message));
