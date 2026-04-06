/**
 * Genera SKUs ELIMFILTERS a partir del catálogo Donaldson scrapeado
 *
 * Prefijos SKU:
 *  - EF9  : Fuel Filter        (SYNTEPORE™)
 *  - ES9  : Fuel Separator     (AQUAGUARD™)
 *  - ED4  : Air Dryer          (DRYCORE™)
 *
 * Uso:
 *   node scripts/generate-elimfilters-skus.js
 *   node scripts/generate-elimfilters-skus.js --input scrape_reports/donaldson-categoria-2748940002-DATE.json
 */

const fs   = require("fs");
const path = require("path");

const REPORTS_DIR = path.join(__dirname, "..", "scrape_reports");

// ─── CLI: archivo de entrada específico ──────────────────────────────────────
function getInputFile() {
  const i = process.argv.indexOf("--input");
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  // Auto: archivo donaldson-categoria-*.json más reciente
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith("donaldson-categoria-") && f.endsWith(".json"))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(REPORTS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files.length) throw new Error("No se encontró archivo donaldson-categoria-*.json en scrape_reports/");
  return path.join(REPORTS_DIR, files[0].name);
}

// ─── Determinar tipo y subtipo ───────────────────────────────────────────────
function getFilterType(name) {
  const upper = (name || "").toUpperCase();

  // ── Air Dryer (ED4) ──────────────────────────────────────────────────────
  if (upper.includes("AIR DRYER") || upper.includes("DRYER ELEMENT") ||
      upper.includes("DESICCANT")  || upper.startsWith("ED4")) {
    if (upper.includes("ELEMENT"))   return { mainType: "Air Dryer", subType: "Element",   style: "air dryer element" };
    if (upper.includes("CARTRIDGE")) return { mainType: "Air Dryer", subType: "Cartridge", style: "air dryer cartridge" };
    if (upper.includes("SPIN-ON"))   return { mainType: "Air Dryer", subType: "Spin-On",   style: "air dryer spin-on" };
    return                                  { mainType: "Air Dryer", subType: "",           style: "air dryer" };
  }

  // ── Fuel Separator (ES9) ─────────────────────────────────────────────────
  if (upper.includes("WATER SEPARATOR") || upper.includes("SEPARADOR DE AGUA"))
    return { mainType: "Fuel Separator", subType: "Water Separator", style: "water separator" };

  // ── Fuel Filter (EF9) ────────────────────────────────────────────────────
  if (upper.includes("SECONDARY"))
    return { mainType: "Fuel Filter", subType: "Secondary", style: "spin-on secondary" };
  if (upper.includes("PRIMARY"))
    return { mainType: "Fuel Filter", subType: "Primary",   style: "spin-on primary" };
  if (upper.includes("CARTRIDGE"))
    return { mainType: "Fuel Filter", subType: "Cartridge", style: "cartridge" };
  if (upper.includes("SPIN-ON"))
    return { mainType: "Fuel Filter", subType: "Spin-On",   style: "spin-on" };
  if (upper.includes("INLINE") || upper.includes("IN-LINE") || upper.includes("EN LÍNEA"))
    return { mainType: "Fuel Filter", subType: "Inline",    style: "inline" };
  if (upper.includes("BOX"))
    return { mainType: "Fuel Filter", subType: "Box",       style: "box" };

  return { mainType: "Fuel Filter", subType: "", style: "fuel" };
}

// ─── Generar SKU ──────────────────────────────────────────────────────────────
function generateSku(donaldsonSku, name) {
  const last4 = donaldsonSku.replace(/\s/g, "").slice(-4);
  const { mainType } = getFilterType(name);
  if (mainType === "Air Dryer")      return "ED4" + last4;
  if (mainType === "Fuel Separator") return "ES9" + last4;
  return "EF9" + last4;
}

// ─── Generar descripción ELIMFILTERS ─────────────────────────────────────────
function generateDescription(efSku, donaldsonSku, name) {
  const { mainType, subType, style } = getFilterType(name);

  const label = subType ? `${mainType}, ${subType}` : mainType;
  let line1, line2;

  if (mainType === "Air Dryer") {
    line1 = `ELIMFILTERS® ${efSku} premium air dryer provides complete protection using proven DRYCORE™ ` +
            `technology, capturing water vapor, oil vapor, and other contaminants before they can reach ` +
            `air tanks and valves, ensuring optimal uptime.`;
    line2 = `Trust your air systems with superior DRYCORE™ protection.`;
  } else if (mainType === "Fuel Separator") {
    line1 = `ELIMFILTERS® ${efSku} ${style} fuel filter delivers superior performance using proven AQUAGUARD™ ` +
            `media technology, separating water and removing harmful contaminants from the fuel system.`;
    line2 = `ELIMFILTERS fuel filters ensure optimal fuel system protection and water separation to meet or exceed OEM specifications.`;
  } else {
    const filterDesc = style === "fuel" ? "fuel filter" : `${style} fuel filter`;
    line1 = `ELIMFILTERS® ${efSku} ${filterDesc} achieves superior protection using proven SYNTEPORE™ ` +
            `technology, eliminating harmful contaminants.`;
    line2 = `ELIMFILTERS fuel filters guarantee optimal fuel system performance to meet or exceed OEM specifications.`;
  }

  return [efSku, label, `${line1} ${line2}`].join("\n");
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function main() {
  const inputFile = getInputFile();
  console.log(`\nReading: ${inputFile}`);

  const raw     = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const products = raw.products || [];
  console.log(`Products found: ${products.length}\n`);

  const elimfilters = products.map(p => {
    const efSku                    = generateSku(p.sku, p.name);
    const { mainType, subType }    = getFilterType(p.name);
    const description              = generateDescription(efSku, p.sku, p.name);
    const technology = mainType === "Air Dryer"      ? "DRYCORE™"
                     : mainType === "Fuel Separator" ? "AQUAGUARD™"
                     : "SYNTEPORE™";

    // Alternate parts → también convertidos a SKU ELIMFILTERS con el mismo prefijo
    const prefix = efSku.slice(0, 3); // "EF9", "ES9" o "ED4"
    const alternatesEF = (p.alternateParts || []).map(a => {
      const donaldsonAlt = typeof a === "string" ? a : (a.sku || a.partNumber || "");
      const efAlt = donaldsonAlt ? prefix + donaldsonAlt.replace(/\s/g, "").slice(-4) : "";
      return { skuEF: efAlt, skuDonaldson: donaldsonAlt };
    }).filter(a => a.skuDonaldson);

    return {
      // ─ ELIMFILTERS identity ─
      skuEF:            efSku,
      skuDonaldson:     p.sku,
      name:             p.name.replace(p.sku, "").replace(/DONALDSON\s+BLUE[®]?/gi, "").trim(),
      filterType:       mainType,
      subType:          subType,
      technology,
      description,

      // ─ Technical data (from Donaldson) ─
      specs:             p.specs             || {},
      packageDimensions: p.packageDimensions || {},
      crossRefs:         p.crossRefs         || [],
      alternateParts:    alternatesEF,
      relatedProducts:   p.relatedProducts   || [],
      equipment:         p.equipment         || [],
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
