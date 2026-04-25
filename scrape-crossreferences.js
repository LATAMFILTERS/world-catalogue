require('dotenv').config();
const { Client } = require('pg');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const PROGRESS_FILE = path.join(__dirname, 'scraper-progress.json');

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      client_encoding: 'UTF8',
      ssl: { rejectUnauthorized: false }
    };

async function scrapeOilFilterCrossReferences(page, codigoBase) {
  console.log(`  Scraping Oil Filter Cross References for ${codigoBase}...`);
  try {
    await page.goto(`https://www.oilfilter-crossreference.com/convert/DONALDSON/${codigoBase}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const crossRefs = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const manufacturer = cells[0]?.textContent?.trim();
          const code = cells[1]?.textContent?.trim();
          if (manufacturer && code && manufacturer.toUpperCase() !== 'DONALDSON') {
            results.push({ code, manufacturer });
          }
        }
      });
      return results;
    });

    return crossRefs;
  } catch(e) {
    console.log(`    Error scraping: ${e.message}`);
    return [];
  }
}

async function scrapeAirFilterCrossReferences(page, codigoBase) {
  console.log(`  Scraping Air Filter Cross References for ${codigoBase}...`);
  try {
    await page.goto(`https://www.airfilter-crossreference.com/convert/DONALDSON/${codigoBase}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const crossRefs = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const manufacturer = cells[0]?.textContent?.trim();
          const code = cells[1]?.textContent?.trim();
          if (manufacturer && code && manufacturer.toUpperCase() !== 'DONALDSON') {
            results.push({ code, manufacturer });
          }
        }
      });
      return results;
    });

    return crossRefs;
  } catch(e) {
    console.log(`    Error scraping: ${e.message}`);
    return [];
  }
}

async function scrapeFuelFilterCrossReferences(page, codigoBase) {
  console.log(`  Scraping Fuel Filter Cross References for ${codigoBase}...`);
  try {
    await page.goto(`https://www.fuelfilter-crossreference.com/convert/DONALDSON/${codigoBase}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const crossRefs = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const manufacturer = cells[0]?.textContent?.trim();
          const code = cells[1]?.textContent?.trim();
          if (manufacturer && code && manufacturer.toUpperCase() !== 'DONALDSON') {
            results.push({ code, manufacturer });
          }
        }
      });
      return results;
    });

    return crossRefs;
  } catch(e) {
    console.log(`    Error scraping: ${e.message}`);
    return [];
  }
}

async function updateCompetitorCodes(client, sku, newCodes) {
  if (newCodes.length === 0) return;

  const jsonbArray = JSON.stringify(newCodes);

  try {
    const result = await client.query(
      `UPDATE elimfilters_catalog
       SET competitor_codes = $1::jsonb
       WHERE sku = $2
       RETURNING sku`,
      [jsonbArray, sku]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Updated ${sku}: added ${newCodes.length} competitor codes`);
    }
  } catch(e) {
    console.log(`❌ Error updating ${sku}: ${e.message}`);
  }
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch(e) {
    console.log(`⚠️  Could not load progress: ${e.message}`);
  }
  return { lastProcessedSku: null, totalProcessed: 0, skipped: 0 };
}

function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch(e) {
    console.log(`⚠️  Could not save progress: ${e.message}`);
  }
}

async function main() {
  const progress = loadProgress();

  if (progress.lastProcessedSku) {
    console.log(`🔍 Resuming scraper from ${progress.lastProcessedSku}...\n`);
    console.log(`Progress: ${progress.totalProcessed} processed, ${progress.skipped} skipped\n`);
  } else {
    console.log('🔍 Starting Cross Reference Scraper...\n');
  }

  const client = new Client(dbConfig);
  let browser;

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Obtener productos - continuar desde donde se quedó o desde el inicio
    let query = `
      SELECT sku, codigo_base, filter_type
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL
      AND filter_type IN ('Oil Filter', 'Hydraulic Filter', 'Air Filter', 'Cabin Air Filter', 'Air Housing', 'Air Dryer', 'Fuel Filter', 'Fuel/Water Separator')
      ORDER BY filter_type, sku
    `;

    const result = await client.query(query);

    // Filtrar SKUs ya procesados
    let skuList = result.rows;
    if (progress.lastProcessedSku) {
      const lastIdx = skuList.findIndex(r => r.sku === progress.lastProcessedSku);
      if (lastIdx >= 0) {
        skuList = skuList.slice(lastIdx + 1);
        console.log(`📦 Resuming with ${skuList.length} remaining products\n`);
      }
    } else {
      console.log(`📦 Found ${result.rows.length} products to scrape\n`);
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    for (const row of skuList) {
      const { sku, codigo_base, filter_type } = row;
      console.log(`\n📌 ${sku} (${filter_type}) - Base: ${codigo_base}`);

      let crossRefs = [];

      try {
        if (filter_type === 'Oil Filter' || filter_type === 'Hydraulic Filter') {
          crossRefs = await scrapeOilFilterCrossReferences(page, codigo_base);
        } else if (['Air Filter', 'Cabin Air Filter', 'Air Housing', 'Air Dryer'].includes(filter_type)) {
          crossRefs = await scrapeAirFilterCrossReferences(page, codigo_base);
        } else if (filter_type === 'Fuel Filter' || filter_type === 'Fuel/Water Separator') {
          crossRefs = await scrapeFuelFilterCrossReferences(page, codigo_base);
        }

        if (crossRefs.length > 0) {
          await updateCompetitorCodes(client, sku, crossRefs);
          progress.totalProcessed++;
        } else {
          console.log(`  ⚠️  No cross references found`);
          progress.skipped++;
        }
      } catch(e) {
        console.log(`  ❌ Error processing ${sku}: ${e.message}`);
        progress.skipped++;
      }

      // Guardar progreso después de cada SKU
      progress.lastProcessedSku = sku;
      progress.lastUpdateTime = new Date().toISOString();
      saveProgress(progress);

      // Esperar entre requests para no sobrecargar
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n✅ Scraping complete!');
    console.log(`Total processed: ${progress.totalProcessed}, Skipped: ${progress.skipped}`);

    // Limpiar progreso cuando termina
    if (skuList.length > 0) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('Progress file cleaned up.');
    }

  } catch(e) {
    console.error('❌ Fatal error:', e.message);
  } finally {
    if (browser) await browser.close();
    await client.end();
  }
}

main();
