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

// ─── Generar SKU EF9 ──────────────────────────────────────────────────────────
function generateEF9Sku(donaldsonSku) {
  // Últimos 4 caracteres del código Donaldson
  const last4 = donaldsonSku.replace(/\s/g, "").slice(-4);
  return "EF9" + last4;
}

// ─── Determinar tipo de filtro desde la descripción ──────────────────────────
function getFilterType(name) {
  const upper = (name || "").toUpperCase();

  if (upper.includes("SEPARADOR DE AGUA"))     return { tipo: "Combustible, Separador de Agua", estilo: "separador de agua" };
  if (upper.includes("SECUNDARIO"))             return { tipo: "Combustible, Secundario",        estilo: "enroscable secundario" };
  if (upper.includes("PRIMARIO"))               return { tipo: "Combustible, Primario",           estilo: "enroscable primario" };
  if (upper.includes("CARTUCHO"))               return { tipo: "Combustible, Cartucho",           estilo: "cartucho" };
  if (upper.includes("ENROSCABLE"))             return { tipo: "Combustible, Spin-On",            estilo: "enroscable" };
  if (upper.includes("INLINE") || upper.includes("EN LÍNEA")) return { tipo: "Combustible, Inline", estilo: "inline" };
  return { tipo: "Combustible",                                                                     estilo: "de combustible" };
}

// ─── Generar descripción ELIMFILTERS ─────────────────────────────────────────
function generateDescription(efSku, donaldsonSku, name) {
  const { tipo, estilo } = getFilterType(name);

  // Limpiar nombre: quitar "DONALDSON BLUE" y el SKU Donaldson del inicio
  const cleanName = name
    .replace(new RegExp(donaldsonSku + "\\s*", "i"), "")
    .replace(/DONALDSON\s+BLUE[®]?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());

  return [
    efSku,
    tipo,
    `ELIMFILTERS® ${efSku} filtro de combustible ${estilo} ofrece rendimiento superior ` +
    `utilizando tecnología de medios SYNTEPORE™, eliminando contaminantes dañinos del sistema de combustible. ` +
    `Los filtros ELIMFILTERS garantizan protección óptima para cumplir o superar las especificaciones OEM. ` +
    `Reemplaza directamente al ${donaldsonSku} (${cleanName}).`
  ].join("\n");
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function main() {
  const inputFile = findLatestDonaldsonFile();
  console.log(`\nLeyendo: ${inputFile}`);

  const raw     = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const products = raw.products || [];
  console.log(`Productos encontrados: ${products.length}\n`);

  const elimfilters = products.map(p => {
    const efSku       = generateEF9Sku(p.sku);
    const { tipo }    = getFilterType(p.name);
    const descripcion = generateDescription(efSku, p.sku, p.name);

    return {
      // ─ Identidad ELIMFILTERS ─
      skuEF:          efSku,
      skuDonaldson:   p.sku,
      nombre:         p.name.replace(p.sku, "").replace(/DONALDSON\s+BLUE[®]?/gi, "").trim(),
      tipoFiltro:     tipo,
      tecnologia:     "SYNTEPORE™",
      descripcionEF:  descripcion,

      // ─ Datos técnicos (de Donaldson) ─
      especificaciones:   p.specs           || {},
      dimensionesEmpaque: p.packageDimensions || {},
      crossRefs:          p.crossRefs        || [],
      partesAlternativas: p.alternateParts   || [],
      productosRelacionados: p.relatedProducts || [],

      // ─ Referencias ─
      urlDonaldson:   p.productUrl,
      imagenUrl:      p.imageUrl || "",
      pagina:         p.page,
      index:          p.index,
    };
  });

  // Guardar JSON completo
  const ts         = new Date().toISOString().replace(/[:.]/g, "-").replace("T","_").slice(0,19);
  const outputFile = path.join(REPORTS_DIR, `elimfilters-catalogo-${ts}.json`);
  fs.writeFileSync(outputFile, JSON.stringify({
    metadata: {
      timestamp:       new Date().toISOString(),
      totalProductos:  elimfilters.length,
      tecnologia:      "SYNTEPORE™",
      fuenteDatos:     inputFile,
    },
    productos: elimfilters
  }, null, 2));

  console.log(`✅ Guardado: ${outputFile}`);
  console.log(`   Total: ${elimfilters.length} productos\n`);

  // Mostrar 4 ejemplos
  console.log("── Muestra (4 productos) ──────────────────────────────────────\n");
  elimfilters.slice(0, 4).forEach((p, i) => {
    console.log(`[${i+1}] Donaldson: ${p.skuDonaldson}  →  ELIMFILTERS: ${p.skuEF}`);
    console.log(`    Tipo      : ${p.tipoFiltro}`);
    console.log(`    Tecnología: ${p.tecnologia}`);
    console.log(`    Descripción:`);
    p.descripcionEF.split("\n").forEach(l => console.log(`      ${l}`));
    if (p.crossRefs.length)
      console.log(`    Cross-refs: ${p.crossRefs.slice(0,3).map(r => `${r.manufacturer} ${r.partNumber}`).join(" | ")}...`);
    if (p.especificaciones && Object.keys(p.especificaciones).length)
      console.log(`    Specs     : ${Object.entries(p.especificaciones).slice(0,2).map(([k,v]) => `${k}: ${v}`).join(" | ")}`);
    console.log();
  });
}

main();
