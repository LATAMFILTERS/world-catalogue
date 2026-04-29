const puppeteer = require("puppeteer");
const fs = require("fs");

const UNIQUE_PARTS = ["P169071", "P173489", "P502007", "P502008", "P502009", "P502015"];

async function scrapeSpecs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const specs = [];

  console.log("🔥 Scraping Technical Specs...\n");

  for (const part of UNIQUE_PARTS) {
    const url = "https://shop.donaldson.com/store/product/" + part + "/";

    console.log("📄 " + part + "...");

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("button, a")).find(el =>
          el.textContent.includes("Attributes")
        );
        if (btn) btn.click();
      });

      await new Promise(r => setTimeout(r, 2000));

      const allText = await page.evaluate(() => document.body.innerText);

      specs.push({
        part_number: part,
        url: url,
        full_text: allText,
      });

      console.log("   OK");

    } catch (e) {
      console.log("   ERROR: " + e.message);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();

  fs.writeFileSync("donaldson_specs_raw.json", JSON.stringify(specs, null, 2));
  console.log("\nOK: donaldson_specs_raw.json");
}

scrapeSpecs().catch(console.error);