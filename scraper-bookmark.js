// 📌 BOOKMARKLET PARA FLEETGUARD - COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR

javascript:(async()=>{
  console.log('🚀 Extrayendo 20 productos de Fleetguard...');

  const products = [];
  const seen = new Set();

  // Estrategia 1: Buscar en texto
  const pageText = document.body.innerText;
  const skuPattern = /([A-Z]{2}\d{4,6}[A-Z]{0,2})/g;
  const matches = pageText.match(skuPattern) || [];

  matches.forEach(sku => {
    if (!seen.has(sku) && products.length < 20) {
      seen.add(sku);
      products.push({sku, name: `Fleetguard ${sku}`});
    }
  });

  // Estrategia 2: Buscar en enlaces
  document.querySelectorAll('a').forEach(link => {
    if (products.length >= 20) return;
    const text = link.innerText.trim();
    const match = text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
    if (match && !seen.has(match[1])) {
      seen.add(match[1]);
      products.push({
        sku: match[1],
        name: text,
        url: link.href
      });
    }
  });

  console.log(`✅ Encontrados ${products.length} productos`);
  console.table(products);

  // Descargar JSON
  const data = {
    timestamp: new Date().toISOString(),
    total: products.length,
    products: products
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fleetguard-${Date.now()}.json`;
  a.click();

  console.log('✨ JSON descargado: fleetguard-' + Date.now() + '.json');
})();
