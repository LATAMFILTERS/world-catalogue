/**
 * Genera SKUs ELIMFILTERS a partir del catálogo Donaldson scrapeado
 *
 * Reglas:
 *  - SKU EF9  : "EF9" + últimos 4 dígitos del código Donaldson
 *  - Tecnología: SYNTEPORE™
 *  - Descripción: formato ELIMFILTERS® adaptado del tipo de filtro
 *
 * Uso:
 *   node scripts/generate-elimfilters-skus.js
 */

const fs   = require("fs");
const path = require("path");

const REPORTS_DIR = path.join(__dirname, "..", "scrape_reports");

// ─── Buscar el archivo más reciente de Donaldson ──────────────────────────────
function findLatestDonaldsonFile() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith("donaldson-categoria-") && f.endsWith(".json"))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(REPORTS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (!files.length) throw new Error("No se encontró archivo donaldson-categoria-*.json en scrape_reports/");
  return path.join(REPORTS_DIR, files[0].name);
}

// ─── Generar SKU ──────────────────────────────────────────────────────────────
// Water separators → ES9XXXX, everything else → EF9XXXX
function generateSku(donaldsonSku, name) {
  const last4  = donaldsonSku.replace(/\s/g, "").slice(-4);
  const upper  = (name || "").toUpperCase();
  const prefix = (upper.includes("WATER SEPARATOR") || upper.includes("SEPARADOR DE AGUA")) ? "ES9" : "EF9";
  return prefix + last4;
}

// ─── Determinar tipo y subtipo de filtro ─────────────────────────────────────
// mainType : "Fuel Separator" (ES9) | "Fuel Filter" (EF9)
// subType  : "Water Separator" | "Secondary" | "Primary" | "Cartridge" | "Spin-On" | "Inline" | "Box" | ""
function getFilterType(name) {
  const upper = (name || "").toUpperCase();

  if (upper.includes("WATER SEPARATOR") || upper.includes("SEPARADOR DE AGUA"))
    return { mainType: "Fuel Separator", subType: "Water Separator", style: "water separator" };

  if (upper.includes("SECONDARY"))
    return { mainType: "Fuel Filter", subType: "Secondary",  style: "spin-on secondary" };
  if (upper.includes("PRIMARY"))
    return { mainType: "Fuel Filter", subType: "Primary",    style: "spin-on primary" };
  if (upper.includes("CARTRIDGE"))
    return { mainType: "Fuel Filter", subType: "Cartridge",  style: "cartridge" };
  if (upper.includes("SPIN-ON"))
    return { mainType: "Fuel Filter", subType: "Spin-On",    style: "spin-on" };
  if (upper.includes("INLINE") || upper.includes("IN-LINE") || upper.includes("EN LÍNEA"))
    return { mainType: "Fuel Filter", subType: "Inline",     style: "inline" };
  if (upper.includes("BOX"))
    return { mainType: "Fuel Filter", subType: "Box",        style: "box" };

  return { mainType: "Fuel Filter", subType: "",             style: "fuel" };
}

// ─── Generar descripción ELIMFILTERS ─────────────────────────────────────────
function generateDescription(efSku, donaldsonSku, name) {
  const { mainType, subType, style } = getFilterType(name);

  // Avoid "fuel fuel filter" when style is already "fuel"
  const filterDesc = style === "fuel" ? "fuel filter" : `${style} fuel filter`;

  // Water separators get a different sentence focused on water removal
  const isWaterSep = style === "water separator";

  const line1 = isWaterSep
    ? `ELIMFILTERS® ${efSku} ${filterDesc} delivers superior performance using proven AQUAGUARD™ ` +
      `media technology, separating water and removing harmful contaminants from the fuel system.`
    : `ELIMFILTERS® ${efSku} ${filterDesc} achieves superior protection using proven SYNTEPORE™ ` +
      `technology, eliminating harmful contaminants.`;

  const line2 = isWaterSep
    ? `ELIMFILTERS fuel filters ensure optimal fuel system protection and water separation to meet or exceed OEM specifications.`
    : `ELIMFILTERS fuel filters guarantee optimal fuel system performance to meet or exceed OEM specifications.`;

  const label = subType ? `${mainType}, ${subType}` : mainType;
  return [efSku, label, `${line1} ${line2}`].join("\n");
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function main() {
  const inputFile = findLatestDonaldsonFile();
  console.log(`\nReading: ${inputFile}`);

  const raw     = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const products = raw.products || [];
  console.log(`Products found: ${products.length}\n`);

  const elimfilters = products.map(p => {
    const efSku                    = generateSku(p.sku, p.name);
    const { mainType, subType }    = getFilterType(p.name);
    const isWaterSep               = efSku.startsWith("ES9");
    const description              = generateDescription(efSku, p.sku, p.name);

    return {
      // ─ ELIMFILTERS identity ─
      skuEF:            efSku,
      skuDonaldson:     p.sku,
      name:             p.name.replace(p.sku, "").replace(/DONALDSON\s+BLUE[®]?/gi, "").trim(),
      filterType:       mainType,
      subType:          subType,
      technology:       isWaterSep ? "AQUAGUARD™" : "SYNTEPORE™",
      description,

      // ─ Technical data (from Donaldson) ─
      specs:             p.specs             || {},
      packageDimensions: p.packageDimensions || {},
      crossRefs:         p.crossRefs         || [],
      alternateParts:    p.alternateParts    || [],
      relatedProducts:   p.relatedProducts   || [],
      equipment:         p.equipment         || [],
      // "Aplicación principal" pulled out of specs for quick access
      mainApplication:   (p.specs || {})["Aplicación principal"] || (p.specs || {})["Main Application"] || "",

      // ─ References ─
      donaldsonUrl:     p.productUrl,
      imageUrl:         p.imageUrl || "",
      page:             p.page,
      index:            p.index,
    };
  });

  // Guardar JSON completo
  const ts         = new Date().toISOString().replace(/[:.]/g, "-").replace("T","_").slice(0,19);
  const outputFile = path.join(REPORTS_DIR, `elimfilters-catalog-${ts}.json`);
  fs.writeFileSync(outputFile, JSON.stringify({
    metadata: {
      timestamp:      new Date().toISOString(),
      totalProducts:  elimfilters.length,
      technology:     "SYNTEPORE™",
      sourceFile:     inputFile,
    },
    products: elimfilters
  }, null, 2));

  console.log(`✅ Saved: ${outputFile}`);
  console.log(`   Total: ${elimfilters.length} products\n`);

  // Show 4 complete examples
  console.log("── Sample (4 products) ─────────────────────────────────────────\n");
  elimfilters.slice(0, 4).forEach((p, i) => {
    console.log(`[${i+1}] Donaldson: ${p.skuDonaldson}  →  ELIMFILTERS: ${p.skuEF}`);
    console.log(`    Filter Type : ${p.filterType}`);
    console.log(`    Technology  : ${p.technology}`);
    console.log(`    Description :`);
    p.description.split("\n").forEach(l => console.log(`      ${l}`));
    if (p.crossRefs.length)
      console.log(`    Cross-refs  : ${p.crossRefs.slice(0,3).map(r => `${r.manufacturer} ${r.partNumber}`).join(" | ")}`);
    if (p.specs && Object.keys(p.specs).length)
      console.log(`    Specs       : ${Object.entries(p.specs).slice(0,3).map(([k,v]) => `${k}: ${v}`).join(" | ")}`);
    if (p.mainApplication)
      console.log(`    Main App    : ${p.mainApplication}`);
    if (p.equipment && p.equipment.length) {
      console.log(`    Equipment   : ${p.equipment.length} entries`);
      p.equipment.slice(0, 3).forEach(e =>
        console.log(`      - ${e.model} | ${e.type} | Engine: ${e.engine}`)
      );
    }
    if (p.alternateParts.length)
      console.log(`    Alternates  : ${p.alternateParts.slice(0,3).map(a => a.sku).join(", ")}`);
    console.log();
  });
}

main();
