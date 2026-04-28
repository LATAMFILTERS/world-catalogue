const puppeteer = require("puppeteer");
const fs = require("fs");

// Productos a scrapear
const PRODUCTS = [
  { part: "P169071", dbl: "DBL0832" },
  { part: "P173489", dbl: "DBL3998" },
  { part: "P502007", dbl: "DBL4560" },
  { part: "P502008", dbl: "DBL7300" },
];

async function scrapeProduct(browser, part, dbl) {
  const page = await browser.newPage();

  // Ignorar errores HTTPS/SSL
  await page.setDefaultNavigationTimeout(20000);
  await page.setDefaultTimeout(20000);

  // Agregar ignorar errores HTTP inseguros
  try {
    // Nota: ignoreHTTPSErrors debe ser configurado en el contexto del navegador
    // Alternativa: usar evaluateOnNewDocument
    await page.evaluateOnNewDocument(() => {
      // Esto se ejecuta antes de que se cargue la página
    });
  } catch (e) {
    // Ignorar si falla
  }

  const result = {
    part,
    dbl,
    url: null,
    success: false,
    steps: [],
    specs: {},
    error: null,
  };

  try {
    // Construir URL
    const url = `https://shop.donaldson.com/store/product/${part}/`;
    result.url = url;
    result.steps.push(`Navegando a: ${url}`);
    console.log(`\n📄 [${dbl}] Navegando...`);

    // Navegar con ignoreHTTPSErrors
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      result.steps.push("✅ Página cargada");
    } catch (e) {
      result.steps.push(`⚠️ Navegación parcial: ${e.message}`);
      console.log(`   ⚠️  Navegación incompleta, continuando...`);
      // Continuar de todas formas
    }

    // Esperar 2 segundos
    await new Promise(r => setTimeout(r, 2000));
    result.steps.push("✅ Espera de 2s completada");

    // ===== DIAGNOSTICS: Verificar qué elementos existen =====
    const pageInfo = await page.evaluate(() => {
      const info = {
        pageTitle: document.title,
        pageUrl: window.location.href,
        elementsFound: {}
      };

      // Buscar elementos específicos
      info.elementsFound.showMoreButton = {
        byId: !!document.getElementById("showMoreProductSpecsButton"),
        allButtons: Array.from(document.querySelectorAll("button")).map(b => ({
          text: b.textContent.trim(),
          id: b.id,
          class: b.className
        })).slice(0, 10),
      };

      info.elementsFound.specTable = {
        productAttrSection: !!document.querySelector(".productAttrSection table"),
        specTable: !!document.querySelector(".spec-table"),
        specTableRows: document.querySelectorAll(".productAttrSection table tr").length,
        allTableRows: document.querySelectorAll("table tr").length,
      };

      info.elementsFound.hiddenContent = {
        hiddenByStyle: document.querySelectorAll('[style*="display: none"]').length,
        collapsedSections: document.querySelectorAll('[style*="visibility: hidden"]').length,
      };

      // Buscar contenido escondido en tablas
      const hiddenRows = Array.from(document.querySelectorAll('tr[style*="display: none"]')).length;
      info.elementsFound.hiddenTableRows = hiddenRows;

      return info;
    });

    result.steps.push(`Diagnostics: ${JSON.stringify(pageInfo.elementsFound)}`);
    console.log(`   📊 Diagnostics:`, JSON.stringify(pageInfo.elementsFound, null, 2));

    // ===== INTENTO 1: Buscar y clickear "Show More" por ID =====
    console.log(`   🔍 Intentando clickear Show More...`);
    let clickedShowMore = false;

    try {
      const showMoreExists = await page.evaluate(() => {
        return !!document.getElementById("showMoreProductSpecsButton");
      });

      if (showMoreExists) {
        result.steps.push("✅ Show More button encontrado por ID");
        console.log(`   ✅ Show More button encontrado`);

        // Hacer scroll a la vista
        await page.evaluate(() => {
          document.getElementById("showMoreProductSpecsButton").scrollIntoView({ behavior: 'smooth' });
        });

        await new Promise(r => setTimeout(r, 500));

        // Clickear
        await page.click("#showMoreProductSpecsButton");
        result.steps.push("✅ Click en Show More realizado");
        console.log(`   ✅ Click realizado`);

        clickedShowMore = true;
      } else {
        result.steps.push("❌ Show More button NO encontrado por ID");
        console.log(`   ❌ Show More button no encontrado por ID`);
      }
    } catch (e) {
      result.steps.push(`⚠️ Error clickeando Show More: ${e.message}`);
      console.log(`   ⚠️ Error: ${e.message}`);
    }

    // Esperar a que se revele el contenido
    if (clickedShowMore) {
      await new Promise(r => setTimeout(r, 1500));
      result.steps.push("✅ Espera de 1.5s post-click");
    }

    // ===== INTENTO 2: Extraer specs de la tabla =====
    console.log(`   📋 Extrayendo specs...`);

    const specs = await page.evaluate(() => {
      const extracted = {};

      // Buscar la tabla
      const table = document.querySelector(".productAttrSection table");
      if (!table) {
        return { _error: "No table found in .productAttrSection" };
      }

      // Extraer todas las filas
      const rows = table.querySelectorAll("tr");
      if (rows.length === 0) {
        return { _error: "No rows found in table" };
      }

      rows.forEach((row, idx) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (key && value) {
            extracted[key] = value;
          }
        }
      });

      return extracted;
    });

    result.specs = specs;
    const specCount = Object.keys(specs).length;
    result.steps.push(`✅ ${specCount} specs extraídas`);
    console.log(`   ✅ ${specCount} specs extraídas`);

    if (specCount === 0) {
      // Mostrar todo el HTML para diagnosticar
      const html = await page.content();
      if (html.includes("showMoreProductSpecsButton")) {
        result.steps.push("⚠️ Button HTML present pero table no tiene rows");
      }
    }

    result.success = specCount > 0;

  } catch (error) {
    result.error = error.message;
    result.steps.push(`❌ Error principal: ${error.message}`);
    console.log(`   ❌ Error: ${error.message}`);
  } finally {
    await page.close();
  }

  return result;
}

async function main() {
  console.log("🔥 DONALDSON SCRAPER — DEBUG MODE\n");
  console.log("=".repeat(70));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });
  const results = {
    timestamp: new Date().toISOString(),
    source: "Donaldson Shop (Debug)",
    products: [],
  };

  for (const { part, dbl } of PRODUCTS) {
    const data = await scrapeProduct(browser, part, dbl);
    results.products.push(data);

    console.log(`\n   📊 RESULTADO [${dbl}]:`);
    console.log(`       Success: ${data.success}`);
    console.log(`       Specs: ${Object.keys(data.specs).length}`);
    if (data.error) {
      console.log(`       Error: ${data.error}`);
    }

    await new Promise(r => setTimeout(r, 2000)); // Rate limit
  }

  await browser.close();

  // Guardar resultados
  fs.writeFileSync("donaldson_debug_output.json", JSON.stringify(results, null, 2));
  console.log(`\n${"=".repeat(70)}`);
  console.log("✅ Guardado: donaldson_debug_output.json");
  console.log(`\n📊 Resumen:`);
  results.products.forEach(p => {
    const specs = Object.keys(p.specs).length;
    const status = p.success ? "✅" : "❌";
    console.log(`   ${status} ${p.dbl}: ${specs} specs`);
  });
}

main().catch(console.error);
