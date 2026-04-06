/**
 * Re-scrape de páginas de detalle para productos con datos incompletos
 * Lee los productos con gaps desde PostgreSQL y vuelve a extraer specs/equipment/crossrefs
 *
 * Uso:
 *   node scripts/rescrape-missing-details.js --type Hydraulic
 *   node scripts/rescrape-missing-details.js --type "Air Housing"
 *   node scripts/rescrape-missing-details.js --type all
 *   node scripts/rescrape-missing-details.js --file scrape_reports/empty-products-to-rescrape.json
 */

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { puppeteer = require("puppeteer"); }

const fs   = require("fs");
const path = require("path");
const { Client } = require("pg");

const REPORTS_DIR = path.join(__dirname, "..", "scrape_reports");
const BASE_URL    = "https://shop.donaldson.com";

const pgClient = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── CLI args ─────────────────────────────────────────────────────────────────
function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}
const TARGET_TYPE = getArg("--type") || "all";
const INPUT_FILE  = getArg("--file");

// ─── Obtener productos con gaps desde PostgreSQL ──────────────────────────────
async function getProductsToRescrape() {
  if (INPUT_FILE) {
    const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
    return data.codes.map(c => ({ codigo_base: c, donaldson_url: null }));
  }

  let whereClause = `
    WHERE (
      (oem_codes IS NULL OR oem_codes::text = '[]' OR oem_codes::text = 'null')
      OR (equipment_applications IS NULL OR equipment_applications::text = '[]' OR equipment_applications::text = 'null')
      OR (competitor_codes IS NULL OR competitor_codes::text = '[]' OR competitor_codes::text = 'null')
    )
  `;
  if (TARGET_TYPE !== "all") {
    whereClause += ` AND filter_type = '${TARGET_TYPE.replace(/'/g, "''")}'`;
  }

  const res = await pgClient.query(`
    SELECT sku, codigo_base, filter_type, donaldson_url
    FROM elimfilters_catalog
    ${whereClause}
    ORDER BY filter_type, sku
  `);
  return res.rows;
}

// ─── Extraer datos del detalle de un producto ────────────────────────────────
async function scrapeProductDetail(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(1000 + Math.random() * 800);

  // Scroll humano
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await sleep(600 + Math.random() * 400);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500 + Math.random() * 300);

  return await page.evaluate(() => {
    // Click mostrar más
    const showMoreBtn = document.querySelector("#showMorePdpListButton");
    if (showMoreBtn && showMoreBtn.style.display !== "none") showMoreBtn.click();

    // Specs
    const specs = {};
    document.querySelectorAll("#attributesBody .productAttrSection table tr").forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        const key = cells[0].textContent.replace(/\s+/g, " ").trim();
        const val = cells[cells.length - 1].textContent.replace(/\s+/g, " ").trim();
        if (key && val) specs[key] = val;
      }
    });

    // Cross references
    const crossRefs = [];
    document.querySelectorAll("#crossreferenceBody .crossReferenceTablePDP tbody tr").forEach(row => {
      const mfr = (row.querySelector("td[data-manufacturer]") || {}).textContent?.trim() || "";
      const pn  = (row.querySelector("td[data-partnumber]")   || {}).textContent?.trim() || "";
      if (mfr && pn) crossRefs.push({ manufacturer: mfr, partNumber: pn });
    });

    // Alternate parts
    const alternateParts = [];
    document.querySelectorAll("#alternateBody .item[data-url]").forEach(item => {
      const sku = (item.querySelector(".partNumber") || {}).textContent?.trim() || "";
      if (sku) alternateParts.push({ sku });
    });

    // Equipment
    const equipment = [];
    document.querySelectorAll("#equiptmentBody .applicationPartTablePDP tbody tr").forEach(row => {
      const model     = (row.querySelector("td[data-equipment]")        || {}).textContent?.trim() || "";
      const year      = (row.querySelector("td[data-year]")             || {}).textContent?.trim() || "";
      const type      = (row.querySelector("td[data-type] span")        || {}).textContent?.trim() || "";
      const engine    = (row.querySelector("td[data-engine] span")      || {}).textContent?.trim() || "";
      const options   = (row.querySelector("td[data-options] span")     || {}).textContent?.trim() || "";
      const engineOpt = (row.querySelector("td[data-enginetypes] span") || {}).textContent?.trim() || "";
      if (model) equipment.push({ model, year, type, engine, options, engineOption: engineOpt });
    });

    return { specs, crossRefs, alternateParts, equipment };
  });
}

// ─── Actualizar producto en PostgreSQL ───────────────────────────────────────
async function updateProduct(sku, data) {
  const specs = data.specs || {};
  const parseMM = v => { if (!v) return null; const m = String(v).match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : null; };

  await pgClient.query(`
    UPDATE elimfilters_catalog SET
      oem_codes              = $1::jsonb,
      competitor_codes       = $2::jsonb,
      equipment_applications = $3::jsonb,
      thread_size       = COALESCE($4, thread_size),
      height_mm         = COALESCE($5, height_mm),
      outer_diameter_mm = COALESCE($6, outer_diameter_mm),
      micron_rating     = COALESCE($7, micron_rating)
    WHERE sku = $8
  `, [
    JSON.stringify(data.crossRefs),
    JSON.stringify(data.alternateParts),
    JSON.stringify(data.equipment),
    specs["Thread Size"] || specs["Thread"] || null,
    parseMM(specs["Overall Length"] || specs["Length"] || null),
    parseMM(specs["Outer Diameter"] || null),
    specs["Micron Rating"] || null,
    sku
  ]);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  await pgClient.connect();
  console.log("PostgreSQL conectado\n");

  const products = await getProductsToRescrape();
  console.log(`Productos a re-scrape: ${products.length} (tipo: ${TARGET_TYPE})\n`);

  if (!products.length) { console.log("Nada que actualizar."); await pgClient.end(); return; }

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--start-minimized", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  let ok = 0, errors = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Construir URL directa al producto
    const url = p.donaldson_url ||
      `${BASE_URL}/store/en-nl/product/${encodeURIComponent(p.codigo_base)}/`;

    process.stdout.write(`  [${i+1}/${products.length}] ${p.sku} (${p.codigo_base})... `);

    try {
      const data = await scrapeProductDetail(page, url);
      await updateProduct(p.sku, data);
      console.log(`✅  xref:${data.crossRefs.length} alt:${data.alternateParts.length} equip:${data.equipment.length}`);
      ok++;
    } catch (err) {
      console.log(`❌  ${err.message.slice(0, 60)}`);
      errors++;
    }

    await sleep(2500 + Math.random() * 1500);
  }

  await browser.close();
  await pgClient.end();

  console.log(`\n✅ Re-scrape completo: ${ok} OK, ${errors} errores`);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
