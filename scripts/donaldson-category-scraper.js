/**
 * Donaldson Category Scraper
 * Extracts all 499 products from category N=626398726
 * URL: https://shop.donaldson.com/store/es-us/search?N=626398726&catNav=true
 *
 * Usage:
 *   node scripts/donaldson-category-scraper.js
 *   node scripts/donaldson-category-scraper.js --resume   (resume from checkpoint)
 *
 * Architecture:
 *   Phase 1 - Listing: single browser, single tab reused across all 25 pages
 *   Phase 2 - Details: pool of 3 concurrent tabs per product detail page
 */

// ─── Dependencies ─────────────────────────────────────────────────────────────
// Use puppeteer-core (no bundled Chromium) with system Chrome; fall back to puppeteer
let puppeteer;
try {
  puppeteer = require("puppeteer-core");
} catch {
  puppeteer = require("puppeteer");
}
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  categoryId: "626398726",
  locale: "es-us",
  baseUrl: "https://shop.donaldson.com",
  resultsPerPage: 20,
  totalProducts: 499,
  get totalPages() {
    return Math.ceil(this.totalProducts / this.resultsPerPage); // 25
  },

  // Timing
  pageLoadTimeout: 45000,
  navWaitUntil: "networkidle2",
  delayBetweenPages: 4000,    // ms between listing pages (avoid rate limiting)
  delayBetweenDetails: 500,   // ms between detail page batches
  concurrentDetails: 3,       // parallel tabs for detail pages

  // Browser
  headless: true,

  // Output
  outputDir: path.join(__dirname, "..", "scrape_reports"),
  get checkpointFile() {
    return path.join(this.outputDir, "donaldson-checkpoint.json");
  },
};

// ─── CLI flags ────────────────────────────────────────────────────────────────
const RESUME = process.argv.includes("--resume");

// ─── Blocked resource types (ONLY for detail pages — NOT for listing pages) ───
// Blocking stylesheets on listing pages breaks the JS that renders products.
// Only block heavy media on detail pages to speed up specs/crossref extraction.
const BLOCKED_RESOURCE_TYPES_DETAIL = new Set(["image", "font", "media"]);

// Tracking/analytics domains to abort (all pages)
const BLOCKED_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.net",
  "hotjar.com",
  "tealiumiq.com",
  "ensighten.com",
  "bazaarvoice.com",
];

// ─── Chrome/Edge executable paths (Windows + Linux) ──────────────────────────
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter(Boolean);

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

function saveCheckpoint(data) {
  ensureOutputDir();
  fs.writeFileSync(CONFIG.checkpointFile, JSON.stringify(data, null, 2));
}

function loadCheckpoint() {
  if (fs.existsSync(CONFIG.checkpointFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.checkpointFile, "utf8"));
  }
  return null;
}

function deleteCheckpoint() {
  if (fs.existsSync(CONFIG.checkpointFile)) {
    fs.unlinkSync(CONFIG.checkpointFile);
  }
}

// Resolve a potentially-relative URL to an absolute one
function absoluteUrl(href) {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return `${CONFIG.baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
}

// ─── Request interception ─────────────────────────────────────────────────────
// listingPage = false → only block trackers (let CSS/JS load for product render)
// detailPage  = true  → also block images/fonts/media (we only need text data)
async function setupPageInterception(page, isDetailPage = false) {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    const url = req.url();

    // Block trackers on all pages
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain))) {
      req.abort();
      return;
    }

    // On detail pages also block heavy media
    if (isDetailPage && BLOCKED_RESOURCE_TYPES_DETAIL.has(type)) {
      req.abort();
      return;
    }

    req.continue();
  });
}

// ─── Phase 1: Extract product stubs from one listing page ────────────────────
/**
 * Confirmed page structure:
 *   - Products are in <a href*="/store/product/"> links
 *   - SKU is extracted from URL segment: /store/product/{SKU}/{ID}
 *     or /store/es-us/product/{SKU}/{ID}
 *   - Each product link appears TWICE in the HTML — deduplicate by SKU
 *   - Product name is the link text (cleaned up)
 */
async function extractListingProducts(page, pageNum) {
  return await page.evaluate((pageNum, resultsPerPage, baseUrl) => {
    const seen = new Set();
    const products = [];

    // Select all product links — matches both:
    //   /store/product/{SKU}/{ID}          (page 1 pattern)
    //   /store/es-us/product/{SKU}/{ID}    (page 2+ pattern)
    const links = document.querySelectorAll('a[href*="/product/"]');

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";

      // Extract SKU: the first path segment after /product/
      const skuMatch = href.match(/\/product\/([^/]+)\//);
      if (!skuMatch) return;
      const sku = skuMatch[1];

      // Deduplicate — each product appears twice in the DOM
      if (seen.has(sku)) return;
      seen.add(sku);

      // Build absolute product URL
      const productUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;

      // Product name: clean up link text
      const rawText = link.textContent || "";
      const name = rawText.replace(/\s+/g, " ").trim();

      products.push({
        index: (pageNum - 1) * resultsPerPage + products.length + 1,
        sku,
        name: name || sku,
        productUrl,
        page: pageNum,
      });
    });

    return products;
  }, pageNum, CONFIG.resultsPerPage, CONFIG.baseUrl);
}

// ─── Phase 2: Extract full details from one product page ─────────────────────
/**
 * Confirmed detail page selectors (in priority order):
 *
 * Name:        h1.pdp-title > .donaldson-product-details h1 > .productDataDetails h1 > h1 > h2
 * Image:       img.productMainImg | img[class*='product']
 * Alternates:  #alternateBody .item[data-url]
 * Related:     #relatedBody .item[data-url]
 * Specs:       #attributesBody .productAttrSection table tr (skip hidden rows)
 * Pkg dims:    #attributesBody .attributeValuesSection table tr
 * Cross refs:  #crossreferenceBody .applicationPartTablePDP tbody tr
 */
async function extractProductDetails(page, product) {
  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await page.goto(product.productUrl, {
        waitUntil: CONFIG.navWaitUntil,
        timeout: CONFIG.pageLoadTimeout,
      });

      const details = await page.evaluate((baseUrl) => {
        // ── Main product name ──────────────────────────────────────────────────
        const nameSelectors = [
          "h1.pdp-title",
          ".donaldson-product-details h1",
          ".productDataDetails h1",
          "h1",
        ];
        let nameEl = null;
        for (const sel of nameSelectors) {
          nameEl = document.querySelector(sel);
          if (nameEl) break;
        }
        if (!nameEl) nameEl = document.querySelector("h2");
        const name = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";

        // ── Main product image ─────────────────────────────────────────────────
        const imgEl =
          document.querySelector("img.productMainImg") ||
          document.querySelector("img[class*='product']");
        const imageUrl = imgEl ? imgEl.getAttribute("src") || "" : "";

        // ── Alternate parts (#alternateBody) ───────────────────────────────────
        const alternateParts = [];
        document.querySelectorAll("#alternateBody .item[data-url]").forEach((item) => {
          const skuEl = item.querySelector("pre.preAlternate h5");
          const descEl = item.querySelector("h6.desLengthCheck");
          const imgPartEl = item.querySelector("img");
          const dataUrl = item.getAttribute("data-url") || "";

          const sku = skuEl ? skuEl.textContent.replace(/\s+/g, " ").trim() : "";
          // Description: prefer title attribute (contains full text), fall back to textContent
          const description = descEl
            ? (descEl.getAttribute("title") || descEl.textContent || "").replace(/\s+/g, " ").trim()
            : "";
          const imageUrl = imgPartEl ? imgPartEl.getAttribute("src") || "" : "";
          const productUrl = dataUrl
            ? dataUrl.startsWith("http")
              ? dataUrl
              : `${baseUrl}${dataUrl}`
            : "";

          if (sku) {
            alternateParts.push({ sku, description, imageUrl, productUrl });
          }
        });

        // ── Related products (#relatedBody) ────────────────────────────────────
        const relatedProducts = [];
        document.querySelectorAll("#relatedBody .item[data-url]").forEach((item) => {
          const skuEl = item.querySelector("pre.preHeading h5");
          const descEl = item.querySelector(".desLengthCheck");
          const imgRelEl = item.querySelector("img.carousalRelatedImg");
          const dataUrl = item.getAttribute("data-url") || "";

          const sku = skuEl ? skuEl.textContent.replace(/\s+/g, " ").trim() : "";
          const description = descEl
            ? (descEl.getAttribute("title") || descEl.textContent || "").replace(/\s+/g, " ").trim()
            : "";
          const imageUrl = imgRelEl ? imgRelEl.getAttribute("src") || "" : "";
          const productUrl = dataUrl
            ? dataUrl.startsWith("http")
              ? dataUrl
              : `${baseUrl}${dataUrl}`
            : "";

          if (sku) {
            relatedProducts.push({ sku, description, imageUrl, productUrl });
          }
        });

        // ── Attributes/Specs (#attributesBody .productAttrSection) ─────────────
        const specs = {};
        document
          .querySelectorAll("#attributesBody .productAttrSection table tr")
          .forEach((row) => {
            // Skip rows hidden via inline style
            if (row.getAttribute("style") && row.getAttribute("style").includes("display: none")) {
              return;
            }
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
              const key = cells[0].textContent.replace(/\s+/g, " ").trim();
              const val = cells[cells.length - 1].textContent.replace(/\s+/g, " ").trim();
              if (key && val) specs[key] = val;
            }
          });

        // ── Package dimensions (#attributesBody .attributeValuesSection) ────────
        const packageDimensions = {};
        document
          .querySelectorAll("#attributesBody .attributeValuesSection table tr")
          .forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
              const key = cells[0].textContent.replace(/\s+/g, " ").trim();
              const val = cells[cells.length - 1].textContent.replace(/\s+/g, " ").trim();
              if (key && val) packageDimensions[key] = val;
            }
          });

        // ── Cross references (#crossreferenceBody) ─────────────────────────────
        const crossRefs = [];
        document
          .querySelectorAll("#crossreferenceBody .applicationPartTablePDP tbody tr")
          .forEach((row) => {
            const manufacturerEl = row.querySelector("td[data-manufacturer]");
            const partNumberEl = row.querySelector("td[data-manufacturepartnumber] span");
            const notesEl = row.querySelector("td[data-crossreferencenotes] span");

            const manufacturer = manufacturerEl
              ? manufacturerEl.textContent.replace(/\s+/g, " ").trim()
              : "";
            const partNumber = partNumberEl
              ? partNumberEl.textContent.replace(/\s+/g, " ").trim()
              : "";
            const notes = notesEl
              ? notesEl.textContent.replace(/\s+/g, " ").trim()
              : "";

            if (manufacturer || partNumber) {
              crossRefs.push({ manufacturer, partNumber, notes });
            }
          });

        return {
          name,
          imageUrl,
          alternateParts,
          relatedProducts,
          specs,
          packageDimensions,
          crossRefs,
        };
      }, CONFIG.baseUrl);

      // Make image URL absolute
      const imageUrl = details.imageUrl ? absoluteUrl(details.imageUrl) : "";

      return {
        ...product,
        // Override name with the detailed page name if it's more descriptive
        name: details.name || product.name,
        imageUrl,
        specs: details.specs,
        packageDimensions: details.packageDimensions,
        crossRefs: details.crossRefs,
        alternateParts: details.alternateParts,
        relatedProducts: details.relatedProducts,
        detailsFetched: true,
      };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const backoff = 2000 * attempt; // 2s, 4s, 8s
        await sleep(backoff);
      }
    }
  }

  // All retries exhausted
  return {
    ...product,
    detailsFetched: false,
    detailsError: lastError ? lastError.message.split("\n")[0] : "Unknown error",
  };
}

// ─── Phase 2: Pool of concurrent detail tabs ──────────────────────────────────
async function fetchDetailsPool(browser, products, onBatchCheckpoint) {
  const results = new Array(products.length);
  const poolSize = CONFIG.concurrentDetails;
  const total = products.length;

  // Create a fixed pool of reusable tabs
  const pages = await Promise.all(
    Array.from({ length: Math.min(poolSize, total) }, async () => {
      const p = await browser.newPage();
      // Detail pages: block images/fonts/media but allow CSS/JS
      await setupPageInterception(p, true);
      await p.setViewport({ width: 1280, height: 800 });
      await p.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );
      await p.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
        window.chrome = { runtime: {} };
      });
      return p;
    })
  );

  for (let i = 0; i < total; i += poolSize) {
    const batch = products.slice(i, i + poolSize);
    const batchNum = Math.floor(i / poolSize) + 1;
    const totalBatches = Math.ceil(total / poolSize);

    process.stdout.write(
      `  Batch ${batchNum}/${totalBatches} (products ${i + 1}-${Math.min(i + poolSize, total)})... `
    );

    const batchResults = await Promise.all(
      batch.map((product, batchIdx) =>
        extractProductDetails(pages[batchIdx % pages.length], product)
      )
    );

    batchResults.forEach((result, batchIdx) => {
      results[i + batchIdx] = result;
    });

    const fetched = batchResults.filter((p) => p.detailsFetched).length;
    const failed = batchResults.filter((p) => p.detailsFetched === false).length;
    process.stdout.write(`OK ${fetched}/${batch.length}${failed > 0 ? ` (${failed} errors)` : ""}\n`);

    // Checkpoint every 25 products
    if ((i + poolSize) % 25 === 0 || i + poolSize >= total) {
      if (typeof onBatchCheckpoint === "function") {
        onBatchCheckpoint(results.filter(Boolean));
      }
    }

    if (i + poolSize < total) {
      await sleep(CONFIG.delayBetweenDetails);
    }
  }

  // Close pool tabs
  await Promise.all(pages.map((p) => p.close()));

  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== Donaldson Category Scraper ===\n");
  console.log(`Category  : N=${CONFIG.categoryId}`);
  console.log(`Locale    : ${CONFIG.locale}`);
  console.log(`Expected  : ${CONFIG.totalProducts} products / ${CONFIG.totalPages} pages`);
  console.log(`Resume    : ${RESUME ? "YES" : "NO"}`);
  console.log(`Output    : ${CONFIG.outputDir}\n`);

  ensureOutputDir();

  let allProducts = [];
  let startPage = 1;
  let errors = [];
  let detailsStartIndex = 0; // index into allProducts for resuming details

  // ── Load checkpoint if resuming ──────────────────────────────────────────
  if (RESUME) {
    const checkpoint = loadCheckpoint();
    if (checkpoint) {
      allProducts = checkpoint.products || [];
      startPage = (checkpoint.lastListingPage || 0) + 1;
      detailsStartIndex = checkpoint.detailsCompleted || 0;
      errors = checkpoint.errors || [];
      console.log(
        `Resuming from listing page ${startPage} (${allProducts.length} products already collected, ${detailsStartIndex} details done)\n`
      );
    }
  }

  // ── Detect system Chrome/Edge/Chromium ───────────────────────────────────
  let executablePath;
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browserOptions = {
    headless: false,  // Site detects headless — run visible (minimized)
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1280,900",
      "--start-minimized",  // Open minimized so it doesn't get in the way
    ],
  };

  if (executablePath) {
    browserOptions.executablePath = executablePath;
    console.log(`Using browser: ${executablePath}`);
  } else {
    console.log("Using bundled Chromium (puppeteer fallback)");
  }
  console.log();

  const browser = await puppeteer.launch(browserOptions);

  try {
    // ════════════════════════════════════════════════════════════════════════
    // PHASE 1: Collect product stubs from all listing pages
    // Single browser, single tab reused across all 25 pages
    // ════════════════════════════════════════════════════════════════════════
    if (startPage <= CONFIG.totalPages) {
      console.log("--- Phase 1: Listing pages (direct navigation, no session pre-load) ---\n");

      // Create ONE tab and reuse it for all listing pages
      // NO request interception on listing pages — let everything load normally
      const listPage = await browser.newPage();
      await listPage.setViewport({ width: 1920, height: 1080 });
      await listPage.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );

      // Go directly to the first category page — no home page visit
      // (visiting home first was causing session issues)

      for (let pageNum = startPage; pageNum <= CONFIG.totalPages; pageNum++) {
        const offset = (pageNum - 1) * CONFIG.resultsPerPage;
        const url = `${CONFIG.baseUrl}/store/${CONFIG.locale}/search?N=${CONFIG.categoryId}&catNav=true&No=${offset}&Nrpp=${CONFIG.resultsPerPage}`;

        process.stdout.write(`  Page ${pageNum}/${CONFIG.totalPages} (offset=${offset})... `);

        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await listPage.goto(url, {
              waitUntil: "networkidle2",
              timeout: CONFIG.pageLoadTimeout,
            });

            // Wait for product links — up to 20s
            await listPage.waitForSelector('a[href*="/product/"]', { timeout: 20000 });

            // On page 1, save a screenshot for debugging
            if (pageNum === 1 && attempt === 1) {
              const shot = path.join(CONFIG.outputDir, "donaldson-listing-page1.png");
              await listPage.screenshot({ path: shot, fullPage: false });
              console.log(`     (screenshot saved: ${shot})`);
            }

            const products = await extractListingProducts(listPage, pageNum);
            allProducts.push(...products);

            process.stdout.write(`OK ${products.length} products (total: ${allProducts.length})\n`);
            success = true;
            break;
          } catch (err) {
            if (attempt < 3) {
              // Save screenshot to see what the page looks like when failing
              if (attempt === 1) {
                try {
                  const errShot = path.join(CONFIG.outputDir, `donaldson-error-page${pageNum}.png`);
                  await listPage.screenshot({ path: errShot, fullPage: false });
                  process.stdout.write(`\n     (error screenshot: ${errShot})\n     `);
                } catch {}
              }
              process.stdout.write(`RETRY ${attempt}/3 (wait ${attempt * 5}s)... `);
              await sleep(attempt * 5000);
            } else {
              process.stdout.write(`ERROR: ${err.message.split("\n")[0]}\n`);
              errors.push({
                phase: "listing",
                page: pageNum,
                offset,
                url,
                error: err.message.split("\n")[0],
              });
            }
          }
        }

        // Checkpoint every 5 listing pages
        if (success && (pageNum % 5 === 0 || pageNum === CONFIG.totalPages)) {
          saveCheckpoint({
            lastListingPage: pageNum,
            detailsCompleted: detailsStartIndex,
            products: allProducts,
            errors,
            timestamp: new Date().toISOString(),
          });
          console.log(`     Checkpoint saved (${allProducts.length} products)`);
        }

        if (pageNum < CONFIG.totalPages) {
          await sleep(CONFIG.delayBetweenPages);
        }
      }

      await listPage.close();

      console.log(`\nPhase 1 complete: ${allProducts.length}/${CONFIG.totalProducts} products`);
      if (errors.length > 0) {
        console.log(`  WARNING: ${errors.length} pages had errors`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 2: Fetch detail pages for every product
    // Pool of 3 concurrent tabs
    // ════════════════════════════════════════════════════════════════════════
    {
      // Determine which products still need details fetched
      const pending = allProducts.filter((p) => !p.detailsFetched);
      console.log(`\n--- Phase 2: Detail pages (${pending.length} products, ${CONFIG.concurrentDetails} concurrent tabs) ---\n`);

      if (pending.length > 0) {
        const detailResults = await fetchDetailsPool(browser, pending, (completedSoFar) => {
          // Merge completed details back and save checkpoint
          const completedSkus = new Set(completedSoFar.map((p) => p.sku));
          const merged = allProducts.map((p) =>
            completedSkus.has(p.sku) ? completedSoFar.find((d) => d.sku === p.sku) || p : p
          );
          saveCheckpoint({
            lastListingPage: CONFIG.totalPages,
            detailsCompleted: completedSoFar.length,
            products: merged,
            errors,
            timestamp: new Date().toISOString(),
          });
        });

        // Merge detail results back into allProducts by SKU
        const detailBySku = new Map(detailResults.filter(Boolean).map((p) => [p.sku, p]));
        allProducts = allProducts.map((p) => detailBySku.get(p.sku) || p);

        const fetched = allProducts.filter((p) => p.detailsFetched === true).length;
        const failed = allProducts.filter((p) => p.detailsFetched === false).length;
        console.log(`\nPhase 2 complete: ${fetched} with details, ${failed} errors`);
      }
    }
  } finally {
    await browser.close();
    console.log("\nBrowser closed.");
  }

  // ── Write final output ────────────────────────────────────────────────────
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const outputFile = path.join(
    CONFIG.outputDir,
    `donaldson-categoria-${CONFIG.categoryId}-${timestamp}.json`
  );

  const result = {
    metadata: {
      timestamp: new Date().toISOString(),
      categoryId: CONFIG.categoryId,
      categoryUrl: `${CONFIG.baseUrl}/store/${CONFIG.locale}/search?N=${CONFIG.categoryId}&catNav=true`,
      totalExtracted: allProducts.length,
      totalExpected: CONFIG.totalProducts,
      errors: errors.length,
    },
    products: allProducts,
  };

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

  // Delete checkpoint if we extracted >=95% of expected products
  if (allProducts.length >= CONFIG.totalProducts * 0.95) {
    deleteCheckpoint();
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=== DONE ===\n");
  console.log(`Products extracted : ${allProducts.length} / ${CONFIG.totalProducts}`);
  console.log(`Errors             : ${errors.length}`);
  console.log(`Output file        : ${outputFile}\n`);

  if (allProducts.length > 0) {
    console.log("Sample (first 5 products):");
    allProducts.slice(0, 5).forEach((p) => {
      console.log(`  [${p.index}] ${p.sku || "(no SKU)"} - ${p.name || "(no name)"}`);
    });
    console.log();
  }
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err.message);
  process.exit(1);
});
