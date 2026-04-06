/**
 * Carga el catálogo ELIMFILTERS (Donaldson) a PostgreSQL
 *
 * Lee el archivo elimfilters-catalog-*.json más reciente
 * e inserta/actualiza todos los productos en elimfilters_catalog.
 *
 * Uso:
 *   node scripts/load-donaldson-to-postgres.js
 */

const fs   = require("fs");
const path = require("path");
const { Client } = require("pg");

const REPORTS_DIR = path.join(__dirname, "..", "scrape_reports");

// ─── Conexión PostgreSQL (misma que server.js) ────────────────────────────────
const pgClient = new Client({
  host:     process.env.PGHOST     || "ballast.proxy.rlwy.net",
  port:     process.env.PGPORT     || 18263,
  database: process.env.PGDATABASE || "railway",
  user:     process.env.PGUSER     || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

// ─── Buscar archivo de catálogo (--input o el más reciente) ──────────────────
function findCatalogFile() {
  const i = process.argv.indexOf("--input");
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];

  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith("elimfilters-catalog-") && f.endsWith(".json"))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(REPORTS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (!files.length) throw new Error("No se encontró elimfilters-catalog-*.json en scrape_reports/");
  return path.join(REPORTS_DIR, files[0].name);
}

// ─── Extraer número en mm de strings como "126.5 mm (4.98 inch)" ─────────────
function parseMM(val) {
  if (!val) return null;
  const m = String(val).match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

// ─── Mapear producto ELIMFILTERS → columnas de la tabla ──────────────────────
function mapProduct(p) {
  const specs = p.specs || {};

  const heightRaw = specs["Overall Length"] || specs["Length"] || specs["Overall Height"] || null;
  const odRaw     = specs["Outer Diameter"]  || specs["Outside Diameter"]                  || null;
  const thread    = specs["Thread Size"]     || specs["Thread"]                             || null;
  const micron    = specs["Micron Rating"]   || specs["Beta Ratio"]                         || null;

  // La descripción es la 3ª línea del campo description (sku\ntype\ntexto)
  const descLines = (p.description || "").split("\n");
  const descText  = descLines.length >= 3 ? descLines.slice(2).join(" ").trim() : descLines.join(" ").trim();

  return {
    sku:                    p.skuEF,
    codigo_base:            p.skuDonaldson,
    name:                   p.name || "",
    filter_type:            p.filterType || "Fuel Filter",
    sub_type:               p.subType    || "",
    technology:             p.technology || "SYNTEPORE™",
    description:            descText,
    installation_type:      null,
    thread_size:            thread || null,
    height_mm:              parseMM(heightRaw),
    outer_diameter_mm:      parseMM(odRaw),
    gasket_od_mm:           null,
    gasket_id_mm:           null,
    iso_test_method:        null,
    micron_rating:          micron || null,
    nominal_efficiency:     null,
    burst_pressure_psi:     null,
    collapse_pressure_psi:  null,
    duty:                   null,
    oem_codes:              JSON.stringify(p.crossRefs       || []),
    competitor_codes:       JSON.stringify(p.alternateParts  || []),
    equipment_applications: JSON.stringify(p.equipment       || []),
    image_url:              p.imageUrl      || "",
    donaldson_url:          p.donaldsonUrl  || "",
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const inputFile = findCatalogFile();
  console.log(`\nLeyendo: ${inputFile}`);

  const raw      = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const products = raw.products || [];
  console.log(`Productos: ${products.length}`);

  await pgClient.connect();
  console.log("PostgreSQL conectado\n");

  // Agregar columnas nuevas si no existen
  await pgClient.query(`
    ALTER TABLE elimfilters_catalog
      ADD COLUMN IF NOT EXISTS name          TEXT,
      ADD COLUMN IF NOT EXISTS sub_type      TEXT,
      ADD COLUMN IF NOT EXISTS description   TEXT,
      ADD COLUMN IF NOT EXISTS image_url     TEXT,
      ADD COLUMN IF NOT EXISTS donaldson_url TEXT
  `);

  let inserted = 0, updated = 0, errors = 0;
  const errorList = [];

  for (const p of products) {
    const row = mapProduct(p);
    try {
      await pgClient.query(`
        INSERT INTO elimfilters_catalog (
          sku, codigo_base, name, filter_type, sub_type, technology, description,
          installation_type, thread_size, height_mm, outer_diameter_mm,
          gasket_od_mm, gasket_id_mm, iso_test_method, micron_rating,
          nominal_efficiency, burst_pressure_psi, collapse_pressure_psi, duty,
          oem_codes, competitor_codes, equipment_applications,
          image_url, donaldson_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20::jsonb, $21::jsonb, $22::jsonb,
          $23, $24
        )
        ON CONFLICT (sku) DO UPDATE SET
          codigo_base            = EXCLUDED.codigo_base,
          name                   = EXCLUDED.name,
          filter_type            = EXCLUDED.filter_type,
          sub_type               = EXCLUDED.sub_type,
          technology             = EXCLUDED.technology,
          description            = EXCLUDED.description,
          thread_size            = EXCLUDED.thread_size,
          height_mm              = EXCLUDED.height_mm,
          outer_diameter_mm      = EXCLUDED.outer_diameter_mm,
          micron_rating          = EXCLUDED.micron_rating,
          oem_codes              = EXCLUDED.oem_codes,
          competitor_codes       = EXCLUDED.competitor_codes,
          equipment_applications = EXCLUDED.equipment_applications,
          image_url              = EXCLUDED.image_url,
          donaldson_url          = EXCLUDED.donaldson_url
      `, [
        row.sku,            row.codigo_base,        row.name,           row.filter_type,
        row.sub_type,       row.technology,          row.description,    row.installation_type,
        row.thread_size,    row.height_mm,           row.outer_diameter_mm, row.gasket_od_mm,
        row.gasket_id_mm,   row.iso_test_method,     row.micron_rating,  row.nominal_efficiency,
        row.burst_pressure_psi, row.collapse_pressure_psi, row.duty,
        row.oem_codes, row.competitor_codes, row.equipment_applications,
        row.image_url, row.donaldson_url
      ]);

      // ON CONFLICT actualiza → no hay forma directa de saber si fue insert o update,
      // usamos xmax para detectarlo (0 = insert, >0 = update)
      inserted++;
    } catch (err) {
      errors++;
      errorList.push(`${row.sku}: ${err.message}`);
    }

    // Progreso cada 50
    if ((inserted + updated + errors) % 50 === 0)
      process.stdout.write(`  ${inserted + updated + errors}/${products.length}...\r`);
  }

  console.log(`\n✅ Carga completa:`);
  console.log(`   Procesados: ${inserted + updated + errors}`);
  console.log(`   Errores:    ${errors}`);

  if (errorList.length) {
    console.log("\n⚠️  Errores:");
    errorList.forEach(e => console.log(`   ${e}`));
  }

  await pgClient.end();
  console.log("\nConexión cerrada.\n");
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
