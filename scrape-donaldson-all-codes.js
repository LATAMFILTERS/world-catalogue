/**
 * Donaldson All Lube Filters Extractor
 * Usa Firecrawl LOCAL para extraer todos los ~5000 códigos de filtros
 *
 * Ejecutar: node scrape-donaldson-all-codes.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");

// Usar Firecrawl LOCAL (puerto 3002)
const FIRECRAWL_LOCAL = "http://localhost:3002";
const API_KEY = "test"; // LOCAL no requiere key, pero lo dejamos

const CATALOG_URL = "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts";

// =====================
// HTTP POST a Firecrawl
// =====================
function postToFirecrawl(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);

    // Usar http para localhost
    const protocol = FIRECRAWL_LOCAL.startsWith("https") ? https : http;
    const url = new URL(FIRECRAWL_LOCAL + path);

    const options = {
      hostname: url.hostname,
      port: url.port || 3002,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = protocol.request(options, (res) => {
      let result = "";
      res.on("data", (chunk) => { result += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          resolve({ error: result, status: res.statusCode });
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// =====================
// Extraer códigos del HTML/Markdown
// =====================
function extractCodes(content) {
  const codes = new Set();

  // Patrón DBL + 4 dígitos
  const dblMatches = content.match(/DBL\d{4}/g) || [];
  dblMatches.forEach(code => codes.add(code));

  // Patrón P + 6 dígitos
  const pMatches = content.match(/P\d{6}/g) || [];
  pMatches.forEach(code => codes.add(code));

  // Patrón LF + números (Lube Filter)
  const lfMatches = content.match(/LF\d{4,6}/g) || [];
  lfMatches.forEach(code => codes.add(code));

  return Array.from(codes);
}

// =====================
// Scrape página con Firecrawl LOCAL
// =====================
async function scrapePage(url, pageNumber = 1) {
  console.log(`\n📄 Scraping página ${pageNumber}...`);
  console.log(`   URL: ${url}`);

  try {
    const result = await postToFirecrawl("/v1/scrape", {
      url: url,
      formats: ["markdown", "html"],
      waitFor: 2000,
    });

    if (!result.success) {
      console.error(`   ❌ Error: ${result.error || JSON.stringify(result)}`);
      return null;
    }

    const content = result.data?.markdown || result.data?.html || "";
    const codes = extractCodes(content);

    console.log(`   ✅ ${codes.length} códigos encontrados`);
    console.log(`      Primeros: ${codes.slice(0, 5).join(", ")}`);

    return {
      pageNumber,
      url,
      codes,
      contentLength: content.length,
    };
  } catch (error) {
    console.error(`   ❌ Error en scrape: ${error.message}`);
    return null;
  }
}

// =====================
// Crawl todas las páginas
// =====================
async function crawlAllPages() {
  console.log("🔥 DONALDSON LUBE FILTERS EXTRACTOR");
  console.log("=".repeat(70));
  console.log(`Firecrawl LOCAL: ${FIRECRAWL_LOCAL}`);
  console.log(`Catálogo: ${CATALOG_URL}\n`);

  const allCodes = new Set();
  const pagesData = [];

  // Página 1 sin parámetro
  let pageNumber = 1;
  let hasMorePages = true;
  let consecutiveErrors = 0;

  while (hasMorePages && pageNumber <= 18) {
    // Construir URL con paginación
    let pageUrl = CATALOG_URL;
    if (pageNumber > 1) {
      // Donaldson usa ?pageNumber=X en algunas URLs
      pageUrl += `&pageNumber=${pageNumber}`;
    }

    const result = await scrapePage(pageUrl, pageNumber);

    if (result) {
      result.codes.forEach(code => allCodes.add(code));
      pagesData.push(result);
      consecutiveErrors = 0;

      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } else {
      consecutiveErrors++;
      if (consecutiveErrors >= 3) {
        console.log(`⚠️  3 errores consecutivos. Deteniendo.`);
        hasMorePages = false;
      }
    }

    pageNumber++;
  }

  // Resultado final
  console.log("\n" + "=".repeat(70));
  console.log("✅ EXTRACCIÓN COMPLETADA");
  console.log("=".repeat(70));
  console.log(`Páginas scrapeadas: ${pagesData.length}`);
  console.log(`Total códigos únicos: ${allCodes.size}`);
  console.log(`\nCódigos por tipo:`);

  const dblCodes = Array.from(allCodes).filter(c => c.startsWith("DBL")).length;
  const pCodes = Array.from(allCodes).filter(c => c.startsWith("P")).length;
  const lfCodes = Array.from(allCodes).filter(c => c.startsWith("LF")).length;

  console.log(`  DBL: ${dblCodes}`);
  console.log(`  P:   ${pCodes}`);
  console.log(`  LF:  ${lfCodes}`);

  // Guardar JSON
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    source: "Donaldson Catalog (Firecrawl LOCAL)",
    status: "extraction_complete",
    statistics: {
      pagesScraped: pagesData.length,
      totalUniqueCodes: allCodes.size,
      byType: {
        dbl: dblCodes,
        p: pCodes,
        lf: lfCodes,
      }
    },
    pages: pagesData,
    allCodes: Array.from(allCodes).sort(),
  };

  const outputFile = "donaldson_all_codes_output.json";
  fs.writeFileSync(outputFile, JSON.stringify(jsonOutput, null, 2));

  console.log(`\n📁 Guardado: ${outputFile}`);
  console.log(`\nPrimeros 20 códigos:`);
  console.log(Array.from(allCodes).sort().slice(0, 20).join(", "));

  return jsonOutput;
}

// =====================
// MAIN
// =====================
async function main() {
  try {
    // Verificar conexión a Firecrawl
    console.log("🔗 Verificando conexión a Firecrawl LOCAL...");

    const healthUrl = new URL("/health", FIRECRAWL_LOCAL);
    const healthCheck = await new Promise((resolve) => {
      const protocol = FIRECRAWL_LOCAL.startsWith("https") ? https : http;
      const req = protocol.get(healthUrl.toString(), (res) => {
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(5000);
    });

    if (!healthCheck) {
      console.log("⚠️  Firecrawl LOCAL no responde en " + FIRECRAWL_LOCAL);
      console.log("   Asegurate que esté corriendo:");
      console.log("   docker-compose up -d");
      process.exit(1);
    }

    console.log("✅ Firecrawl LOCAL está corriendo\n");

    // Extraer códigos
    await crawlAllPages();

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
