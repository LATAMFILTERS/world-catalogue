const puppeteer = require("puppeteer");
const fs = require("fs");

const products = [
  { dbl: "DBL0832", url: "https://shop.donaldson.com/store/en-us/product/DBL0832/11887" },
  { dbl: "DBL3998", url: "https://shop.donaldson.com/store/en-us/product/DBL3998/11887" },
  { dbl: "DBL4560", url: "https://shop.donaldson.com/store/en-us/product/DBL4560/18796" },
  { dbl: "DBL7300", url: "https://shop.donaldson.com/store/en-us/product/DBL7300/18797" },
];

async function scrapeResilient() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const results = [];

  console.log("🔥 Scraping with increased timeout...\n");

  for (const product of products) {
    console.log("📄 " + product.dbl + "...");

    try {
      await page.goto(product.url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null);

      await new Promise(r => setTimeout(r, 2000));

      const info = {
        dbl: product.dbl,
        url: product.url,
        tabs: {}
      };

      const tabNames = ["Attributes", "Specifications", "Alternate Parts", "Cross Reference", "Equipment"];

      for (const tabName of tabNames) {
        try {
          await page.evaluate((tab) => {
            const buttons = Array.from(document.querySelectorAll("button, a, [role='tab']"));
            const btn = buttons.find(b => 
              b.innerText.includes(tab) || b.textContent.includes(tab)
            );
            if (btn) btn.click();
          }, tabName);

          await new Promise(r => setTimeout(r, 1500));

          const content = await page.evaluate(() => document.body.innerText);
          info.tabs[tabName] = content.substring(0, 2000);

          console.log("   ✅ " + tabName);

        } catch (e) {
          console.log("   ⚠️  " + tabName);
        }

        await new Promise(r => setTimeout(r, 800));
      }

      results.push(info);
      console.log("   OK\n");

    } catch (e) {
      console.log("   SKIP: " + e.message + "\n");
      results.push({
        dbl: product.dbl,
        error: e.message
      });
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  fs.writeFileSync("donaldson_tabs_resilient.json", JSON.stringify(results, null, 2));
  console.log("OK: donaldson_tabs_resilient.json (" + results.length + " products)");
}

scrapeResilient().catch(console.error);