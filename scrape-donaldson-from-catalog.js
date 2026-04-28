const puppeteer = require("puppeteer");

const CATALOG_URL = "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";

const PRODUCTS_TO_FIND = [
  "P169071", "P173489", "P502007", "P502008"
];

async function main() {
  console.log("🔥 Buscando productos desde catálogo...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();

  try {
    console.log("📄 Navegando al catálogo...");
    await page.goto(CATALOG_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ Catálogo cargado\n");

    // Extraer todos los enlaces de productos
    const productLinks = await page.evaluate(() => {
      const links = {};
      document.querySelectorAll("a[href*='product']").forEach(el => {
        const href = el.getAttribute("href");
        const text = el.textContent.trim();
        if (href && text) {
          // Buscar si contiene un número de parte
          const partMatch = text.match(/P\d{6}/);
          if (partMatch) {
            links[partMatch[0]] = href;
          }
        }
      });
      return links;
    });

    console.log(`Encontrados ${Object.keys(productLinks).length} enlaces de productos\n`);

    // Mostrar los que encontramos
    for (const part of PRODUCTS_TO_FIND) {
      if (productLinks[part]) {
        console.log(`✅ ${part}: ${productLinks[part]}`);
      } else {
        console.log(`❌ ${part}: NO ENCONTRADO`);
      }
    }

    // Intentar extraer todas las URLs
    const allProductUrls = await page.evaluate(() => {
      const urls = [];
      // Buscar en atributos href
      document.querySelectorAll("[href]").forEach(el => {
        const href = el.getAttribute("href");
        if (href && href.includes("/product/") && href.includes("P")) {
          urls.push(href);
        }
      });
      return [...new Set(urls)]; // Duplicados únicos
    });

    console.log(`\n📋 Todas las URLs de productos encontradas:\n`);
    allProductUrls.slice(0, 10).forEach(url => {
      console.log(`  ${url}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
}

main();
