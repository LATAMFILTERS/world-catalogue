const puppeteer = require("puppeteer");
const fs = require("fs");

// Mapeo DBL → URL directa (basado en lo que vimos)
const products = [
  { dbl: "DBL0832", url: "https://shop.donaldson.com/store/en-us/product/DBL0832/11887" },
  { dbl: "DBL3998", url: "https://shop.donaldson.com/store/en-us/product/DBL3998/11887" },
  { dbl: "DBL4560", url: "https://shop.donaldson.com/store/en-us/product/DBL4560/18796" },
  { dbl: "DBL7300", url: "https://shop.donaldson.com/store/en-us/product/DBL7300/18797" },
];

async function scrapeDirectTabs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const results = [];

  console.log("🔥 Scraping direct product URLs with tabs...\n");

  for (const product of products) {
    console.log("📄 " + product.dbl + "...");

    try {
      await page.goto(product.url, { waitUntil: "networkidle2", timeout: 15000 });

      const info = {
        dbl: product.dbl,
        url: product.url,
        tabs: {}
      };

      const tabNames = ["Attributes", "Specifications", "Alternate Parts", "Cross Reference", "Equipment"];

      for (const tabName of tabNames) {
        try {
          // Click tab por texto
          await page.evaluate((tab) => {
            const buttons = Array.from(document.querySelectorAll("button, a, [role='tab']"));
            const btn = buttons.find(b => 
              b.innerText.includes(tab) || b.textContent.includes(tab)
            );
            if (btn) btn.click();
          }, tabName);

          await new Promise(r => setTimeout(r, 1000));

          // Extraer contenido tab
          const content = await page.evaluate(() => {
            return document.body.innerText;
          });

          info.tabs[tabName] = content.substring(0, 3000); // Primeros 3000 chars

          console.log("   ✅ " + tabName);

        } catch (e) {
          console.log("   ⚠️  " + tabName);
        }

        await new Promise(r => setTimeout(r, 800));
      }

      results.push(info);
      console.log("   OK\n");

    } catch (e) {
      console.log("   ERROR: " + e.message + "\n");
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  fs.writeFileSync("donaldson_direct_tabs.json", JSON.stringify(results, null, 2));
  console.log("OK: donaldson_direct_tabs.json");
}

scrapeDirectTabs().catch(console.error);