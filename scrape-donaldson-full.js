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

// Parser para extraer specs técnicas
function parseSpecs(markdown) {
  const specs = {
    micron: null,
    efficiency: null,
    pressure: null,
    temperature: null,
    oem: [],
    duty: "UNKNOWN",
  };

  // Micron/micronaje
  const micronMatch = markdown.match(/(\d+)\s*(?:micron|µm|micra)/gi);
  if (micronMatch) specs.micron = micronMatch[0];

  // Eficiencia
  const effMatch = markdown.match(/(\d+(?:\.\d+)?)\s*%/g);
  if (effMatch) specs.efficiency = effMatch[0];

  // Presión (PSI o kPa)
  const pressMatch = markdown.match(/(\d+)\s*(?:PSI|kPa|bar)/i);
  if (pressMatch) specs.pressure = pressMatch[0];

  // Temperatura
  const tempMatch = markdown.match(/(-?\d+)\s*°?(?:C|F)/i);
  if (tempMatch) specs.temperature = tempMatch[0];

  // OEM: Cummins, CAT, Volvo, John Deere, Mack, Detroit, Navistar
  const oems = ["Cummins", "Caterpillar", "CAT", "Volvo", "John Deere", "Mack", "Detroit", "Navistar"];
  oems.forEach(oem => {
    if (markdown.toUpperCase().includes(oem.toUpperCase())) {
      specs.oem.push(oem);
    }
  });

  // Detectar duty: Heavy-Duty o Light-Duty
  if (markdown.toUpperCase().includes("HEAVY") || markdown.toUpperCase().includes("HD") || markdown.toUpperCase().includes("CLASS 8")) {
    specs.duty = "HD";
  } else if (markdown.toUpperCase().includes("LIGHT") || markdown.toUpperCase().includes("LD") || markdown.toUpperCase().includes("PASSENGER")) {
    specs.duty = "LD";
  } else {
    // Heurística: si presión > 30 PSI → probablemente HD
    if (specs.pressure && parseInt(specs.pressure) > 30) {
      specs.duty = "HD";
    }
  }

  return specs;
}

async function scrapeCatalog() {
  console.log("🔥 Scraping Donaldson Catalog (FULL with Specs)...\n");

  const result = await postJSON("/v1/scrape", {
    url: "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts",
    formats: ["markdown"],
    waitFor: 3000,
  });

  if (!result.success) {
    console.error("❌ Error:", result);
    return;
  }

  const markdown = result.data.markdown;
  const lines = markdown.split("\n");
  const products = [];

  let currentProduct = {};

  lines.forEach((line, i) => {
    // Detectar part number (P + 6 dígitos)
    const partMatch = line.match(/\b(P\d{6})\b/);
    
    if (partMatch) {
      // Si hay producto anterior, guardarlo
      if (currentProduct.partNumber && currentProduct.partNumber !== partMatch[1]) {
        products.push(currentProduct);
      }

      currentProduct = {
        partNumber: partMatch[1],
        name: line.trim(),
        context: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(" "),
        specs: {},
      };
    }

    // Extraer líneas con información técnica
    if (line.includes("SPIN-ON") || line.includes("CARTRIDGE") || line.includes("FILTER")) {
      if (!currentProduct.filterType) {
        currentProduct.filterType = line.trim();
      }
    }
  });

  // Procesar specs de cada producto
  products.forEach(product => {
    product.specs = parseSpecs(product.context);
  });

  // Guardar output
  const output = {
    timestamp: new Date().toISOString(),
    source: "Donaldson Shop Catalog",
    catalog_url: "https://shop.donaldson.com/store/en-us/search?N=426772457&st=parts",
    total_products: products.length,
    products: products,
  };

  fs.writeFileSync("donaldson_catalog_full.json", JSON.stringify(output, null, 2));

  console.log(`✅ ${products.length} productos scraped`);
  console.log(`📊 Guardado: donaldson_catalog_full.json\n`);

  // Resumen por duty
  const hdCount = products.filter(p => p.specs.duty === "HD").length;
  const ldCount = products.filter(p => p.specs.duty === "LD").length;
  const unknownCount = products.filter(p => p.specs.duty === "UNKNOWN").length;

  console.log(`📈 DUTY BREAKDOWN:`);
  console.log(`   HD (Heavy-Duty): ${hdCount}`);
  console.log(`   LD (Light-Duty): ${ldCount}`);
  console.log(`   UNKNOWN: ${unknownCount}`);
}

scrapeCatalog().catch(console.error);