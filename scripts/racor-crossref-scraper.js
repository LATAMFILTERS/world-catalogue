/**
 * Racor ET9 Cross-Reference Scraper
 * Source: https://www.fuelfilter-crossreference.com/convert/RACOR/{code}
 *
 * Procesa los 18 productos ET9 (elementos 2010/2020/2040 + carcasas FH/FG)
 * usando el brand RACOR en lugar de DONALDSON.
 *
 * Uso:
 *   node scripts/racor-crossref-scraper.js
 *   node scripts/racor-crossref-scraper.js --sku ET92020P
 *   node scripts/racor-crossref-scraper.js --dry-run
 */

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { puppeteer = require("puppeteer"); }

const { Client } = require("pg");
const fs   = require("fs");
const path = require("path");

// ─── Brand Classification ─────────────────────────────────────────────────────
const OEM_BRANDS = new Set([
  "CATERPILLAR","CAT","JOHN DEERE","DEERE","KOMATSU","VOLVO","MACK",
  "FREIGHTLINER","KENWORTH","PETERBILT","INTERNATIONAL","NAVISTAR",
  "MERCEDES","MERCEDES-BENZ","FORD","GMC","CHEVROLET","DETROIT DIESEL",
  "PERKINS","KUBOTA","YANMAR","MASSEY FERGUSON","NEW HOLLAND","CASE",
  "BOBCAT","TEREX","DOOSAN","HITACHI","LIEBHERR","HYUNDAI","KOBELCO",
  "INGERSOLL RAND","ATLAS COPCO","SULLAIR","SCANIA","DAF","MAN","IVECO",
  "FIAT","RENAULT TRUCKS","NISSAN","ISUZU","MITSUBISHI","HINO","TOYOTA",
  "VOLVO PENTA","CUMMINS MARINE","MERCURY","MERCRUISER","YAMAHA","SUZUKI",
  "HONDA MARINE","TOHATSU","JOHNSON","EVINRUDE","OMC","YANMAR MARINE",
  "PERKINS MARINE","WESTERBEKE","NANNI","BETA MARINE","CRUSADER","INDMAR",
  "PCM","MARINE POWER","CUMMINS","MTU"
]);

const AFTERMARKET_BRANDS = new Set([
  "BALDWIN","FLEETGUARD","WIX","WIX FILTERS","FRAM","MANN","MANN-FILTER",
  "LUBER-FINER","LUBERFINER","AC DELCO","PUROLATOR","NAPA","CARQUEST",
  "MOTORCRAFT","BOSCH","MAHLE","HENGST","SAKURA","RYCO","CLARCOR",
  "PARKER","PARKER HANNIFIN","PALL","UFI","FILTREC","SF FILTER","ALCO",
  "FACET","VELCON","DENSO","SOGEFI","API","DONALDSON","RACOR",
  "SEPAR","DAVCO","DAHL","CAV","LUCAS","STANADYNE","FLEETRITE",
  "HIFI FILTER","HIFI","HASTINGS","COOPERS","NELSON",
  "ELIMFILTERS","ELIM","KLEO","KLEO FILTERS"
]);

const ELIMFILTERS_PREFIXES = [
  "ET9","EF9","ES9","EW7","EM9","EA1","EA2","EC1","EH6","EL8","ED4"
];

// ─── CLI flags ────────────────────────────────────────────────────────────────
function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}
const SKU_ARG = getArg("--sku");
const DRY_RUN = process.argv.includes("--dry-run");

// ─── PostgreSQL ───────────────────────────────────────────────────────────────
const pgClient = new Client({
  host:     "ballast.proxy.rlwy.net",
  port:     18263,
  database: "railway",
  user:     "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normBrand(raw) {
  return (raw || "").toUpperCase().trim().replace(/[®™°]/g, "").replace(/\s+/g, " ");
}

function isELIMFILTERS(code) {
  return ELIMFILTERS_PREFIXES.some(p => (code || "").startsWith(p));
}

function classify(brand, code) {
  const b = normBrand(brand);
  if (isELIMFILTERS(code)) return "skip";
  if (b === "ELIMFILTERS" || b === "ELIM" || b === "KLEO") return "skip";
  if (OEM_BRANDS.has(b))         return "oem";
  if (AFTERMARKET_BRANDS.has(b)) return "aftermarket";
  const oemKW = ["TRUCK","MOTOR","ENGINE","TRACTOR","MARINE","PENTA","VOLVO"];
  if (oemKW.some(k => b.includes(k))) return "oem";
  return "aftermarket";
}

// ─── Extracción ───────────────────────────────────────────────────────────────
async function extractCrossRefs(page) {
  return page.evaluate(() => {
    const results = [], seen = new Set();

    function add(brand, code) {
      brand = (brand || "").trim();
      code  = (code  || "").trim().toUpperCase();
      if (!brand || !code || code.length < 3) return;
      if (/^\d+$/.test(code)) return;
      const key = `${brand.toUpperCase()}::${code}`;
      if (!seen.has(key)) { seen.add(key); results.push({ brand, code }); }
    }

    document.querySelectorAll("a[href*='/convert/']").forEach(a => {
      const m = (a.getAttribute("href") || "").match(/\/convert\/([^/?\s]+)\/([^/?\s]+)/);
      if (m) {
        const brand = decodeURIComponent(m[1]).replace(/-/g, " ").toUpperCase();
        const code  = decodeURIComponent(m[2]).toUpperCase();
        if (brand !== "RACOR" && brand.length > 1 && code.length > 2)
          add(brand, code);
      }
    });

    if (results.length === 0) {
      document.querySelectorAll("table tr").forEach(tr => {
        const tds = tr.querySelectorAll("td");
        if (tds.length >= 2) add(tds[0].innerText, tds[1].innerText);
      });
    }

    return results;
  });
}

async function scrapePage(page, racorCode) {
  const url = `https://www.fuelfilter-crossreference.com/convert/RACOR/${racorCode}`;
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
    await sleep(1200);
  } catch (e) {
    return { oem: [], aftermarket: [], total: 0, error: e.message };
  }

  const bodyLen = await page.evaluate(() => (document.body?.innerText || "").length);
  if (bodyLen < 300) return { oem: [], aftermarket: [], total: 0, notFound: true };

  const raw = await extractCrossRefs(page);

  const filtered = raw.filter(({ code }) => !isELIMFILTERS(code));

  const oem = [], aftermarket = [];
  filtered.forEach(({ brand, code }) => {
    const cat = classify(brand, code);
    if      (cat === "oem")         oem.push({ brand, code });
    else if (cat === "aftermarket") aftermarket.push({ brand, code });
  });

  return { oem, aftermarket, total: oem.length + aftermarket.length };
}

function mergeArrays(existing, incoming) {
  const seen = new Set(), result = [];
  [...(existing || []), ...(incoming || [])].forEach(item => {
    const key = typeof item === "string"
      ? item.toUpperCase().trim()
      : `${(item.brand||"").toUpperCase()}::${(item.code||"").toUpperCase()}`;
    if (!seen.has(key)) { seen.add(key); result.push(item); }
  });
  return result;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== RACOR ET9 CROSS-REFERENCE SCRAPER ===");
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN" : "PRODUCCIÓN"}`);
  if (SKU_ARG) console.log(`SKU: ${SKU_ARG}`);

  await pgClient.connect();
  console.log("PostgreSQL conectado\n");

  const params = [];
  let whereExtra = "";
  if (SKU_ARG) { whereExtra = " AND sku = $1"; params.push(SKU_ARG); }

  const { rows } = await pgClient.query(`
    SELECT sku, codigo_base, filter_type,
           COALESCE(oem_codes::text,       '[]') AS oem_raw,
           COALESCE(competitor_codes::text, '[]') AS comp_raw
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    ${whereExtra}
    ORDER BY filter_type, sku
  `, params);

  console.log(`Productos ET9 a procesar: ${rows.length}\n`);

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
  if (executablePath) console.log(`Browser: ${executablePath}`);

  const browserOptions = {
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox",
           "--disable-blink-features=AutomationControlled",
           "--disable-dev-shm-usage","--lang=en-US,en"]
  };
  if (executablePath) browserOptions.executablePath = executablePath;

  const browser = await puppeteer.launch(browserOptions);
  const page    = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.fuelfilter-crossreference.com/"
  });

  await page.goto("https://www.fuelfilter-crossreference.com/",
    { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await sleep(2500);

  let processed = 0, withData = 0, noData = 0;
  const allResults = [];

  for (const row of rows) {
    processed++;
    process.stdout.write(
      `  [${String(processed).padStart(2)}/${rows.length}] ${row.sku.padEnd(10)} (${row.codigo_base.padEnd(12)}) ... `
    );

    const res = await scrapePage(page, row.codigo_base);

    if (res.error) {
      console.log(`ERROR: ${res.error}`);
    } else if (res.notFound || res.total === 0) {
      console.log("sin datos");
      noData++;
    } else {
      console.log(`OK  OEM=${res.oem.length}  xref=${res.aftermarket.length}`);
      withData++;

      if (!DRY_RUN) {
        try {
          await pgClient.query(`
            UPDATE elimfilters_catalog
            SET oem_codes        = $1::jsonb,
                competitor_codes = $2::jsonb
            WHERE sku = $3
          `, [
            JSON.stringify(mergeArrays(JSON.parse(row.oem_raw  || "[]"), res.oem)),
            JSON.stringify(mergeArrays(JSON.parse(row.comp_raw || "[]"), res.aftermarket)),
            row.sku
          ]);
        } catch (e) { console.error(`    DB error: ${e.message}`); }
      }
    }

    allResults.push({ sku: row.sku, racorCode: row.codigo_base, filter_type: row.filter_type, ...res });
    await sleep(1800 + Math.random() * 1000);
  }

  await browser.close();
  await pgClient.end();

  console.log("\n=== RESUMEN ===");
  console.log(`Procesados : ${processed}`);
  console.log(`Con datos  : ${withData}`);
  console.log(`Sin datos  : ${noData}`);

  if (withData > 0) {
    console.log("\n── Detalle ──");
    allResults.filter(r => r.total > 0).forEach(r => {
      console.log(`\n  ${r.sku} / ${r.racorCode}  (OEM=${r.oem?.length} xref=${r.aftermarket?.length})`);
      r.oem?.slice(0, 3).forEach(x => console.log(`    OEM  : ${x.brand} ${x.code}`));
      r.aftermarket?.slice(0, 3).forEach(x => console.log(`    XREF : ${x.brand} ${x.code}`));
    });
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
