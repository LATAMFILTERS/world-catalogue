/**
 * FRAM Product Scraper — LD Catalog Builder
 * ==========================================
 * Flow:
 *   1. Sitemap → todas las URLs de productos FRAM (filtros aceite/aire/cabina/combustible)
 *   2. Por cada URL: partNumber = url.split('-').pop()
 *   3. Extrae #applicationsTable → vehicle_applications[]
 *   4. Extrae #competitorTable   → competitor_codes[]
 *   5. SKU: 'EL8' + partNumber.toUpperCase()  (ej: PH8A → EL8PH8A)
 *   6. Upsert en PostgreSQL (elimfilters_catalog)
 *
 * Uso:
 *   node scripts/fram-catalog-scraper.js
 *   node scripts/fram-catalog-scraper.js --limit 50
 *   node scripts/fram-catalog-scraper.js --url https://www.fram.com/fram-extra-guard-oil-filter-spin-on-ph2
 *   node scripts/fram-catalog-scraper.js --dry-run
 */

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { puppeteer = require("puppeteer"); }

const { Client } = require("pg");
const fs   = require("fs");
const path = require("path");

// ─── Filtros de tipo de producto a incluir ────────────────────────────────────
// Patrones en la URL que indican filtros relevantes
const FILTER_URL_PATTERNS = [
  "oil-filter", "air-filter", "cabin-air", "cabin-filter",
  "fuel-filter", "transmission-filter"
];

// Prefijos de part numbers FRAM por categoría → SKU prefix ELIMFILTERS
const FRAM_SKU_MAP = {
  // Oil filters
  PH: "EL8", XG: "EL8", TG: "EL8", HM: "EL8",
  // Air filters
  CA: "EA1", CF: "EC1",
  // Fuel
  G: "EF9",
  // Default
  DEFAULT: "EL8"
};

// ─── CLI ──────────────────────────────────────────────────────────────────────
function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}
const LIMIT   = parseInt(getArg("--limit") || "999999", 10);
const URL_ARG = getArg("--url");
const DRY_RUN = process.argv.includes("--dry-run");

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

// ─── Determinar prefijo SKU desde part number ─────────────────────────────────
function getSKUPrefix(partNumber) {
  const upper = (partNumber || "").toUpperCase();
  for (const [prefix, sku] of Object.entries(FRAM_SKU_MAP)) {
    if (prefix !== "DEFAULT" && upper.startsWith(prefix)) return sku;
  }
  return FRAM_SKU_MAP.DEFAULT;
}

// SKU = prefix + últimos 4 dígitos del part number, padded (EL8 + PH2→0002 = EL80002)
function buildSKU(partNumber) {
  const prefix  = getSKUPrefix(partNumber);
  const digits  = (partNumber || "").replace(/\D/g, "");
  const last4   = digits.slice(-4).padStart(4, "0");
  return prefix + last4;
}

function getFilterType(partNumber) {
  const upper = (partNumber || "").toUpperCase();
  if (upper.startsWith("CA"))  return "Air Filter";
  if (upper.startsWith("CF"))  return "Cabin Air";
  if (upper.startsWith("G"))   return "Fuel Filter";
  return "Lube";
}

// ─── Descubrir sitemap de FRAM ────────────────────────────────────────────────
async function discoverSitemap(page) {
  console.log("Buscando sitemap FRAM...");

  // Paso 1: robots.txt
  try {
    await page.goto("https://www.fram.com/robots.txt",
      { waitUntil: "domcontentloaded", timeout: 15000 });
    const text = await page.evaluate(() => document.body.innerText || "");
    const match = text.match(/Sitemap:\s*(https?:\/\/\S+)/i);
    if (match) {
      console.log(`  Sitemap encontrado en robots.txt: ${match[1]}`);
      return match[1];
    }
  } catch (e) { /* continuar */ }

  // Paso 2: rutas Magento comunes
  const candidates = [
    "https://www.fram.com/sitemap.xml",
    "https://www.fram.com/pub/sitemap.xml",
    "https://www.fram.com/media/sitemap.xml",
    "https://www.fram.com/sitemap/sitemap.xml",
    "https://www.fram.com/sitemap_index.xml",
  ];

  for (const url of candidates) {
    try {
      const res = await page.goto(url,
        { waitUntil: "domcontentloaded", timeout: 10000 });
      if (res && res.status() === 200) {
        const ct = res.headers()["content-type"] || "";
        if (ct.includes("xml") || ct.includes("text")) {
          const text = await page.evaluate(() => document.body.innerText || "");
          if (text.includes("<url>") || text.includes("<sitemap>")) {
            console.log(`  Sitemap encontrado: ${url}`);
            return url;
          }
        }
      }
    } catch (e) { /* continuar */ }
  }

  console.log("  No se encontró sitemap automáticamente.");
  return null;
}

// ─── Parsear sitemap y extraer URLs de productos ──────────────────────────────
async function extractProductUrls(page, sitemapUrl) {
  console.log(`Parseando sitemap: ${sitemapUrl}`);

  await page.goto(sitemapUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  const urls = await page.evaluate((patterns) => {
    const text = document.body.innerText || document.documentElement.innerText || "";

    // Buscar sub-sitemaps (sitemap index)
    const subsitemaps = [...text.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)]
      .map(m => m[1])
      .filter(u => u.includes("sitemap") && u.endsWith(".xml"));

    if (subsitemaps.length > 0) return { type: "index", urls: subsitemaps };

    // Extraer URLs de producto
    const productUrls = [...text.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)]
      .map(m => m[1])
      .filter(u => patterns.some(p => u.includes(p)));

    return { type: "products", urls: productUrls };
  }, FILTER_URL_PATTERNS);

  // Si es un sitemap index, procesar cada sub-sitemap
  if (urls.type === "index") {
    console.log(`  Es sitemap index con ${urls.urls.length} sub-sitemaps`);
    const allProducts = [];
    for (const sub of urls.urls) {
      try {
        await page.goto(sub, { waitUntil: "domcontentloaded", timeout: 20000 });
        const subUrls = await page.evaluate((patterns) => {
          const text = document.body.innerText || "";
          return [...text.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => patterns.some(p => u.includes(p)));
        }, FILTER_URL_PATTERNS);
        allProducts.push(...subUrls);
        await sleep(500);
      } catch (e) { /* skip */ }
    }
    return allProducts;
  }

  return urls.urls;
}

// ─── Scrape de una página de producto FRAM ───────────────────────────────────
async function scrapeProductPage(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: "networkidle2", timeout: 40000 });
    await sleep(1500);
  } catch (e) {
    return { error: e.message };
  }

  const status = await page.evaluate(() => {
    // Verificar 404
    if (document.title.includes("404") || document.title.includes("Not Found")) return 404;
    // Verificar que cargaron las tablas
    const appTable  = document.querySelector("#applicationsTable tbody");
    const compTable = document.querySelector("#competitorTable tbody");
    return { hasApp: !!appTable, hasComp: !!compTable };
  });

  if (status === 404) return { notFound: true };

  const data = await page.evaluate(() => {
    // ── Nombre del producto ────────────────────────────────────────────────
    const name = (
      document.querySelector("h1.page-title span") ||
      document.querySelector("h1") ||
      document.querySelector(".product-name")
    )?.innerText?.trim() || "";

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

    // ── Cross-references / Competidores ────────────────────────────────────
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

    // ── Especificaciones adicionales ───────────────────────────────────────
    const specs = {};
    document.querySelectorAll(".product-specs tr, .specs-table tr").forEach(tr => {
      const tds = tr.querySelectorAll("td, th");
      if (tds.length >= 2) {
        const key = tds[0].innerText.trim().toLowerCase().replace(/\s+/g, "_");
        const val = tds[1].innerText.trim();
        if (key && val) specs[key] = val;
      }
    });

    return { name, applications, competitors, specs };
  });

  return data;
}

// ─── Upsert en PostgreSQL ─────────────────────────────────────────────────────
async function upsertProduct(sku, codigoBase, filterType, name, data) {
  await pgClient.query(`
    INSERT INTO elimfilters_catalog (
      sku, codigo_base, filter_type, technology, name,
      competitor_codes, vehicle_applications
    ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
    ON CONFLICT (sku) DO UPDATE SET
      competitor_codes     = EXCLUDED.competitor_codes,
      vehicle_applications = EXCLUDED.vehicle_applications,
      name = COALESCE(EXCLUDED.name, elimfilters_catalog.name)
  `, [
    sku,
    codigoBase,
    filterType,
    "FRAM LD",
    name || null,
    JSON.stringify(data.competitors || []),
    JSON.stringify(data.applications || [])
  ]);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== FRAM CATALOG SCRAPER — LD ===");
  console.log(`Modo     : ${DRY_RUN ? "DRY-RUN (sin escritura DB)" : "PRODUCCIÓN"}`);
  if (URL_ARG)  console.log(`URL      : ${URL_ARG}`);
  if (LIMIT < 999999) console.log(`Límite   : ${LIMIT}`);

  if (!DRY_RUN) {
    await pgClient.connect();
    console.log("PostgreSQL conectado");

    // Crear columna vehicle_applications si no existe
    await pgClient.query(`
      ALTER TABLE elimfilters_catalog
      ADD COLUMN IF NOT EXISTS vehicle_applications JSONB DEFAULT '[]'
    `).catch(() => {});
  }

  // ── Chrome
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
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.fram.com/"
  });

  // Visitar home para cookies
  await page.goto("https://www.fram.com/",
    { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await sleep(2000);

  // ── Obtener lista de URLs
  let productUrls = [];

  if (URL_ARG) {
    productUrls = [URL_ARG];
  } else {
    const sitemapUrl = await discoverSitemap(page);
    if (sitemapUrl) {
      productUrls = await extractProductUrls(page, sitemapUrl);
      console.log(`URLs de producto encontradas: ${productUrls.length}`);
    } else {
      console.error("No se pudo obtener el sitemap. Usa --url para probar con una URL específica.");
      await browser.close();
      if (!DRY_RUN) await pgClient.end();
      process.exit(1);
    }
  }

  // Aplicar límite
  productUrls = productUrls.slice(0, LIMIT);
  console.log(`A procesar: ${productUrls.length}\n`);

  let processed = 0, saved = 0, noData = 0, errs = 0;
  const allResults = [];

  for (const url of productUrls) {
    // partNumber = último segmento del URL
    const partNumber = url.split("-").pop().toUpperCase();
    const sku        = buildSKU(partNumber);
    const filterType = getFilterType(partNumber);

    processed++;
    process.stdout.write(
      `  [${String(processed).padStart(5)}/${productUrls.length}] ` +
      `${partNumber.padEnd(10)} → ${sku.padEnd(14)} ... `
    );

    const data = await scrapeProductPage(page, url);

    if (data.error) {
      console.log(`ERROR: ${data.error}`);
      errs++;
    } else if (data.notFound) {
      console.log("404");
      noData++;
    } else {
      const apps  = (data.applications  || []).length;
      const xrefs = (data.competitors   || []).length;
      console.log(`OK  apps=${apps}  xref=${xrefs}  "${(data.name||"").slice(0,40)}"`);
      saved++;

      if (!DRY_RUN) {
        try {
          await upsertProduct(sku, partNumber, filterType, data.name, data);
        } catch (e) {
          console.error(`    DB error: ${e.message}`);
        }
      }
    }

    allResults.push({ url, partNumber, sku, filterType, ...data });
    await sleep(1500 + Math.random() * 1000);
  }

  await browser.close();
  if (!DRY_RUN) await pgClient.end();

  // ── Guardar JSON
  const ts      = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outFile = path.join(__dirname, "..", "scrape_reports", `fram-catalog-${ts}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
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

  // Muestra
  const sample = allResults.filter(r => (r.applications||[]).length > 0).slice(0, 3);
  if (sample.length) {
    console.log("\n── Muestra ──");
    sample.forEach(r => {
      console.log(`\n  ${r.sku} / ${r.partNumber}  apps=${r.applications?.length}  xref=${r.competitors?.length}`);
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
