const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeWithShowMore() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const products = [
    { dbl: "DBL0832", url: "https://shop.donaldson.com/store/en-us/product/DBL0832/11887" },
    { dbl: "DBL3998", url: "https://shop.donaldson.com/store/en-us/product/DBL3998/11887" },
    { dbl: "DBL4560", url: "https://shop.donaldson.com/store/en-us/product/DBL4560/18796" },
    { dbl: "DBL7300", url: "https://shop.donaldson.com/store/en-us/product/DBL7300/18797" },
  ];

  const results = [];

  console.log("🔥 Scraping with Show More clicks...\n");

  for (const product of products) {
    console.log("📄 " + product.dbl + "...");

    try {
      await page.goto(product.url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null);
      await new Promise(r => setTimeout(r, 2000));

      // Click "Show More" button
      await page.evaluate(() => {
        const btn = document.getElementById("showMoreProductSpecsButton") ||
                   Array.from(document.querySelectorAll("button")).find(b => 
                     b.textContent.includes("Show More")
                   );
        if (btn) btn.click();
      });

      await new Promise(r => setTimeout(r, 1500));

      // Extraer tabla de Attributes
      const specs = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll(".productAttrSection table tr"));
        const data = {};
        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 2) {
            const key = cells[0].innerText.trim();
            const value = cells[1].innerText.trim();
            data[key] = value;
          }
        });
        return data;
      });

      results.push({
        dbl: product.dbl,
        url: product.url,
        specs: specs,
      });

      console.log("   ✅ " + Object.keys(specs).length + " specs extracted\n");

    } catch (e) {
      console.log("   ERROR: " + e.message + "\n");
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  fs.writeFileSync("donaldson_specs_complete.json", JSON.stringify(results, null, 2));
  console.log("OK: donaldson_specs_complete.json");
  console.log(JSON.stringify(results, null, 2));
}

scrapeWithShowMore().catch(console.error);