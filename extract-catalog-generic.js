const puppeteer = require("puppeteer");
const fs = require("fs");

async function extract() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = "https://shop.donaldson.com/store/es-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";

  console.log(`🔥 Navigating...\n`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

  // Extraer TODO el texto visible
  const allText = await page.evaluate(() => {
    return document.body.innerText;
  });

  // Buscar all part numbers y DBL
  const parts = allText.match(/P\d{6}/g) || [];
  const dbls = allText.match(/DBL\d+/g) || [];

  console.log(`Found ${parts.length} parts: ${[...new Set(parts)].join(", ")}`);
  console.log(`Found ${dbls.length} DBLs: ${[...new Set(dbls)].join(", ")}\n`);

  fs.writeFileSync("found_parts_dbls.txt", `PARTS:\n${[...new Set(parts)].join("\n")}\n\nDBLs:\n${[...new Set(dbls)].join("\n")}`);

  await browser.close();
}

extract().catch(console.error);