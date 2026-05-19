const puppeteer = require("puppeteer");
const axios = require("axios");

const PARTS = [
  { part: "P169071", dbl: "DBL0832" },
  { part: "P173489", dbl: "DBL3998" },
  { part: "P502007", dbl: "DBL4560" },
  { part: "P502008", dbl: "DBL7300" },
];

// Primero, intentar usando la búsqueda en el catálogo
async function searchForProduct(partNumber) {
  console.log(`\n🔍 Buscando ${partNumber} en catálogo...`);

  try {
    // Usar la URL de búsqueda que sabemos que funciona
    const searchUrl = `https://shop.donaldson.com/store/en-us/search?Ntt=${partNumber}`;
    console.log(`   Buscando en: ${searchUrl}`);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Buscar enlace al producto en la respuesta
    const productLinkMatch = response.data.match(
      /href=['"]([^'"]*product[^'"]*\/P\d+[^'"]*)['"]|href=['"]([^'"]*\/${partNumber}[^'"]*)['"]/i
    );

    if (productLinkMatch) {
      const foundUrl = productLinkMatch[1] || productLinkMatch[2];
      console.log(`   ✅ URL encontrada: ${foundUrl}`);
      return foundUrl.startsWith('http') ? foundUrl : `https://shop.donaldson.com${foundUrl}`;
    } else {
      console.log(`   ❌ No se encontró enlace del producto`);

      // Mostrar qué URLs productN hay en la respuesta
      const urls = response.data.match(/href=['"]([^'"]*shop\.donaldson[^'"]*)['"]/g) || [];
      console.log(`   Primeras URLs encontradas:`);
      urls.slice(0, 3).forEach(u => console.log(`     - ${u}`));
    }
  } catch (error) {
    console.log(`   ❌ Error en búsqueda: ${error.message}`);
  }

  return null;
}

async function tryMultipleFormats(partNumber) {
  console.log(`\n📋 Probando múltiples formatos de URL para ${partNumber}...`);

  const formats = [
    `https://shop.donaldson.com/store/product/${partNumber}/`,
    `https://shop.donaldson.com/store/en-us/product/${partNumber}/`,
    `https://shop.donaldson.com/store/es-us/product/${partNumber}/`,
    `https://shop.donaldson.com/store/product/${partNumber}`,
    `https://shop.donaldson.com/store/en-us/product/${partNumber}`,
  ];

  for (const url of formats) {
    try {
      console.log(`   Intentando: ${url}`);
      const response = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 5000,
        maxRedirects: 5,
      });

      if (response.status === 200) {
        console.log(`   ✅ ¡Encontrada! Status ${response.status}`);
        return url;
      }
    } catch (error) {
      if (error.response?.status) {
        console.log(`   ❌ ${error.response.status}`);
      } else {
        console.log(`   ❌ ${error.code}`);
      }
    }
  }

  return null;
}

async function main() {
  console.log("🔥 ENCONTRANDO URLS DE PRODUCTOS DONALDSON\n");

  for (const { part, dbl } of PARTS) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Producto: ${dbl} (${part})`);
    console.log("=".repeat(60));

    // Intento 1: Búsqueda en catálogo
    const catalogUrl = await searchForProduct(part);

    // Intento 2: Múltiples formatos
    if (!catalogUrl) {
      const found = await tryMultipleFormats(part);
      if (found) {
        console.log(`\n✅ URL válida: ${found}`);
      }
    } else {
      console.log(`\n✅ URL desde catálogo: ${catalogUrl}`);
    }
  }
}

main().catch(console.error);
