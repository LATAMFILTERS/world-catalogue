const puppeteer = require("puppeteer");
const fs = require("fs");

async function extractCatalogList() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = "https://shop.donaldson.com/store/es-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts&re...";

  console.log(`🔥 Extracting catalog list...\n`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[class*='product'], .product-item")).map(row => ({
      part: row.querySelector("a, [class*='part'], strong")?.innerText?.match(/P\d{6}/)?.[0],
      description: row.querySelector("[class*='desc'], h2, h3")?.innerText,
      fullText: row.innerText.substring(0, 300),
    })).filter(p => p.part);
  });

  console.log(JSON.stringify(products, null, 2));

  fs.writeFileSync("catalog_list.json", JSON.stringify(products, null, 2));
  await browser.close();
}

extractCatalogList().catch(console.error);