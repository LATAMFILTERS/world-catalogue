const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  const r = await c.query(`
    SELECT
      filter_type,
      SUBSTRING(sku, 1, 3)               AS prefijo,
      COUNT(*)                            AS total,
      COUNT(CASE WHEN oem_codes        IS NOT NULL AND oem_codes        != '[]' THEN 1 END) AS con_oem,
      COUNT(CASE WHEN competitor_codes IS NOT NULL AND competitor_codes != '[]' THEN 1 END) AS con_xref
    FROM elimfilters_catalog
    GROUP BY filter_type, SUBSTRING(sku, 1, 3)
    ORDER BY filter_type, prefijo
  `);

  let grandTotal = 0, grandOem = 0, grandXref = 0;
  console.log("\n=== INVENTARIO COMPLETO elimfilters_catalog ===\n");
  console.log(
    "filter_type".padEnd(28) +
    "prefix".padEnd(10) +
    "total".padStart(7) +
    "con_oem".padStart(10) +
    "con_xref".padStart(10)
  );
  console.log("─".repeat(65));

  r.rows.forEach(row => {
    const t = parseInt(row.total);
    const o = parseInt(row.con_oem);
    const x = parseInt(row.con_xref);
    grandTotal += t; grandOem += o; grandXref += x;
    console.log(
      (row.filter_type || "").padEnd(28) +
      (row.prefijo || "").padEnd(10) +
      String(t).padStart(7) +
      String(o).padStart(10) +
      String(x).padStart(10)
    );
  });

  console.log("─".repeat(65));
  console.log(
    "TOTAL".padEnd(38) +
    String(grandTotal).padStart(7) +
    String(grandOem).padStart(10) +
    String(grandXref).padStart(10)
  );
  console.log();
  await c.end();
});
