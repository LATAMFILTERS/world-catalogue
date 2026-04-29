const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeAllPages() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const baseUrl = "https://shop.donaldson.com/store/es-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";
  const allProducts = [];

  console.log("🔥 Scraping ALL pages...\n");

  for (let pageNum = 1; pageNum <= 18; pageNum++) {
    const url = pageNum === 1 ? baseUrl : baseUrl + "&Nrpp=20&iN=" + ((pageNum - 1) * 20);

    console.log("Page " + pageNum + "/18...");
    
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

      const pageText = await page.evaluate(() => document.body.innerText);
      
      const parts = pageText.match(/P\d{6}/g) || [];
      const dbls = pageText.match(/DBL\d+/g) || [];

      const partsSet = [...new Set(parts)];
      const dblsSet = [...new Set(dbls)];

      partsSet.forEach((part, idx) => {
        allProducts.push({
          page: pageNum,
          part_number: part,
          dbl: dblsSet[idx] || "NOT_FOUND",
        });
      });

      console.log("   OK: " + partsSet.length + " parts, " + dblsSet.length + " DBLs");

      await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
      console.log("   ERROR: " + e.message);
    }
  }

  await browser.close();

  console.log("\nTOTAL: " + allProducts.length + " products");

  fs.writeFileSync("donaldson_all_products.json", JSON.stringify(allProducts, null, 2));
  console.log("OK: donaldson_all_products.json");
}

scrapeAllPages().catch(console.error);