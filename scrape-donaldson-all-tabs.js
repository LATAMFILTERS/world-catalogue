const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeWithTabs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const dblCodes = ["DBL0832", "DBL3998", "DBL4560", "DBL7300"];

  const allProducts = [];

  console.log("🔥 Scraping products with ALL tabs...\n");

  for (const dbl of dblCodes) {
    console.log("📄 " + dbl + "...");

    try {
      const url = "https://shop.donaldson.com/store/en-us/search?st=products&keywords=" + dbl;
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

      // Click primer resultado
      await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll("a")).find(a =>
          a.textContent.includes(dbl) && a.href.includes("/product/")
        );
        if (link) link.click();
      });

      await new Promise(r => setTimeout(r, 2000));

      const productInfo = {
        dbl: dbl,
        url: page.url(),
        tabs: {}
      };

      // Clickear cada tab y extraer
      const tabNames = ["Attributes", "Specifications", "Alternate Parts", "Cross Reference", "Equipment"];

      for (const tabName of tabNames) {
        try {
          // Click tab
          await page.evaluate((tab) => {
            const btn = Array.from(document.querySelectorAll("button, a, div[role='tab']")).find(el =>
              el.textContent.trim() === tab || el.textContent.includes(tab)
            );
            if (btn) btn.click();
          }, tabName);

          await new Promise(r => setTimeout(r, 1500));

          // Extraer contenido
          const content = await page.evaluate(() => document.body.innerText);
          productInfo.tabs[tabName] = content;

          console.log("   ✅ " + tabName);

        } catch (e) {
          console.log("   ⚠️  " + tabName + " (not found)");
        }
      }

      allProducts.push(productInfo);
      console.log("   OK\n");

      // Volver a búsqueda
      await page.goBack({ waitUntil: "networkidle2", timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));

    } catch (e) {
      console.log("   ERROR: " + e.message + "\n");
    }
  }

  await browser.close();

  fs.writeFileSync("donaldson_all_tabs_content.json", JSON.stringify(allProducts, null, 2));
  console.log("OK: donaldson_all_tabs_content.json");
}

scrapeWithTabs().catch(console.error);