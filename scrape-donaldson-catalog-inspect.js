const puppeteer = require("puppeteer");

const CATALOG_URL = "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";

async function main() {
  console.log("🔥 Inspeccionando catálogo de Donaldson...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();

  try {
    console.log("📄 Navegando al catálogo...");
    await page.goto(CATALOG_URL, {
      waitUntil: "networkidle0",
      timeout: 40000,
    });

    console.log("✅ Página cargada (networkidle0)\n");

    // Esperar un poco más por contenido dinámico
    await new Promise(r => setTimeout(r, 3000));
    console.log("⏳ Esperado 3s adicionales\n");

    // Inspeccionar qué hay en la página
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyLength: document.body.innerHTML.length,
        allLinks: document.querySelectorAll("a").length,
        divCount: document.querySelectorAll("div").length,
        htmlSnippet: document.body.innerHTML.substring(0, 500),
        // Buscar patrones de producto
        hasProductPattern: !!(document.body.innerHTML || document.innerHTML).match(/P\d{6}/),
        productMatches: ((document.body.innerHTML || document.innerHTML).match(/P\d{6}/g) || []).length,
        // Buscar selectores comunes
        productTiles: document.querySelectorAll("[class*='product']").length,
        // Buscar por clases específicas
        itemElements: document.querySelectorAll(".item, .product-item, [data-product]").length,
      };
    });

    console.log("📊 Información de la página:");
    console.log(`  Título: ${pageInfo.title}`);
    console.log(`  URL: ${pageInfo.url}`);
    console.log(`  Tamaño HTML: ${pageInfo.bodyLength} bytes`);
    console.log(`  Total links: ${pageInfo.allLinks}`);
    console.log(`  Total divs: ${pageInfo.divCount}`);
    console.log(`  Patrones P\\d{6}: ${pageInfo.productMatches}`);
    console.log(`  Elementos product: ${pageInfo.productTiles}`);
    console.log(`  Elementos item: ${pageInfo.itemElements}\n`);

    // Intentar encontrar selector de productos
    const productsFound = await page.evaluate(() => {
      // Intenta múltiples selectores
      const selectors = [
        ".product-item",
        "[data-product-id]",
        ".product",
        ".item",
        "[role='listitem']",
        ".product-tile",
        ".grid-item",
      ];

      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          return {
            selector: sel,
            count: elements.length,
            sample: Array.from(elements)
              .slice(0, 2)
              .map(el => ({
                html: el.innerHTML.substring(0, 200),
                text: el.textContent.trim().substring(0, 100),
              })),
          };
        }
      }

      return { selector: "none", count: 0 };
    });

    console.log("🔍 Selector de productos encontrado:");
    console.log(`  Selector: ${productsFound.selector}`);
    console.log(`  Cantidad: ${productsFound.count}`);
    if (productsFound.sample && productsFound.sample.length > 0) {
      console.log(`  Sample HTML:\n${productsFound.sample[0].html}\n`);
    }

    // Captura HTML de la página para análisis
    const html = await page.content();
    const filename = `donaldson_catalog_snapshot.html`;
    const fs = require("fs");
    fs.writeFileSync(filename, html);
    console.log(`\n📄 HTML completo guardado en: ${filename}`);
    console.log(`   Tamaño: ${html.length} bytes`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
}

main();
