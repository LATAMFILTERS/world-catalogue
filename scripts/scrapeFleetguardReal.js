#!/usr/bin/env node

const puppeteer = require('puppeteer');
require('dotenv').config();

const FLEETGUARD_BASE = 'https://www.fleetguard.com';
const CATALOG_URL = `${FLEETGUARD_BASE}/category/products/0ZGPl0000000F8j4AE`;

async function scrapeProductPage(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const data = await page.evaluate(() => {
      const product = {};
      
      // SKU
      const h1 = document.querySelector('h1');
      const titleText = h1 ? h1.innerText : '';
      const skuMatch = titleText.match(/([A-Z]{2}\d+[A-Z]{0,2})/);
      product.sku = skuMatch ? skuMatch[1] : 'UNKNOWN';
      product.name = titleText;
      
      // Especificaciones
      product.specifications = {};
      
      // Buscar en tablas
      document.querySelectorAll('table tr').forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const key = cells[0].innerText.trim();
          const value = cells[1].innerText.trim();
          if (key && value && key.length < 100) {
            product.specifications[key] = value;
          }
        }
      });
      
      // Descripción
      const descParagraphs = document.querySelectorAll('p');
      product.description = '';
      descParagraphs.forEach(p => {
        const text = p.innerText.trim();
        if (text.length > 50 && !text.includes('log in')) {
          product.description += text + ' ';
        }
      });
      product.description = product.description.trim().substring(0, 500);
      
      return product;
    });
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function scrapeProductLinks(page, pageNum) {
  try {
    const url = `${CATALOG_URL}?page=${pageNum}`;
    console.log(`📄 Página ${pageNum}...`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const links = await page.evaluate(() => {
      const productLinks = [];
      document.querySelectorAll('a[href*="/product/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !productLinks.includes(href)) {
          productLinks.push(href.startsWith('http') ? href : `https://www.fleetguard.com${href}`);
        }
      });
      return productLinks;
    });
    
    console.log(`  ✅ ${links.length} productos encontrados`);
    return links;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return [];
  }
}

async function main() {
  const pages = parseInt(process.argv[2]) || 1;
  
  console.log(`\n🚀 Scraper Fleetguard Real`);
  console.log(`📍 Scrapeando ${pages} página(s)\n`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    
    const allProducts = [];
    const errors = [];
    
    for (let p = 1; p <= pages; p++) {
      try {
        const links = await scrapeProductLinks(page, p);
        
        for (const link of links) {
          try {
            console.log(`  📦 ${link.split('/').pop().substring(0, 20)}`);
            const result = await scrapeProductPage(page, link);
            
            if (result.success) {
              allProducts.push(result.data);
            } else {
              errors.push({ link, error: result.error });
            }
            
            await new Promise(r => setTimeout(r, 500));
          } catch (err) {
            errors.push({ link, error: err.message });
          }
        }
        
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Error en página ${p}:`, err.message);
      }
    }
    
    console.log(`\n✅ Scraping completado:`);
    console.log(`   • Productos: ${allProducts.length}`);
    console.log(`   • Errores: ${errors.length}`);
    
    // Guardar resultados
    const fs = require('fs');
    const dir = './scrape_reports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const file = `${dir}/fleetguard-real-${Date.now()}.json`;
    fs.writeFileSync(file, JSON.stringify({
      timestamp: new Date().toISOString(),
      total: allProducts.length,
      products: allProducts.slice(0, 100),
      sample: allProducts[0]
    }, null, 2));
    
    console.log(`\n💾 Datos guardados: ${file}`);
    
  } catch (err) {
    console.error('❌ Error fatal:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
