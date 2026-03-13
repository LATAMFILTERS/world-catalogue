#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE';

async function scrapeFirstPageAPI() {
  try {
    console.log('\n🚀 Descargando página de Fleetguard...');

    const response = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    });

    console.log(`✅ Página descargada (${response.status})\n`);
    return parseProducts(response.data);

  } catch (err) {
    console.error('❌ Error durante descarga:', err.message);
    process.exit(1);
  }
}

function parseProducts(html) {
  const $ = cheerio.load(html);
  const products = [];

  // Estrategia 1: Buscar por patrones de SKU en el HTML
  const skuPattern = /([A-Z]{2}\d{4,6}[A-Z]{0,2})/g;
  const matches = html.match(skuPattern) || [];
  const uniqueSkus = [...new Set(matches)];

  console.log(`📍 Encontrados ${uniqueSkus.length} SKUs potenciales`);
  console.log(`   Primeros: ${uniqueSkus.slice(0, 5).join(', ')}\n`);

  // Estrategia 2: Buscar enlaces y nombres de productos
  $('a').each((index, element) => {
    if (products.length >= 20) return false;

    const $link = $(element);
    const href = $link.attr('href');
    const text = $link.text().trim();

    if (href && text && (href.includes('/product/') || href.includes('products'))) {
      const sku = extractSKU(text);
      if (sku && !products.find(p => p.sku === sku)) {
        products.push({
          sku: sku,
          name: text,
          productUrl: href.startsWith('http') ? href : `https://www.fleetguard.com${href}`,
          index: products.length + 1
        });
      }
    }
  });

  // Si no encontró suficientes, agregar los SKUs únicos encontrados
  if (products.length < 10) {
    uniqueSkus.slice(0, 20).forEach(sku => {
      if (!products.find(p => p.sku === sku) && products.length < 20) {
        products.push({
          sku: sku,
          name: `Fleetguard ${sku}`,
          productUrl: `https://www.fleetguard.com/product/${sku}`,
          index: products.length + 1
        });
      }
    });
  }

  return products.slice(0, 20);
}

function extractSKU(text) {
  const match = text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
  return match ? match[1] : null;
}

async function saveToJSON(products) {
  const dir = './scrape_reports';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `fleetguard-real-page1-${Date.now()}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify({
    timestamp: new Date().toISOString(),
    page: 'Page 1',
    url: BASE_URL,
    total: products.length,
    products: products,
  }, null, 2));

  console.log(`💾 Datos guardados en: ${filepath}`);
  return filepath;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🔍 SCRAPER REAL FLEETGUARD - PÁGINA 1');
  console.log('═'.repeat(60));

  const products = await scrapeFirstPageAPI();

  if (products.length === 0) {
    console.error('❌ No se encontraron productos');
    process.exit(1);
  }

  console.log(`✅ ${products.length} productos encontrados:\n`);
  products.forEach(p => {
    console.log(`   ${p.index}. ${p.sku} - ${p.name}`);
  });

  await saveToJSON(products);
  console.log('\n✨ Proceso completado');
  process.exit(0);
}

main();
