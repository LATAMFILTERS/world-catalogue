/**
 * Fuel Filter Cross-Reference Scraper
 * Source: https://www.fuelfilter-crossreference.com/convert/DONALDSON/{part}
 *
 * Para cada código Donaldson en elimfilters_catalog (Fuel Filter / Fuel Separator / Marine):
 *   1. Navega a la página (Puppeteer)
 *   2. Extrae todos los pares Marca + Código de los links /convert/BRAND/CODE
 *   3. Clasifica en:
 *      - OEM Codes        → fabricantes de equipo (CAT, Volvo, John Deere, etc.)
 *      - Cross Ref Codes  → marcas de filtros aftermarket (Baldwin, Fleetguard, etc.)
 *   4. Los propios códigos ELIMFILTERS (EF9, ES9…) se ignoran
 *   5. Fallback: si no hay datos, prueba los alternate Donaldson codes del DB
 *   6. Actualiza PostgreSQL (merge con los cross-refs existentes)
 *
 * Uso:
 *   node scripts/fuelfilter-crossref-scraper.js
 *   node scripts/fuelfilter-crossref-scraper.js --limit 50
 *   node scripts/fuelfilter-crossref-scraper.js --sku P550440
 *   node scripts/fuelfilter-crossref-scraper.js --dry-run
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
  "MERCEDES","MERCEDES-BENZ","MERCEDES BENZ","FORD","GMC","CHEVROLET",
  "DETROIT DIESEL","DETROIT","PERKINS","KUBOTA","YANMAR","MASSEY FERGUSON",
  "NEW HOLLAND","CASE","CASE-IH","BOBCAT","TEREX","DOOSAN","HITACHI",
  "LIEBHERR","HYUNDAI","KOBELCO","GROVE","MANITOU","JLG","GENIE",
  "INGERSOLL RAND","ATLAS COPCO","SULLAIR","GARDNER DENVER","COMPAIR",
  "CLAAS","FENDT","DEUTZ","AGCO","SAME","FIAT","IVECO","SCANIA",
  "DAF","MAN","RENAULT TRUCKS","NISSAN","ISUZU","MITSUBISHI","HINO",
  "UD TRUCKS","TOYOTA","HONDA","HYSTER","YALE","STILL","LINDE",
  "JUNGHEINRICH","CROWN","RAYMOND","CLARK","ALLIS CHALMERS","DRESSER",
  "JOY","WABCO","EUCLID","PAYHAULER","BUCYRUS","OSHKOSH","WESTERN STAR",
  "STERLING","WHITE","AUTOCAR","PEUGEOT","CITROEN","OPEL","VAUXHALL",
  "SEAT","SKODA","AUDI","VW","VOLKSWAGEN","BMW","DAIMLER","CHRYSLER",
  "DODGE","JEEP","RAM","CUMMINS","MTU","ROLLS-ROYCE","CONTINENTAL",
  "LEYLAND","BEDFORD","AMMANN","BOMAG","DYNAPAC","HAMM","SAKAI",
  "WIRTGEN","VOGELE","KLEEMANN","POWERSCREEN","SANDVIK","METSO",
  "ZEPPELIN","BELL","GRADALL","LINKBELT","LINK-BELT","MANITOWOC",
  "TADANO","DEMAG","POTAIN","COMEDIL","SENNEBOGEN","XCMG","SANY",
  "LIUGONG","ZOOMLION","LONKING","SDLG","SHANTUI","SUNWARD","YUCHAI",
  // Marinas / motores marinos
  "VOLVO PENTA","CUMMINS MARINE","CATERPILLAR MARINE","CAT MARINE",
  "MERCURY","MERCRUISER","YAMAHA","SUZUKI","HONDA MARINE","TOHATSU",
  "JOHNSON","EVINRUDE","OMC","CHRYSLER MARINE","FORCE","MARINER",
  "YANMAR MARINE","PERKINS MARINE","WESTERBEKE","NANNI","BETA MARINE",
  "MARINE POWER","CRUSADER","INDMAR","PCM","ILMOR"
]);

const AFTERMARKET_BRANDS = new Set([
  "BALDWIN","FLEETGUARD","WIX","WIX FILTERS","FRAM","MANN","MANN-FILTER",
  "LUBER-FINER","LUBERFINER","AC DELCO","ACDELCO","PUROLATOR","NAPA",
  "CARQUEST","MOTORCRAFT","BOSCH","MAHLE","HENGST","CHAMPION","UNIFILTER",
  "HASTINGS","COOPERS","COOPERS FIAAM","NELSON","NELSON WINSLOW","SAKURA",
  "RYCO","TOTAL","CLARCOR","AIRGUARD","FARR","DELPHI","RACOR","PARKER",
  "PARKER HANNIFIN","PALL","HYDAC","UFI","FILTREC","EUROFILTER",
  "SF FILTER","ALCO","FACET","VELCON","YAMASHIN","TAISEI","DENSO",
  "QUALTEK","FREUDENBERG","SOGEFI","API","DONALDSON",
  "SEPAR","SEPAR WATER SEPARATOR","FUNNEL WEB","DAVCO","DAHL","CAV",
  "LUCAS","LUCAS CAV","DELPHI DIESEL","STANADYNE","BOSCH DIESEL",
  "FORD NEW HOLLAND","FILTERCRAFT","FILTROIL","GENERAL DIESEL",
  "FLEETRITE","NAPA GOLD","WESCO","WESCO FILTERS",
  // Nuestra marca → excluir
  "ELIMFILTERS","ELIM","KLEO","KLEO FILTERS"
]);

// Prefijos de SKUs ELIMFILTERS → excluir del resultado
const ELIMFILTERS_PREFIXES = [
  "EF9","ES9","EW7","ET9","EM9",   // Fuel / Separator / Coolant / Marine
  "EA1","EA2","EC1","EH6","EL8","ED4"
];

// ─── CLI flags ────────────────────────────────────────────────────────────────
function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}
const LIMIT   = parseInt(getArg("--limit") || "999999", 10);
const SKU_ARG = getArg("--sku");
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normBrand(raw) {
  return (raw || "").toUpperCase().trim()
    .replace(/[®™°]/g, "").replace(/\s+/g, " ");
}

function isELIMFILTERS(code) {
  return ELIMFILTERS_PREFIXES.some(p => (code || "").startsWith(p));
}

function classify(brand, code) {
  const b = normBrand(brand);
  if (b === "ELIMFILTERS" || b === "ELIM" || b === "KLEO") return "skip";
  if (isELIMFILTERS(code)) return "skip";
  if (OEM_BRANDS.has(b))         return "oem";
  if (AFTERMARKET_BRANDS.has(b)) return "aftermarket";
  const oemKW = ["TRUCK","MOTOR","ENGINE","TRACTOR","LOADER","EXCAVATOR",
                 "CRANE","CONSTRUCTION","MACHINERY","MARINE","PENTA"];
  if (oemKW.some(k => b.includes(k))) return "oem";
  return "aftermarket";
}

// ─── Extracción de links /convert/BRAND/CODE ──────────────────────────────────
async function extractCrossRefs(page) {
  return page.evaluate(() => {
    const results = [];
    const seen    = new Set();

    function add(brand, code) {
      brand = (brand || "").trim();
      code  = (code  || "").trim().toUpperCase();
      if (!brand || !code || code.length < 3) return;
      const key = `${brand.toUpperCase()}::${code}`;
      if (!seen.has(key)) { seen.add(key); results.push({ brand, code }); }
    }

    // Estrategia 1: links /convert/BRAND/CODE (principal — texto plano con enlaces)
    document.querySelectorAll("a[href*='/convert/']").forEach(a => {
      const m = (a.getAttribute("href") || "").match(/\/convert\/([^/?\s]+)\/([^/?\s]+)/);
      if (m) {
        const brand = decodeURIComponent(m[1]).replace(/-/g, " ").toUpperCase();
        const code  = decodeURIComponent(m[2]).toUpperCase();
        if (brand.length > 1 && code.length > 2) add(brand, code);
      }
    });

    // Estrategia 2: filas de tabla
    if (results.length === 0) {
      document.querySelectorAll("table tr").forEach(tr => {
        const tds = tr.querySelectorAll("td");
        if (tds.length >= 2) add(tds[0].innerText, tds[1].innerText);
      });
    }

    // Estrategia 3: texto plano línea a línea
    if (results.length === 0) {
      const lines = (document.body.innerText || "").split(/\n/);
      lines.forEach(line => {
        const m = line.trim().match(/^([A-Z][A-Z\s\-\.\/]{1,40}?)\s{2,}([A-Z0-9][A-Z0-9\-\.\/]{2,20})$/i);
        if (m) add(m[1].trim(), m[2].trim());
      });
    }

    return results;
  });
}

// ─── Scraper de una URL ───────────────────────────────────────────────────────
async function scrapePage(page, donaldsonCode) {
  const url = `https://www.fuelfilter-crossreference.com/convert/DONALDSON/${donaldsonCode}`;
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
    await sleep(1200);
  } catch (e) {
    return { oem: [], aftermarket: [], total: 0, error: e.message };
  }

  const bodyLen = await page.evaluate(() => (document.body?.innerText || "").length);
  if (bodyLen < 300) return { oem: [], aftermarket: [], total: 0, notFound: true };

  const raw = await extractCrossRefs(page);

  const filtered = raw.filter(({ brand, code }) => {
    if (normBrand(brand) === "DONALDSON" &&
        code.toUpperCase() === donaldsonCode.toUpperCase()) return false;
    if (isELIMFILTERS(code)) return false;
    return true;
  });

  const oem = [], aftermarket = [];
  filtered.forEach(({ brand, code }) => {
    const cat = classify(brand, code);
    if      (cat === "oem")         oem.push({ brand, code });
    else if (cat === "aftermarket") aftermarket.push({ brand, code });
  });

  return { oem, aftermarket, total: oem.length + aftermarket.length };
}

// ─── Merge sin duplicados ─────────────────────────────────────────────────────
function mergeArrays(existing, incoming) {
  const seen = new Set(), result = [];
  [...(existing || []), ...(incoming || [])].forEach(item => {
    let key;
    if (typeof item === "string") {
      key = item.toUpperCase().trim();
      if (!seen.has(key)) { seen.add(key); result.push(item); }
    } else {
      key = `${(item.brand||"").toUpperCase()}::${(item.code||"").toUpperCase()}`;
      if (!seen.has(key)) { seen.add(key); result.push(item); }
    }
  });
  return result;
}

// ─── Extraer alternates Donaldson del DB ──────────────────────────────────────
function extractAlternateDonaldsonCodes(jsonStr) {
  const DONALDSON_RE = /^(P\d{6}|DBA\d{4}|DBH\d{4}|DBL\d{4}|DBC\d{4}|R\d{6}|X\d{6}|E\d{6}|G\d{6}|A\d{6})$/i;
  try {
    const arr   = JSON.parse(jsonStr || "[]");
    const codes = new Set();
    arr.forEach(item => {
      const tokens = typeof item === "string"
        ? item.trim().split(/\s+/)
        : [item.code || ""];
      tokens.forEach(t => { if (DONALDSON_RE.test(t)) codes.add(t.toUpperCase()); });
    });
    return [...codes];
  } catch { return []; }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== FUEL FILTER CROSS-REFERENCE SCRAPER ===");
  console.log(`Modo     : ${DRY_RUN ? "DRY-RUN (sin escritura DB)" : "PRODUCCIÓN"}`);
  if (SKU_ARG) console.log(`SKU      : ${SKU_ARG}`);
  if (LIMIT < 999999) console.log(`Límite   : ${LIMIT}`);

  await pgClient.connect();
  console.log("PostgreSQL conectado");

  const params = [];
  let whereExtra = "";
  if (SKU_ARG) { whereExtra = " AND codigo_base = $1"; params.push(SKU_ARG); }

  // Solo códigos con formato Donaldson válido:
  // P/R/X/E/G/A + 6 dígitos  →  P550440, R000958, G100003...
  // DBA/DBH/DBL/DBC + 4 dígitos  →  DBA5034, DBH0949, DBC4081...
  const { rows } = await pgClient.query(`
    SELECT DISTINCT codigo_base, sku,
           COALESCE(oem_codes::text,        '[]') AS oem_raw,
           COALESCE(competitor_codes::text,  '[]') AS comp_raw
    FROM elimfilters_catalog
    WHERE codigo_base IS NOT NULL
      AND filter_type IN (
        'Fuel Filter', 'Fuel Separator', 'Fuel Housing',
        'Marine FUEL', 'Marine OIL', 'Marine WATER_SEP',
        'Coolant Filter', 'Coolant', 'Air Dryer'
      )
      AND (
        codigo_base ~ '^[PRXEG][0-9]{6}$'
        OR codigo_base ~ '^A[0-9]{6}$'
        OR codigo_base ~ '^DB[AHLC][0-9]{4}$'
      )
      ${whereExtra}
    ORDER BY codigo_base
    LIMIT ${LIMIT}
  `, params);

  console.log(`Códigos a procesar: ${rows.length}\n`);

  // ── Detectar Chrome/Edge
  const CHROME_PATHS = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ].filter(Boolean);

  let executablePath = process.env.CHROME_PATH || undefined;
  if (!executablePath) {
    for (const p of CHROME_PATHS) {
      if (fs.existsSync(p)) { executablePath = p; break; }
    }
  }
  if (executablePath) console.log(`Browser: ${executablePath}`);
  else console.log("Browser: Chromium bundled");

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

  // Visitar home para cookies
  await page.goto("https://www.fuelfilter-crossreference.com/",
    { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await sleep(2500);

  // ── Loop principal
  let processed = 0, withData = 0, noData = 0, errs = 0;
  const allResults = [];

  for (const row of rows) {
    const code = row.codigo_base;
    processed++;
    process.stdout.write(`  [${String(processed).padStart(5)}/${rows.length}] ${code.padEnd(12)} ... `);

    let res = await scrapePage(page, code);

    if (res.error) {
      console.log(`ERROR: ${res.error}`);
      errs++;

    } else if (res.notFound || res.total === 0) {
      // ── Fallback con alternates Donaldson ────────────────────────────────
      const altCodes = [
        ...extractAlternateDonaldsonCodes(row.oem_raw),
        ...extractAlternateDonaldsonCodes(row.comp_raw),
      ].filter(c => c !== code.toUpperCase());

      if (altCodes.length > 0) {
        process.stdout.write(`sin datos → fallback (${altCodes.length} alts) ... `);

        const fallbackOem  = [];
        const fallbackXref = [];
        for (const altCode of altCodes.slice(0, 3)) {
          await sleep(1000 + Math.random() * 800);
          const altRes = await scrapePage(page, altCode);
          if (!altRes.error && altRes.total > 0) {
            fallbackOem.push(...altRes.oem);
            fallbackXref.push(...altRes.aftermarket);
          }
        }

        const mergedOem  = mergeArrays([], fallbackOem);
        const mergedXref = mergeArrays([], fallbackXref);

        if (mergedOem.length + mergedXref.length > 0) {
          console.log(`OK (via alt)  OEM=${mergedOem.length}  xref=${mergedXref.length}`);
          withData++;
          res = { oem: mergedOem, aftermarket: mergedXref,
                  total: mergedOem.length + mergedXref.length, viaAlternate: true };

          if (!DRY_RUN) {
            try {
              await pgClient.query(`
                UPDATE elimfilters_catalog
                SET oem_codes        = $1::jsonb,
                    competitor_codes = $2::jsonb
                WHERE codigo_base = $3
              `, [
                JSON.stringify(mergeArrays(JSON.parse(row.oem_raw  || "[]"), mergedOem)),
                JSON.stringify(mergeArrays(JSON.parse(row.comp_raw || "[]"), mergedXref)),
                code
              ]);
            } catch (e) { console.error(`    DB error: ${e.message}`); }
          }
        } else {
          console.log("sin datos (alts tampoco)");
          noData++;
        }
      } else {
        console.log("sin datos");
        noData++;
      }

    } else {
      console.log(`OK  OEM=${res.oem.length}  xref=${res.aftermarket.length}`);
      withData++;

      if (!DRY_RUN) {
        try {
          await pgClient.query(`
            UPDATE elimfilters_catalog
            SET oem_codes        = $1::jsonb,
                competitor_codes = $2::jsonb
            WHERE codigo_base = $3
          `, [
            JSON.stringify(mergeArrays(JSON.parse(row.oem_raw  || "[]"), res.oem)),
            JSON.stringify(mergeArrays(JSON.parse(row.comp_raw || "[]"), res.aftermarket)),
            code
          ]);
        } catch (e) { console.error(`    DB error: ${e.message}`); }
      }
    }

    allResults.push({ donaldsonCode: code, sku: row.sku, ...res });
    await sleep(1800 + Math.random() * 1500);
  }

  await browser.close();
  await pgClient.end();

  // ── Guardar JSON
  const ts      = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outFile = path.join(__dirname, "..", "scrape_reports",
                            `fuelfilter-crossrefs-${ts}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({
    meta: { ts, processed, withData, noData, errors: errs },
    results: allResults
  }, null, 2));

  console.log("\n=== RESUMEN ===");
  console.log(`Procesados : ${processed}`);
  console.log(`Con datos  : ${withData}`);
  console.log(`Sin datos  : ${noData}`);
  console.log(`Errores    : ${errs}`);
  console.log(`Guardado   : ${outFile}`);

  const sample = allResults.filter(r => r.total > 0).slice(0, 5);
  if (sample.length) {
    console.log("\n── Muestra ──");
    sample.forEach(r => {
      console.log(`\n  ${r.donaldsonCode}  (OEM=${r.oem.length} xref=${r.aftermarket.length})`);
      r.oem.slice(0, 3).forEach(x => console.log(`    OEM  : ${x.brand} ${x.code}`));
      r.aftermarket.slice(0, 3).forEach(x => console.log(`    XREF : ${x.brand} ${x.code}`));
    });
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
