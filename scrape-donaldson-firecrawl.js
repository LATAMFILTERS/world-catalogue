const https = require("https");
const fs = require("fs");

const API_KEY = "fc-a0a1e35f9850462ea71f42537cffcbc8";

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

async function scrape() {
  console.log("🔥 Scraping Donaldson lubricant filters...");

  const result = await postJSON("/v1/scrape", {
    url: "https://shop.donaldson.com/store/en-us/search?N=426772457&st=parts",
    formats: ["markdown"],
    waitFor: 3000,
  });

  if (!result.success) {
    console.error("Error:", result);
    return;
  }

  fs.writeFileSync("donaldson_catalog.md", result.data.markdown);
  console.log("✅ Guardado: donaldson_catalog.md");
  console.log("📊 Tamaño:", result.data.markdown.length, "bytes");
}

scrape().catch(console.error);