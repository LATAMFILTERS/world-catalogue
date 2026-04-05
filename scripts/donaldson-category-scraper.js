/**
 * Donaldson Category Scraper — Puppeteer Optimizado
 * Extrae los 499 productos de la categoría N=626398726
 * URL: https://shop.donaldson.com/store/es-us/search?N=626398726&catNav=true
 *
 * OPTIMIZACIONES VS PUPPETEER BÁSICO:
 *  - Un solo browser para las 25 páginas (no se abre/cierra en cada página)
 *  - Bloqueo de imágenes, CSS, fonts, analytics → ~70% menos tiempo de carga
 *  - Reutilización de la misma pestaña (navegación directa entre páginas)
 *  - Concurrencia configurable para páginas de detalle
 *  - Checkpoints para resumir en caso de fallo
 *
 * Uso:
 *   node scripts/donaldson-category-scraper.js
 *   node scripts/donaldson-category-scraper.js --details        (specs + cross-refs por producto)
 *   node scripts/donaldson-category-scraper.js --resume         (retoma desde checkpoint)
 *   node scripts/donaldson-category-scraper.js --details --resume
 */

// Usa puppeteer-core (sin descargar Chromium) con Chrome/Edge del sistema
let puppeteer;
try {
  puppeteer = require("puppeteer-core");
} catch {
  puppeteer = require("puppeteer");
}
const fs = require("fs");
const path = require("path");

// ─── Configuración ────────────────────────────────────────────────────────────
const CONFIG = {
  categoryId: "626398726",
  locale: "es-us",
  baseUrl: "https://shop.donaldson.com",
  resultsPerPage: 20,
  totalProducts: 499,
  get totalPages() {
    return Math.ceil(this.totalProducts / this.resultsPerPage); // 25
  },

  // Velocidad
  pageLoadTimeout: 30000,
  navWaitUntil: "networkidle2", // esperar que JS renderice los productos
  delayBetweenPages: 800,           // ms entre páginas de listado
  delayBetweenDetails: 400,         // ms entre páginas de detalle
  concurrentDetails: 3,             // pestañas paralelas para detalles

  // Puppeteer
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser",

  // Archivos
  outputDir: path.join(__dirname, "..", "scrape_reports"),
  get checkpointFile() {
    return path.join(this.outputDir, "donaldson-checkpoint.json");
  },
};

// Flags de línea de comandos
const FETCH_DETAILS = process.argv.includes("--details");
const RESUME = process.argv.includes("--resume");

// ─── Tipos de recursos a BLOQUEAR (aceleran la carga enormemente) ─────────────
const BLOCKED_RESOURCE_TYPES = new Set([
  "image",
  "stylesheet",
  "font",
  "media",
  "other",
]);

// Dominios de analytics/tracking a bloquear
const BLOCKED_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.net",
  "hotjar.com",
  "heap.io",
  "segment.io",
  "amplitude.com",
  "tealiumiq.com",
  "ensighten.com",
  "bazaarvoice.com",
  "livechatinc.com",
];

// ─── Utilidades ───────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function saveCheckpoint(data) {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.checkpointFile, JSON.stringify(data, null, 2));
}

function loadCheckpoint() {
  if (fs.existsSync(CONFIG.checkpointFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.checkpointFile, "utf8"));
  }
  return null;
}

function savePartialResults(products, errors, suffix = "partial") {
  const timestamp = Date.now();
  const file = path.join(CONFIG.outputDir, `donaldson-${CONFIG.categoryId}-${suffix}-${timestamp}.json`);
  fs.writeFileSync(file, JSON.stringify({ products, errors, timestamp: new Date().toISOString() }, null, 2));
  return file;
}

// ─── Configurar intercepción de requests en una página ───────────────────────
async function setupPageInterception(page) {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    const url = req.url();

    // Bloquear recursos pesados
    if (BLOCKED_RESOURCE_TYPES.has(type)) {
      req.abort();
      return;
    }

    // Bloquear dominios de tracking
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain))) {
      req.abort();
      return;
    }

    req.continue();
  });
}

// ─── Extraer productos de una página de listado ───────────────────────────────
// Estructura real confirmada: los productos están en <a href="/store/product/{SKU}/{ID}">
async function extractListingProducts(page, pageNum) {
  return await page.evaluate((pageNum, resultsPerPage) => {
    const seen = new Set();
    const products = [];

    // Todos los links de productos — patrón confirmado: /store/product/{SKU}/{ID}
    const links = document.querySelectorAll('a[href*="/store/product/"]');

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const productUrl = href.startsWith("http") ? href : `https://shop.donaldson.com${href}`;

      // Extraer SKU desde la URL: /store/product/{SKU}/{ID}
      const match = href.match(/\/store\/product\/([^/]+)\//);
      const sku = match ? match[1] : "";

      // Deduplicar por URL (cada producto aparece dos veces en el HTML)
      if (!sku || seen.has(sku)) return;
      seen.add(sku);

      // Nombre: buscar en el contenedor más cercano
      const container = link.closest(".donaldson-product-details, [class*='product'], li, tr, div") || link.parentElement;
      const nameEl = container
        ? container.querySelector(".product-name, .product-title, h2, h3, h4, [class*='name'], [class*='description']")
        : null;
      const name = nameEl
        ? nameEl.textContent.trim()
        : link.textContent.replace(/#.*/, "").trim(); // fallback: texto del link sin el anchor

      // Descripción corta
      const descEl = container
        ? container.querySelector("[class*='desc'], .short-description, p")
        : null;
      const shortDescription = descEl ? descEl.textContent.trim() : "";

      products.push({
        index: (pageNum - 1) * resultsPerPage + products.length + 1,
        sku,
        name: name || sku,
        shortDescription,
        productUrl,
        page: pageNum,
      });
    });

    return products;
  }, pageNum, CONFIG.resultsPerPage);
}

// ─── Extraer detalles de una página de producto ───────────────────────────────
async function extractProductDetails(page, product) {
  if (!product.productUrl) return product;

  try {
    await page.goto(product.productUrl, {
      waitUntil: CONFIG.navWaitUntil,
      timeout: CONFIG.pageLoadTimeout,
    });

    const details = await page.evaluate(() => {
      // Descripción completa
      const descEl = document.querySelector(".product-description, .product-details-description");
      const fullDescription = descEl
        ? descEl.textContent.trim()
        : document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

      // Especificaciones técnicas
      const specs = {};
      document.querySelectorAll(".spec-table tr, .specifications tr, table.product-specs tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const val = cells[1].textContent.trim();
          if (key && val) specs[key] = val;
        }
      });
      document.querySelectorAll("dl dt").forEach((dt) => {
        const key = dt.textContent.trim();
        const dd = dt.nextElementSibling;
        const val = dd ? dd.textContent.trim() : "";
        if (key && val) specs[key] = val;
      });

      // Cross References
      const crossRefs = [];
      document
        .querySelectorAll("#crossReferencesList tr, .cross-reference-table tr, .cross-references tr")
        .forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const manufacturer = cells[0].textContent.trim();
            const partNumber = cells[1].textContent.trim();
            if (manufacturer && partNumber) crossRefs.push({ manufacturer, partNumber });
          }
        });
      document.querySelectorAll(".cross-reference-number, [data-cross-ref]").forEach((el) => {
        const val = el.textContent.trim();
        if (val && !crossRefs.find((r) => r.partNumber === val)) {
          crossRefs.push({ manufacturer: "", partNumber: val });
        }
      });

      // Dimensiones
      const dimensions = {};
      document.querySelectorAll(".package-dimensions tr, #packageDimensions tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const val = cells[1].textContent.trim();
          if (key && val) dimensions[key] = val;
        }
      });

      // Imagen
      const imgEl =
        document.querySelector("img.product-image, .product-detail-image img");
      const hiResImage =
        imgEl?.getAttribute("src") ||
        document.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
        "";

      // Categoría (breadcrumbs)
      const breadcrumbs = [];
      document.querySelectorAll(".breadcrumb a, nav.breadcrumb a, .breadcrumbs a").forEach((el) => {
        const text = el.textContent.trim();
        if (text && !["Home", "Inicio", "Accueil"].includes(text)) breadcrumbs.push(text);
      });

      return { fullDescription, specs, crossRefs, dimensions, hiResImage, breadcrumbs };
    });

    return {
      ...product,
      fullDescription: details.fullDescription,
      imageUrl: details.hiResImage
        ? details.hiResImage.startsWith("http")
          ? details.hiResImage
          : `https://shop.donaldson.com${details.hiResImage}`
        : product.imageUrl || "",
      category: details.breadcrumbs.join(" > "),
      specs: details.specs,
      crossRefs: details.crossRefs,
      dimensions: details.dimensions,
      detailsFetched: true,
    };
  } catch (err) {
    return {
      ...product,
      detailsFetched: false,
      detailsError: err.message,
    };
  }
}

// ─── Obtener detalles en paralelo usando un pool de pestañas ─────────────────
async function fetchDetailsPool(browser, products) {
  const results = new Array(products.length);
  const batchSize = CONFIG.concurrentDetails;
  const total = products.length;

  // Crear pool de pestañas
  const pages = await Promise.all(
    Array.from({ length: batchSize }, async () => {
      const page = await browser.newPage();
      await setupPageInterception(page);
      await page.setViewport({ width: 1280, height: 800 });
      return page;
    })
  );

  let processedCount = 0;

  // Procesar en lotes
  for (let i = 0; i < total; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);

    process.stdout.write(
      `  🔍 Detalles lote ${batchNum}/${totalBatches} (productos ${i + 1}-${Math.min(i + batchSize, total)})... `
    );

    const batchResults = await Promise.all(
      batch.map((product, batchIdx) =>
        extractProductDetails(pages[batchIdx % batchSize], product)
      )
    );

    batchResults.forEach((result, batchIdx) => {
      results[i + batchIdx] = result;
    });

    processedCount += batch.length;
    const fetched = batchResults.filter((p) => p.detailsFetched).length;
    process.stdout.write(`✅ ${fetched}/${batch.length}\n`);

    if (i + batchSize < total) {
      await sleep(CONFIG.delayBetweenDetails);
    }
  }

  // Cerrar pestañas del pool
  await Promise.all(pages.map((p) => p.close()));

  return results;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   Donaldson Category Scraper — Puppeteer Optimizado      ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log(`📦 Categoría  : N=${CONFIG.categoryId}`);
  console.log(`🌐 Locale     : ${CONFIG.locale}`);
  console.log(`📊 Esperados  : ${CONFIG.totalProducts} productos / ${CONFIG.totalPages} páginas`);
  console.log(`⚡ Detalles   : ${FETCH_DETAILS ? "SÍ (specs + cross-refs)" : "NO (solo listado)"}`);
  console.log(`🔄 Reanudar   : ${RESUME ? "SÍ" : "NO"}`);
  console.log(`🪄 Optimiz.   : bloqueo de imágenes/CSS/fonts + browser único\n`);

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let allProducts = [];
  let startPage = 1;
  let errors = [];

  // ── Cargar checkpoint si se reanuda ──────────────────────────────────────
  if (RESUME) {
    const checkpoint = loadCheckpoint();
    if (checkpoint && checkpoint.products) {
      allProducts = checkpoint.products;
      startPage = (checkpoint.lastPageScraped || 0) + 1;
      errors = checkpoint.errors || [];
      console.log(
        `♻️  Reanudando desde página ${startPage} (${allProducts.length} productos ya extraídos)\n`
      );
    }
  }

  // ── Lanzar browser UNA sola vez ──────────────────────────────────────────
  console.log("🚀 Lanzando Chromium...");

  // Detectar Chrome/Edge/Chromium instalado en el sistema
  const chromiumPaths = [
    // Windows — Chrome
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    // Windows — Edge
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    // Linux
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    process.env.CHROMIUM_PATH,
  ].filter(Boolean);

  let executablePath;
  for (const p of chromiumPaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browserOptions = {
    headless: CONFIG.headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
    ],
  };

  if (executablePath) {
    browserOptions.executablePath = executablePath;
    console.log(`   Usando: ${executablePath}`);
  } else {
    console.log("   Usando Chromium incluido en puppeteer");
  }

  const browser = await puppeteer.launch(browserOptions);

  try {
    // ── FASE 1: Extraer listado de las 25 páginas ───────────────────────────
    if (startPage <= CONFIG.totalPages) {
      console.log("\n── FASE 1: Extrayendo listado de productos ──────────────────\n");

      // Crear UNA sola página y reutilizarla
      const listPage = await browser.newPage();
      await setupPageInterception(listPage);
      await listPage.setViewport({ width: 1280, height: 900 });

      // User-Agent realista
      await listPage.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );

      // Navegar primero a la página base para establecer cookies/sesión
      if (startPage === 1) {
        process.stdout.write("   Estableciendo sesión en Donaldson... ");
        try {
          await listPage.goto(`${CONFIG.baseUrl}/store/${CONFIG.locale}/home`, {
            waitUntil: CONFIG.navWaitUntil,
            timeout: CONFIG.pageLoadTimeout,
          });
          await sleep(1500);
          process.stdout.write("✅\n\n");
        } catch (err) {
          process.stdout.write(`⚠️  (${err.message.split("\n")[0]})\n\n`);
        }
      }

      for (let page = startPage; page <= CONFIG.totalPages; page++) {
        const offset = (page - 1) * CONFIG.resultsPerPage;
        const url = `${CONFIG.baseUrl}/store/${CONFIG.locale}/search?N=${CONFIG.categoryId}&catNav=true&No=${offset}&Nrpp=${CONFIG.resultsPerPage}`;

        process.stdout.write(`  📄 Página ${page}/${CONFIG.totalPages} (offset=${offset})... `);

        let attempts = 0;
        let success = false;

        while (attempts < 3 && !success) {
          try {
            await listPage.goto(url, {
              waitUntil: CONFIG.navWaitUntil,
              timeout: CONFIG.pageLoadTimeout,
            });

            // Esperar a que aparezcan los links de productos
            try {
              await listPage.waitForSelector(
                'a[href*="/store/product/"]',
                { timeout: 15000 }
              );
            } catch {
              // Si no aparecen en 15s continuar de todos modos
            }

            const products = await extractListingProducts(listPage, page);
            allProducts.push(...products);

            process.stdout.write(`✅ ${products.length} productos (total: ${allProducts.length})\n`);
            success = true;

            // Checkpoint cada 5 páginas
            if (page % 5 === 0 || page === CONFIG.totalPages) {
              saveCheckpoint({
                lastPageScraped: page,
                products: allProducts,
                errors,
                timestamp: new Date().toISOString(),
              });
              process.stdout.write(`     💾 Checkpoint guardado (${allProducts.length} productos)\n`);
            }
          } catch (err) {
            attempts++;
            if (attempts < 3) {
              process.stdout.write(`⚠️  Reintento ${attempts}/3... `);
              await sleep(2000 * attempts);
            } else {
              process.stdout.write(`❌ Error: ${err.message.split("\n")[0]}\n`);
              errors.push({ phase: "listing", page, offset, url, error: err.message.split("\n")[0] });
            }
          }
        }

        if (page < CONFIG.totalPages) {
          await sleep(CONFIG.delayBetweenPages);
        }
      }

      await listPage.close();

      console.log(`\n✅ Fase 1 completa: ${allProducts.length}/${CONFIG.totalProducts} productos`);
      if (errors.length > 0) {
        console.log(`   ⚠️  ${errors.length} páginas con errores`);
      }
    }

    // ── FASE 2: Detalles de cada producto (opcional) ────────────────────────
    if (FETCH_DETAILS && allProducts.length > 0) {
      const pendientes = allProducts.filter((p) => !p.detailsFetched);
      console.log(`\n── FASE 2: Detalles de ${pendientes.length} productos ─────────────────\n`);
      console.log(`   (${CONFIG.concurrentDetails} pestañas en paralelo)\n`);

      if (pendientes.length > 0) {
        const detailResults = await fetchDetailsPool(browser, pendientes);

        // Merge resultados
        const conDetalles = allProducts.filter((p) => p.detailsFetched);
        const allMerged = [...conDetalles, ...detailResults].sort((a, b) => a.index - b.index);
        allProducts = allMerged;

        const exitosos = allProducts.filter((p) => p.detailsFetched).length;
        const fallidos = allProducts.filter((p) => p.detailsFetched === false).length;
        console.log(`\n✅ Fase 2 completa: ${exitosos} con detalles, ${fallidos} con error`);
      }
    }
  } finally {
    await browser.close();
    console.log("\n🛑 Browser cerrado");
  }

  // ── Guardar resultado final ──────────────────────────────────────────────
  const timestamp = Date.now();
  const outputFile = path.join(
    CONFIG.outputDir,
    `donaldson-categoria-${CONFIG.categoryId}-${timestamp}.json`
  );

  const result = {
    metadata: {
      timestamp: new Date().toISOString(),
      categoryId: CONFIG.categoryId,
      categoryUrl: `${CONFIG.baseUrl}/store/${CONFIG.locale}/search?N=${CONFIG.categoryId}&catNav=true`,
      locale: CONFIG.locale,
      totalExtracted: allProducts.length,
      totalExpected: CONFIG.totalProducts,
      pagesScraped: CONFIG.totalPages,
      detailsFetched: FETCH_DETAILS,
      errors: errors.length,
    },
    errorDetails: errors,
    products: allProducts,
  };

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

  // Limpiar checkpoint si completamos exitosamente (>95% extraídos)
  if (allProducts.length >= CONFIG.totalProducts * 0.95 && fs.existsSync(CONFIG.checkpointFile)) {
    fs.unlinkSync(CONFIG.checkpointFile);
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log(`║  ✅ COMPLETADO                                            ║`);
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\n📊 Productos extraídos : ${allProducts.length} / ${CONFIG.totalProducts}`);
  console.log(`❌ Errores             : ${errors.length}`);
  console.log(`💾 Archivo             : ${outputFile}\n`);

  // Muestra de los primeros 5
  if (allProducts.length > 0) {
    console.log("📋 Muestra (primeros 5 productos):");
    allProducts.slice(0, 5).forEach((p) => {
      console.log(`   [${p.index}] ${p.sku || "(sin SKU)"} — ${p.name || "(sin nombre)"}`);
    });
    console.log();
  }
}

main().catch((err) => {
  console.error("\n💥 Error fatal:", err.message);
  process.exit(1);
});
