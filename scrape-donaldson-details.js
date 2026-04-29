const https = require("https");
const fs = require("fs");

const API_KEY = "fc-a0a1e35f9850462ea71f42537cffcbc8";
const parts = ["P169071", "P173489", "P502007", "P502008", "P502009", "P502015"];

function postJSON(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: "api.firecrawl.dev",
      path: path,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let result = "";
      res.on("data", (chunk) => { result += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          resolve({ error: result });
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function scrapeDetails() {
  const results = {
    timestamp: new Date().toISOString(),
    details: []
  };

  for (const part of parts) {
    console.log(`📄 Scraping ${part}...`);
    
    const result = await postJSON("/v1/scrape", {
      url: `https://shop.donaldson.com/store/product/${part}/`,
      formats: ["markdown"],
      waitFor: 2000,
    });

    if (result.success && result.data?.markdown) {
      results.details.push({
        part: part,
        markdown_length: result.data.markdown.length,
        preview: result.data.markdown.substring(0, 500),
      });
      console.log(`✅ ${part} scraped (${result.data.markdown.length} bytes)`);
    } else {
      console.log(`❌ Error: ${part}`);
    }

    await new Promise(r => setTimeout(r, 1500)); // Rate limit
  }

  fs.writeFileSync("donaldson_details.json", JSON.stringify(results, null, 2));
  console.log(`\n✅ Detalles guardados → donaldson_details.json`);
}

scrapeDetails().catch(console.error);