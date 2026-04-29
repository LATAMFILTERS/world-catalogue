const puppeteer = require("puppeteer");
const fs = require("fs");

async function extractDBLMapping() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";

  console.log(`🔥 Extracting DBL ↔ Part Number Mapping...\n`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

  // Scroll para cargar más productos
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 1500));
  }

  // Extraer todos los part numbers y DBL asociados
  const mapping = await page.evaluate(() => {
    const products = [];
    
    // Buscar cada fila de producto
    document.querySelectorAll("[class*='product'], .product-item, tr[class*='product']").forEach(row => {
      const partMatch = row.innerText.match(/P\d{6}/);
      const dblMatch = row.innerText.match(/DBL\d+/);
      const name = row.querySelector("h2, h3, .product-name, [class*='title']")?.innerText;
      
      if (partMatch) {
        products.push({
          part_number: partMatch[0],
          dbl: dblMatch ? dblMatch[0] : "NOT FOUND",
          name: name || row.innerText.substring(0, 100),
        });
      }
    });

    return products;
  });

  console.log(`Found ${mapping.length} products with DBL/Part mapping:\n`);
  mapping.forEach(p => {
    console.log(`  ${p.part_number} → ${p.dbl} (${p.name})`);
  });

  await browser.close();

  fs.writeFileSync("dbl_part_mapping.json", JSON.stringify(mapping, null, 2));
  console.log(`\n✅ Guardado: dbl_part_mapping.json`);
}

extractDBLMapping().catch(console.error);