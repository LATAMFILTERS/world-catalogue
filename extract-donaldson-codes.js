/**
 * DONALDSON LUBE FILTER EXTRACTOR
 * Ejecutar en: DevTools Console (F12) en https://shop.donaldson.com/store/en-us/search?N=426772457&...
 *
 * El script extrae todos los códigos de productos de las 18 páginas automáticamente
 */

(async function extractAllProducts() {
  console.log("🔥 INICIANDO EXTRACCIÓN DE CÓDIGOS DONALDSON...\n");

  const allProducts = [];
  let currentPage = 1;
  const maxPages = 18;

  async function extractCurrentPage() {
    console.log(`📄 Extrayendo página ${currentPage}...`);

    // Múltiples formas de encontrar códigos en el HTML
    const pageHtml = document.documentElement.outerHTML;

    // Buscar patrones de código: P + 6 dígitos
    const pCodeMatches = pageHtml.match(/P\d{6}/g) || [];

    // Buscar patrones de código: DBL + 4 dígitos
    const dblCodeMatches = pageHtml.match(/DBL\d{4}/g) || [];

    // Extraer de elementos visibles (más confiable)
    const productElements = document.querySelectorAll(
      '[data-product-id], [data-sku], .product-item, .productTitle, .productName, [class*="product"]'
    );

    const visibleCodes = new Set();
    productElements.forEach(el => {
      const text = el.textContent || el.innerHTML;
      const matches = text.match(/P\d{6}|DBL\d{4}/g) || [];
      matches.forEach(code => visibleCodes.add(code));
    });

    // Combinar todos los códigos encontrados
    const pageCodes = [...new Set([
      ...pCodeMatches,
      ...dblCodeMatches,
      ...Array.from(visibleCodes)
    ])];

    console.log(`   ✅ Encontrados ${pageCodes.length} códigos`);
    pageCodes.forEach(code => {
      allProducts.push({
        code: code,
        page: currentPage,
        type: code.startsWith('P') ? 'P-number' : 'DBL-code'
      });
    });

    // Log de los códigos de esta página
    console.log(`   Códigos: ${pageCodes.join(', ')}\n`);

    return pageCodes.length > 0;
  }

  // Extraer página 1
  await extractCurrentPage();

  // Navegar por las páginas restantes
  while (currentPage < maxPages) {
    // Buscar el botón "siguiente" o link a la siguiente página
    const nextButton = document.querySelector(
      'a[rel="next"], .next, [aria-label*="next"], [title*="next"], .pagination a:last-child'
    );

    const pageLinks = Array.from(document.querySelectorAll('a')).filter(a => {
      const text = a.textContent.trim();
      return text === String(currentPage + 1) || a.getAttribute('data-page') === String(currentPage + 1);
    });

    let navigated = false;

    if (nextButton && nextButton.href) {
      console.log(`🔗 Navegando a página ${currentPage + 1}...`);
      window.location.href = nextButton.href;
      navigated = true;
    } else if (pageLinks.length > 0) {
      console.log(`🔗 Navegando a página ${currentPage + 1}...`);
      pageLinks[0].click();
      navigated = true;
    }

    if (!navigated) {
      console.log(`⚠️  No se encontró botón "siguiente". Deteniendo en página ${currentPage}`);
      break;
    }

    currentPage++;

    // Esperar a que cargue la siguiente página
    await new Promise(resolve => setTimeout(resolve, 3000));
    await extractCurrentPage();
  }

  // Resultado final
  console.log("\n" + "=".repeat(60));
  console.log("✅ EXTRACCIÓN COMPLETADA");
  console.log("=".repeat(60));
  console.log(`Total de códigos únicos: ${new Set(allProducts.map(p => p.code)).size}`);
  console.log(`Total de registros (con páginas): ${allProducts.length}\n`);

  // Crear JSON
  const jsonData = {
    timestamp: new Date().toISOString(),
    source: "Donaldson Shop - Manual Extraction",
    totalPages: currentPage,
    totalCodes: allProducts.length,
    uniqueCodes: Array.from(new Set(allProducts.map(p => p.code))).length,
    products: allProducts,
    uniqueProductsList: Array.from(new Set(allProducts.map(p => p.code)))
  };

  // Mostrar en consola
  console.log("📋 RESULTADOS FINALES:");
  console.log(JSON.stringify(jsonData, null, 2));

  // Descargar como archivo
  const dataStr = JSON.stringify(jsonData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `donaldson_codes_${new Date().toISOString().split('T')[0]}.json`;

  console.log("\n📥 Descargando archivo...");
  link.click();
  console.log("✅ Archivo descargado: donaldson_codes_" + new Date().toISOString().split('T')[0] + ".json");
})();
