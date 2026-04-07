/**
 * FRAM Product Scraper — LD Catalog Builder
 * ==========================================
 * Flow (API + Puppeteer):
 *   1. API REST Magento → GET /rest/V1/products (paginado, sin auth)
 *      Retorna: sku, name, custom_attributes (specs), url_key
 *   2. Filtrar por prefijos relevantes: PH, XG, TG, HM, CA, CF, G
 *   3. Por cada producto: partNumber = product.sku
 *                         url = https://www.fram.com/{url_key}
 *   4. Puppeteer → #applicationsTable (Year/Make/Model/Engine)
 *   5. Puppeteer → #competitorTable   (cross-references)
 *   6. SKU ELIMFILTERS = prefix + last4digits(partNumber)
 *   7. Upsert en PostgreSQL
 *
 * Uso:
 *   node scripts/fram-catalog-scraper.js
 *   node scripts/fram-catalog-scraper.js --limit 50
 *   node scripts/fram-catalog-scraper.js --sku PH2
 *   node scripts/fram-catalog-scraper.js --dry-run
 *   node scripts/fram-catalog-scraper.js --api-only   (solo descarga catálogo API, sin scrape)
 */

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { puppeteer = require("puppeteer"); }

const axios  = require("axios");
const { Client } = require("pg");
const fs   = require("fs");
const path = require("path");

// ─── Prefijos FRAM → categoría ELIMFILTERS ────────────────────────────────────
const PREFIX_MAP = {
  PH:  { skuPrefix: "EL8", filterType: "Lube",       tech: "SYNTEPORE™"  },
  XG:  { skuPrefix: "EL8", filterType: "Lube",       tech: "ULTRAPORE™"  },
  TG:  { skuPrefix: "EL8", filterType: "Lube",       tech: "SYNTEPORE™"  },
  HM:  { skuPrefix: "EL8", filterType: "Lube",       tech: "SYNTEPORE™"  },
  CA:  { skuPrefix: "EA1", filterType: "Air Filter",  tech: "DURAFLOW™"   },
  CF:  { skuPrefix: "EC1", filterType: "Cabin Air",   tech: "FRESHFLOW™"  },
  G:   { skuPrefix: "EF9", filterType: "Fuel Filter", tech: "SYNTEPORE™"  },
};

// Part number prefixes a incluir
const INCLUDE_PREFIXES = Object.keys(PREFIX_MAP);

// ─── CLI ──────────────────────────────────────────────────────────────────────
function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}
const LIMIT    = parseInt(getArg("--limit") || "999999", 10);
const SKU_ARG  = getArg("--sku");
const DRY_RUN  = process.argv.includes("--dry-run");
const API_ONLY = process.argv.includes("--api-only");

// ─── PostgreSQL ───────────────────────────────────────────────────────────────
const pgClient = new Client({
  host:     process.env.PGHOST     || "ballast.proxy.rlwy.net",
  port:     process.env.PGPORT     || 18263,
  database: process.env.PGDATABASE || "railway",
  user:     process.env.PGUSER     || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── SKU builder ─────────────────────────────────────────────────────────────
function getMapping(partNumber) {
  const upper = (partNumber || "").toUpperCase();
  for (const [prefix, map] of Object.entries(PREFIX_MAP)) {
    if (upper.startsWith(prefix)) return map;
  }
  return null;
}

function buildSKU(partNumber) {
  const map    = getMapping(partNumber) || { skuPrefix: "EL8" };
  const digits = (partNumber || "").replace(/\D/g, "");
  const last4  = digits.slice(-4).padStart(4, "0");
  return map.skuPrefix + last4;
}

// ─── Extraer atributo de custom_attributes ────────────────────────────────────
function getAttr(customAttributes, code) {
  const item = (customAttributes || []).find(a => a.attribute_code === code);
  return item ? item.value : null;
}

// ─── API REST: obtener catálogo completo FRAM ─────────────────────────────────
async function fetchFRAMCatalog() {
  console.log("Descargando catálogo FRAM via REST API...");

  const allProducts = [];
  let   currentPage = 1;
  let   totalCount  = Infinity;
  const pageSize    = 100;

  while (allProducts.length < totalCount) {
    const url = `https://www.fram.com/rest/V1/products` +
      `?searchCriteria[pageSize]=${pageSize}` +
      `&searchCriteria[currentPage]=${currentPage}` +
      `&fields=items[id,sku,name,custom_attributes[attribute_code,value]]` +
      `,total_count`;

    try {
      const res = await axios.get(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0"
        },
        timeout: 30000
      });

      totalCount = res.data.total_count || 0;
      const items = res.data.items || [];
      allProducts.push(...items);

      process.stdout.write(`\r  Página ${currentPage} — ${allProducts.length}/${totalCount} productos`);

      if (items.length < pageSize) break;
      currentPage++;
      await sleep(500);

    } catch (e) {
      console.error(`\n  Error en página ${currentPage}: ${e.message}`);
      break;
    }
  }

  console.log(`\n  Total descargado: ${allProducts.length} productos`);
  return allProducts;
}

// ─── Filtrar solo los productos relevantes ─────────────────────────────────────
function filterRelevantProducts(products) {
  return products.filter(p => {
    const sku = (p.sku || "").toUpperCase();
    return INCLUDE_PREFIXES.some(prefix => sku.startsWith(prefix));
  });
}

// ─── Extraer specs desde custom_attributes ─────────────────────────────────────
function extractSpecs(customAttributes) {
  const specs = {};
  const fields = [
    "height", "outside_diameter", "inside_diameter", "inside_thread_diameter",
    "anti_drain_back_valve", "bypass_relief_valve", "bypass_relief_valve_setting",
    "filter_media_material", "attachment_type", "gasket_type",
    "turning_specification", "burst_pressure"
  ];
  fields.forEach(f => {
    const v = getAttr(customAttributes, f);
    if (v) specs[f] = v;
  });
  return specs;
}

// ─── Scrape de la página de producto (applications + cross-refs) ──────────────
async function scrapeProductPage(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: "networkidle2", timeout: 40000 });
    await sleep(1500);
  } catch (e) {
    return { error: e.message };
  }

  const ok = await page.evaluate(() => {
    if (document.title.includes("404")) return false;
    return !!(document.querySelector("#applicationsTable") ||
              document.querySelector("#competitorTable"));
  });

  if (!ok) return { notFound: true };

  return page.evaluate(() => {
    // ── Aplicaciones vehiculares ───────────────────────────────────────────
    const applications = [];
    document.querySelectorAll("#applicationsTable tbody tr").forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if (tds.length === 4) {
        const year   = tds[0].innerText.trim();
        const make   = tds[1].innerText.trim();
        const model  = tds[2].innerText.trim();
        const engine = tds[3].innerText.trim();
        if (make && model) applications.push({ year, make, model, engine });
      }
    });

    // ── Cross-references ───────────────────────────────────────────────────
    const competitors = [];
    document.querySelectorAll("#competitorTable tbody tr").forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if (tds.length === 2) {
        const brand = tds[0].innerText.trim();
        const code  = tds[1].innerText.trim();
        if (brand && code && !/^\d+$/.test(code)) {
          competitors.push({ brand, code });
        }
      }
    });

    return { applications, competitors };
  });
}

// ─── Upsert en PostgreSQL ─────────────────────────────────────────────────────
async function upsertProduct(sku, framSku, filterType, tech, name, specs, pageData) {
  await pgClient.query(`
    INSERT INTO elimfilters_catalog (
      sku, codigo_base, filter_type, technology, name,
      competitor_codes, vehicle_applications, specs
    ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
    ON CONFLICT (sku) DO UPDATE SET
      competitor_codes     = EXCLUDED.competitor_codes,
      vehicle_applications = EXCLUDED.vehicle_applications,
      name                 = COALESCE(EXCLUDED.name, elimfilters_catalog.name),
      specs                = COALESCE(EXCLUDED.specs, elimfilters_catalog.specs)
  `, [
    sku, framSku, filterType, tech, name || null,
    JSON.stringify(pageData?.competitors || []),
    JSON.stringify(pageData?.applications || []),
    JSON.stringify(specs || {})
  ]);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== FRAM LD CATALOG SCRAPER ===");
  console.log(`Modo     : ${DRY_RUN ? "DRY-RUN" : "PRODUCCIÓN"}${API_ONLY ? " + API_ONLY" : ""}`);
  if (SKU_ARG) console.log(`SKU      : ${SKU_ARG}`);
  if (LIMIT < 999999) console.log(`Límite   : ${LIMIT}`);

  // ── STEP 1: Obtener catálogo via API REST ──────────────────────────────────
  let products = await fetchFRAMCatalog();

  // Filtrar productos relevantes
  products = filterRelevantProducts(products);
  console.log(`Productos relevantes (${INCLUDE_PREFIXES.join(",")}): ${products.length}`);

  // Filtrar por SKU específico si se indicó
  if (SKU_ARG) {
    products = products.filter(p => p.sku.toUpperCase() === SKU_ARG.toUpperCase());
  }

  // Guardar catálogo API completo ANTES de aplicar limit
  const apiFile = path.join(__dirname, "..", "scrape_reports", "fram-api-catalog.json");
  fs.mkdirSync(path.dirname(apiFile), { recursive: true });
  fs.writeFileSync(apiFile, JSON.stringify(products, null, 2));
  console.log(`Catálogo API guardado: ${apiFile} (${products.length} productos)`);

  if (API_ONLY) {
    // Mostrar breakdown por prefijo
    const counts = {};
    products.forEach(p => {
      const prefix = p.sku.replace(/\d.*/, "").toUpperCase();
      counts[prefix] = (counts[prefix] || 0) + 1;
    });
    console.log("\nBreakdown por prefijo:");
    Object.entries(counts).sort((a,b) => b[1]-a[1])
      .forEach(([k,v]) => console.log(`  ${k.padEnd(6)}: ${v}`));
    return;
  }

  products = products.slice(0, LIMIT);
  console.log(`A procesar: ${products.length}\n`);

  // ── Preparar DB ────────────────────────────────────────────────────────────
  if (!DRY_RUN) {
    await pgClient.connect();
    console.log("PostgreSQL conectado");
    // Añadir columnas nuevas si no existen
    for (const col of [
      "ADD COLUMN IF NOT EXISTS vehicle_applications JSONB DEFAULT '[]'",
      "ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'",
    ]) {
      await pgClient.query(`ALTER TABLE elimfilters_catalog ${col}`).catch(() => {});
    }
  }

  // ── STEP 2: Puppeteer para applications + cross-refs ──────────────────────
  const CHROME_PATHS = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome",
  ].filter(Boolean);

  let executablePath = process.env.CHROME_PATH || undefined;
  if (!executablePath) {
    for (const p of CHROME_PATHS) {
      if (fs.existsSync(p)) { executablePath = p; break; }
    }
  }
  if (executablePath) console.log(`Browser  : ${executablePath}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox",
           "--disable-blink-features=AutomationControlled",
           "--disable-dev-shm-usage","--lang=en-US,en"],
    ...(executablePath ? { executablePath } : {})
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Referer": "https://www.fram.com/"
  });

  await page.goto("https://www.fram.com/",
    { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await sleep(2000);

  let processed = 0, saved = 0, noData = 0, errs = 0;
  const allResults = [];

  for (const product of products) {
    const framSku  = product.sku.toUpperCase();
    const sku      = buildSKU(framSku);
    const map      = getMapping(framSku);
    const urlKey   = getAttr(product.custom_attributes, "url_key") || "";
    // Construir URL del producto:
    // - Si url_key ya incluye el SKU (ej: oil-filter-xg7317) → usarlo directo
    // - Si url_key es de familia compartida (CA/CF) → usar patrón {filter-type}-{sku}
    let prodUrl = null;
    if (urlKey.toLowerCase().includes(framSku.toLowerCase())) {
      prodUrl = `https://www.fram.com/${urlKey}`;
    } else if (framSku.startsWith("CA") || framSku.startsWith("CAK")) {
      prodUrl = `https://www.fram.com/air-filter-${framSku.toLowerCase()}`;
    } else if (framSku.startsWith("CF")) {
      prodUrl = `https://www.fram.com/cabin-air-filter-${framSku.toLowerCase()}`;
    } else if (urlKey) {
      prodUrl = `https://www.fram.com/${urlKey}`;
    }
    const specs    = extractSpecs(product.custom_attributes);

    processed++;
    process.stdout.write(
      `  [${String(processed).padStart(5)}/${products.length}] ` +
      `${framSku.padEnd(10)} → ${sku.padEnd(10)} ... `
    );

    if (!prodUrl) {
      console.log("sin URL (no url_key)");
      noData++;
      continue;
    }

    const pageData = await scrapeProductPage(page, prodUrl);

    if (pageData.error) {
      console.log(`ERROR: ${pageData.error}`);
      errs++;
    } else if (pageData.notFound) {
      console.log("404");
      noData++;
    } else {
      const apps  = (pageData.applications || []).length;
      const xrefs = (pageData.competitors  || []).length;
      console.log(`OK  apps=${String(apps).padStart(3)}  xref=${String(xrefs).padStart(3)}  "${(product.name||"").slice(0,35)}"`);
      saved++;

      if (!DRY_RUN) {
        try {
          await upsertProduct(
            sku, framSku,
            map?.filterType || "Lube",
            map?.tech || "SYNTEPORE™",
            product.name,
            specs, pageData
          );
        } catch (e) {
          console.error(`    DB error: ${e.message}`);
        }
      }
    }

    allResults.push({ framSku, sku, url: prodUrl, specs, ...pageData });
    await sleep(1500 + Math.random() * 800);
  }

  await browser.close();
  if (!DRY_RUN) await pgClient.end();

  // ── Guardar JSON ────────────────────────────────────────────────────────────
  const ts      = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outFile = path.join(__dirname, "..", "scrape_reports", `fram-catalog-${ts}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    meta: { ts, processed, saved, noData, errors: errs },
    results: allResults
  }, null, 2));

  console.log("\n=== RESUMEN ===");
  console.log(`Procesados : ${processed}`);
  console.log(`Guardados  : ${saved}`);
  console.log(`Sin datos  : ${noData}`);
  console.log(`Errores    : ${errs}`);
  console.log(`Guardado   : ${outFile}`);

  const sample = allResults.filter(r => (r.applications||[]).length > 0).slice(0, 3);
  if (sample.length) {
    console.log("\n── Muestra ──");
    sample.forEach(r => {
      console.log(`\n  ${r.sku} / ${r.framSku}  apps=${r.applications?.length}  xref=${r.competitors?.length}`);
      r.applications?.slice(0, 3).forEach(a =>
        console.log(`    APP  : ${a.year} ${a.make} ${a.model} ${a.engine}`)
      );
      r.competitors?.slice(0, 3).forEach(c =>
        console.log(`    XREF : ${c.brand} ${c.code}`)
      );
    });
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
