const { Client } = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

// Detecta si un string parece año o modelo de vehículo (no un código de parte)
const YEAR_RE = /^\d{4}$/;
const MODEL_RE = /^[A-Z\s]{3,}\d{4}$/; // ej: "TOYOTA TUNDRA 2007"

function looksLikeVehicle(str) {
  if (YEAR_RE.test(str.trim())) return true;
  if (/\b(20|19)\d{2}\b/.test(str) && !/[A-Z]\d{4,}/.test(str)) return true;
  return false;
}

function normalizeItem(item) {
  if (!item) return null;

  if (typeof item === 'string') {
    const parts = item.split('|').map(s => s.trim());
    if (parts.length < 2) return null;
    const manufacturer = parts[0].toUpperCase();
    const code = parts[1].toUpperCase();
    if (!manufacturer || !code) return null;
    if (looksLikeVehicle(code)) return null; // descartar entradas tipo "TOYOTA | 2007"
    if (code.length < 2 || code.length > 80) return null;
    return { manufacturer, code };
  }

  if (typeof item === 'object') {
    const manufacturer = (item.manufacturer || item.brand || '').toUpperCase().trim();
    const code = (item.code || item.partNumber || '').toUpperCase().trim();
    if (!manufacturer || !code) return null;
    if (looksLikeVehicle(code)) return null;
    if (code.length < 2 || code.length > 80) return null;
    return { manufacturer, code };
  }

  return null;
}

function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const norm = normalizeItem(item);
    if (!norm) continue;
    const key = `${norm.manufacturer}|${norm.code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(norm);
  }
  return result;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Conectado\n');

  const { rows } = await client.query(`
    SELECT id, sku, oem_codes, competitor_codes
    FROM elimfilters_catalog
    ORDER BY sku
  `);

  console.log(`${rows.length} filtros a procesar...\n`);

  let updatedOem = 0, updatedComp = 0, unchanged = 0;

  for (const row of rows) {
    const oemRaw = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const compRaw = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];

    const oemNorm = normalizeArray(oemRaw);
    const compNorm = normalizeArray(compRaw);

    const oemChanged = JSON.stringify(oemNorm) !== JSON.stringify(oemRaw);
    const compChanged = JSON.stringify(compNorm) !== JSON.stringify(compRaw);

    if (!oemChanged && !compChanged) { unchanged++; continue; }

    await client.query(
      `UPDATE elimfilters_catalog SET oem_codes = $1::jsonb, competitor_codes = $2::jsonb WHERE id = $3`,
      [JSON.stringify(oemNorm), JSON.stringify(compNorm), row.id]
    );

    if (oemChanged) updatedOem++;
    if (compChanged) updatedComp++;

    if ((updatedOem + updatedComp) % 100 === 0)
      process.stdout.write(`  Procesados: ${updatedOem + updatedComp + unchanged}/${rows.length}\r`);
  }

  console.log(`\n\n=== RESULTADO ===`);
  console.log(`OEM codes normalizados:        ${updatedOem} filtros`);
  console.log(`Competitor codes normalizados: ${updatedComp} filtros`);
  console.log(`Sin cambios:                   ${unchanged} filtros`);
  console.log('\nNormalización completa.');

  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
