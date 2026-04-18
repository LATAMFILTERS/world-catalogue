/**
 * Script de diagnóstico — inspecciona la estructura HTML real de la página
 * de categoría Donaldson para encontrar los selectores correctos.
 *
 * Uso: node scripts/donaldson-debug.js
 * Genera: scrape_reports/donaldson-debug-screenshot.png
 *         scrape_reports/donaldson-debug-html.txt
 */

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { puppeteer = require("puppeteer"); }

const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "scrape_reports");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const chromiumPaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean).find(p => fs.existsSync(p));

(async () => {
  console.log("🔍 Iniciando diagnóstico de selectores Donaldson...");
  console.log(`   Chrome: ${chromiumPaths || "incluido en puppeteer"}\n`);

  const browser = await puppeteer.launch({
    headless: false,   // VISIBLE para que veas lo que pasa
    executablePath: chromiumPaths,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  const url = "https://shop.donaldson.com/store/es-us/search?N=626398726&catNav=true&No=0&Nrpp=20";
  console.log(`📡 Navegando a: ${url}`);
  console.log("   Esperando carga completa (networkidle2)...");

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  console.log("   ✅ Página cargada. Analizando estructura...\n");

  // Capturar screenshot
  const screenshotPath = path.join(outputDir, "donaldson-debug-screenshot.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Screenshot guardado: ${screenshotPath}`);

  // Inspeccionar estructura
  const info = await page.evaluate(() => {
    const result = {
      title: document.title,
      url: location.href,
      classesConProduct: [],
      selectoresEncontrados: {},
      primerProductoHTML: "",
      totalLinks: 0,
      linksConProduct: [],
      textoVisible: "",
    };

    // Buscar todos los elementos con "product" en su clase
    document.querySelectorAll("*").forEach(el => {
      if (el.className && typeof el.className === "string") {
        const classes = el.className.split(" ").filter(c => c.toLowerCase().includes("product"));
        if (classes.length > 0) {
          classes.forEach(c => {
            if (!result.classesConProduct.includes(c)) result.classesConProduct.push(c);
          });
        }
      }
    });

    // Probar selectores comunes
    const selectores = [
      ".product-tile", ".product-item", ".product-result", ".product-card",
      "[data-product-id]", ".result-item", "li.product", ".search-result-item",
      ".product-list-item", ".product-listing-item", ".productTile",
      "[class*='product']", "[class*='Product']", "[class*='item']",
      ".product", ".products li", "ul.products > li",
      ".product-name", ".part-number", ".product-number",
    ];

    selectores.forEach(sel => {
      const count = document.querySelectorAll(sel).length;
      if (count > 0) result.selectoresEncontrados[sel] = count;
    });

    // Primer elemento con clase product-*
    const firstProduct = document.querySelector("[class*='product']");
    if (firstProduct) {
      result.primerProductoHTML = firstProduct.outerHTML.substring(0, 800);
    }

    // Links que contienen /product/
    document.querySelectorAll("a").forEach(a => {
      result.totalLinks++;
      if (a.href && a.href.includes("/product/")) {
        result.linksConProduct.push({ href: a.href, text: a.textContent.trim().substring(0, 80) });
      }
    });

    // Texto visible en el body
    result.textoVisible = (document.body.innerText || "").substring(0, 500);

    return result;
  });

  console.log("\n📋 RESULTADOS DEL DIAGNÓSTICO:");
  console.log("─────────────────────────────────────────");
  console.log(`Título      : ${info.title}`);
  console.log(`URL actual  : ${info.url}`);
  console.log(`Total links : ${info.totalLinks}`);
  console.log(`Links /product/ encontrados: ${info.linksConProduct.length}`);

  console.log("\n🔑 Clases con 'product' encontradas:");
  info.classesConProduct.slice(0, 30).forEach(c => console.log(`   .${c}`));

  console.log("\n✅ Selectores que devuelven resultados:");
  if (Object.keys(info.selectoresEncontrados).length === 0) {
    console.log("   ❌ NINGUNO — la página puede no haber cargado los productos aún");
  } else {
    Object.entries(info.selectoresEncontrados).forEach(([sel, count]) =>
      console.log(`   ${sel}: ${count} elementos`)
    );
  }

  if (info.linksConProduct.length > 0) {
    console.log("\n🔗 Primeros 5 links de productos:");
    info.linksConProduct.slice(0, 5).forEach(l => console.log(`   ${l.href}\n   → "${l.text}"`));
  }

  if (info.primerProductoHTML) {
    console.log("\n📄 HTML del primer elemento con clase 'product':");
    console.log(info.primerProductoHTML);
  }

  console.log("\n📝 Texto visible en la página (primeros 500 chars):");
  console.log(info.textoVisible);

  // Guardar HTML completo para inspección
  const html = await page.content();
  const htmlPath = path.join(outputDir, "donaldson-debug-html.txt");
  fs.writeFileSync(htmlPath, html.substring(0, 50000)); // primeros 50KB
  console.log(`\n💾 HTML parcial guardado: ${htmlPath}`);

  // Guardar resultado en JSON
  const jsonPath = path.join(outputDir, "donaldson-debug-info.json");
  fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
  console.log(`💾 Info diagnóstico guardada: ${jsonPath}`);

  console.log("\n⏳ Cerrando browser en 5 segundos...");
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
  console.log("✅ Listo. Revisa los archivos en scrape_reports/");
})().catch(err => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});
