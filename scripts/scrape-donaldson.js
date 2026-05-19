/**
 * Donaldson Lubricant Filter Scraper
 * Usa Firecrawl para extraer catálogo de filtros de lubricante Donaldson
 *
 * Ejecutar: node scrape-donaldson.js
 * Requiere: npm install node-fetch
 */

const https = require("https");
const fs = require("fs");

const API_KEY = "fc-a0a1e35f9850462ea71f42537cffcbc8";
const BASE_URL = "https://api.firecrawl.dev";

const TARGET_URLS = [
  // Lubricant filters
  "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts",
  // Air filters
  "https://shop.donaldson.com/store/en-us/search?N=426772457+4294967187&st=parts",
];

// =====================
// Utilidad HTTP
// =====================
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
        } catch {
          resolve({ error: result });
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// =====================
// Scrape una página
// =====================
async function scrapePage(url) {
  console.log(`\n📄 Scraping: ${url}`);

  const result = await postJSON("/v1/scrape", {
    url: url,
    formats: ["markdown", "links"],
    waitFor: 3000,
    actions: [
      { type: "wait", milliseconds: 2000 }
    ]
  });

  if (!result.success) {
    console.error(`❌ Error: ${JSON.stringify(result)}`);
    return null;
  }

  return result.data;
}

// =====================
// Crawl múltiples páginas
// =====================
async function crawlDonaldson(startUrl, maxPages = 10) {
  console.log(`\n🔥 Crawling Donaldson: ${startUrl}`);
  console.log(`   Máximo páginas: ${maxPages}`);

  const result = await postJSON("/v1/crawl", {
    url: startUrl,
    limit: maxPages,
    maxDepth: 2,
    allowBackLinks: false,
    formats: ["markdown"],
    waitFor: 2000,
    includePaths: ["*/search*", "*/product*"],
  });

  if (!result.success) {
    console.error(`❌ Crawl error: ${JSON.stringify(result)}`);
    return null;
  }

  return result;
}

// =====================
// Parsear productos del markdown
// =====================
function parseProducts(markdown) {
  const products = [];

  // Buscar patrones de número de parte Donaldson (P + 6 dígitos)
  const partPattern = /P\d{6}/g;
  const parts = markdown.match(partPattern) || [];

  // Buscar patrones de filtros LF/AF (Lube Filter/Air Filter)
  const lfPattern = /\b(LF|AF|B|BT|P)\d{4,6}\b/g;
  const allParts = markdown.match(lfPattern) || [];

  // Extraer líneas con información de producto
  const lines = markdown.split("\n");
  let currentProduct = {};

  lines.forEach(line => {
    // Número de parte
    if (line.match(/^#{1,4}/)) {
      if (currentProduct.partNumber) {
        products.push({ ...currentProduct });
      }
      currentProduct = { name: line.replace(/^#+\s*/, "").trim() };
    }

    // Part number pattern
    const partMatch = line.match(/\b([PB][0-9]{5,6}|LF\d{4,6}|AF\d{4,6})\b/);
    if (partMatch) {
      currentProduct.partNumber = partMatch[1];
    }

    // Efficiency
    if (line.toLowerCase().includes("efficiency") || line.toLowerCase().includes("eficiencia")) {
      currentProduct.efficiency = line.trim();
    }

    // Micron
    if (line.toLowerCase().includes("micron") || line.match(/\d+\s*µm/)) {
      currentProduct.micron = line.trim();
    }

    // Temperature
    if (line.toLowerCase().includes("temperature") || line.toLowerCase().includes("°c") || line.toLowerCase().includes("°f")) {
      currentProduct.temperature = line.trim();
    }

    // Applications
    if (line.toLowerCase().includes("cummins") || line.toLowerCase().includes("caterpillar") ||
        line.toLowerCase().includes("john deere") || line.toLowerCase().includes("volvo")) {
      currentProduct.application = (currentProduct.application || "") + " " + line.trim();
    }
  });

  if (currentProduct.partNumber) products.push(currentProduct);

  return {
    products,
    rawPartNumbers: [...new Set(allParts)],
  };
}

// =====================
// Mapear vs ELIMFILTERS
// =====================
function mapToElimfilters(donaldsonData) {
  const mapping = {
    "PowerCore™": "MACROCORE™",
    "Synteq™": "SINTRAX™",
    "Synteq XP™": "NANOFORCE™",
    "Ultra-Web™": "NANOFORCE™",
    "DuraLite™": "DURATECH™",
    "EnduraFlo™": "SYNTEPORE™",
  };

  return {
    donaldson_technology: donaldsonData.technology || "N/A",
    elimfilters_equivalent: mapping[donaldsonData.technology] || "Review manual",
    note: "Equivalencia aproximada — verificar especificaciones exactas"
  };
}

// =====================
// Main
// =====================
async function main() {
  console.log("🔥 DONALDSON SCRAPER — ELIMFILTERS Competitive Analysis");
  console.log("=".repeat(60));

  const results = {
    scraped_at: new Date().toISOString(),
    source: "Donaldson Filters Catalog",
    pages: [],
    all_products: [],
    elimfilters_mapping: {}
  };

  for (const url of TARGET_URLS) {
    const data = await scrapePage(url);

    if (data) {
      const parsed = parseProducts(data.markdown || "");

      results.pages.push({
        url: url,
        title: data.metadata?.title || "N/A",
        markdown_length: (data.markdown || "").length,
        products_found: parsed.products.length,
        part_numbers: parsed.rawPartNumbers,
      });

      results.all_products.push(...parsed.products);

      console.log(`✅ Encontrados ${parsed.rawPartNumbers.length} part numbers`);
      console.log(`   Primeros: ${parsed.rawPartNumbers.slice(0, 5).join(", ")}`);

      // Guardar markdown raw
      const filename = `donaldson_${Date.now()}.md`;
      fs.writeFileSync(filename, data.markdown || "");
      console.log(`   Markdown guardado: ${filename}`);
    }

    // Rate limiting: 2 segundos entre requests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Guardar JSON resultado
  const outputFile = "donaldson_catalog.json";
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log(`✅ SCRAPING COMPLETO`);
  console.log(`   Páginas scraped: ${results.pages.length}`);
  console.log(`   Total productos: ${results.all_products.length}`);
  console.log(`   Resultado: ${outputFile}`);
}

main().catch(console.error);
