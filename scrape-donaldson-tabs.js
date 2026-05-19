const puppeteer = require("puppeteer");
const fs = require("fs");

const PARTS_TO_SCRAPE = ["P169071", "P173489", "P502007"];

async function scrapePage(page, partNumber) {
  const url = `https://shop.donaldson.com/store/product/${partNumber}/`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    
    const productData = {
      partNumber,
      url,
      basic_info: {},
      tabs: {}
    };

    // ===== BASIC INFO (sin tabs) =====
    productData.basic_info = await page.evaluate(() => {
      return {
        title: document.querySelector("h1")?.innerText,
        description: document.querySelector(".product-description")?.innerText,
      };
    });

    // ===== CLICK & EXTRACT EACH TAB =====
    const tabNames = ["Attributes", "Cross Reference", "Equipment", "Alternate Parts"];

    for (const tabName of tabNames) {
      try {
        // Buscar elemento del tab por texto
        const tabSelector = `button:has-text("${tabName}")`;
        
        // Intentar clickear
        await page.evaluate((tab) => {
          const btn = Array.from(document.querySelectorAll("button, a")).find(el => 
            el.textContent.includes(tab)
          );
          if (btn) btn.click();
        }, tabName);

        await new Promise(r => setTimeout(r, 1500));

        // Expandir "MOSTRAR MÁS" si existe
        await page.evaluate(() => {
          document.querySelectorAll("button").forEach(btn => {
            if (btn.textContent.includes("MOSTRAR MÁS") || btn.textContent === "+") {
              btn.click();
            }
          });
        });

        await new Promise(r => setTimeout(r, 1000));

        // Extraer contenido del tab
        const tabContent = await page.evaluate(() => {
          const activeTab = document.querySelector("[role='tabpanel'], .tab-content.active");
          return activeTab?.innerText || document.body.innerText;
        });

        productData.tabs[tabName] = tabContent;
        console.log(`   ✅ Tab: ${tabName}`);

      } catch (e) {
        console.log(`   ⚠️  Tab ${tabName}: ${e.message}`);
      }
    }

    return {
      success: true,
      data: productData,
    };

  } catch (error) {
    return {
      success: false,
      partNumber,
      error: error.message,
    };
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: false }); // headless:false para ver qué pasa
  const page = await browser.newPage();

  const results = [];

  console.log("🔥 Scraping Donaldson Product Tabs...\n");

  for (const part of PARTS_TO_SCRAPE) {
    console.log(`📄 ${part}`);
    const result = await scrapePage(page, part);
    results.push(result);
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  fs.writeFileSync("donaldson_tabs_extracted.json", JSON.stringify(results, null, 2));
  console.log(`\n✅ Guardado: donaldson_tabs_extracted.json`);
}

main().catch(console.error);