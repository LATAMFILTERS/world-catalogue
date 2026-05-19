const puppeteer = require("puppeteer");
const fs = require("fs");

const PARTS_TO_SCRAPE = [
  "P169071", "P173489", "P502007", "P502008", "P502009", "P502015",
  "P581330", "P173998", "P582090", "P177300"
];

async function scrapePage(page, partNumber) {
  const url = `https://shop.donaldson.com/store/product/${partNumber}/`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

    // Expandir tabs
    const tabs = ["Attributes", "Cross Reference", "Equipment", "Alternate Parts"];

    for (const tab of tabs) {
      try {
        // Buscar botón de tab
        await page.click(`button:has-text("${tab}"), a:has-text("${tab}")`);
        await new Promise(r => setTimeout(r, 1000));

        // Clickear todos los botones "MOSTRAR MÁS"
        let expanded = true;
        while (expanded) {
          try {
            await page.click("button:has-text('MOSTRAR MÁS'), button:contains('+')");
            await new Promise(r => setTimeout(r, 500));
          } catch {
            expanded = false;
          }
        }
      } catch (e) {
        // Tab no existe, continuar
      }
    }

    // Extraer HTML completo
    const content = await page.content();
    const pageText = await page.evaluate(() => document.body.innerText);

    return {
      partNumber,
      url,
      success: true,
      htmlLength: content.length,
      content: pageText,
    };
  } catch (error) {
    return {
      partNumber,
      url,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    source: "Donaldson Shop (Dynamic Scrape)",
    products: [],
  };

  console.log("🔥 Scraping Donaldson Product Pages (with Dynamic Tabs)...\n");

  for (const part of PARTS_TO_SCRAPE) {
    console.log(`📄 ${part}...`);
    const data = await scrapePage(page, part);
    results.products.push(data);

    if (data.success) {
      console.log(`   ✅ ${data.htmlLength} bytes\n`);
    } else {
      console.log(`   ❌ ${data.error}\n`);
    }

    await new Promise(r => setTimeout(r, 2000)); // Rate limit
  }

  await browser.close();

  fs.writeFileSync("donaldson_dynamic_scrape.json", JSON.stringify(results, null, 2));
  console.log(`✅ Guardado: donaldson_dynamic_scrape.json`);
}

main().catch(console.error);
