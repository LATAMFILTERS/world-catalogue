/**
 * CLEAN-CROSSREF.JS — Limpieza de cross-references inválidos
 *
 * Elimina:
 *  [1] Códigos con contaminación de tipo (OIL code en AIR filter, etc.)
 *  [2] Códigos duplicados que aparecen en filtros de tipos incompatibles
 *  [3] Códigos con longitud inválida (<3 o >30 chars)
 *
 * Conserva:
 *  - Duplicados legítimos (mismo código en OIL y LUBE = válido)
 *  - Todos los oem_codes (no se tocan)
 */

const { Client } = require('pg');
const fs = require('fs');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net', port: 18263, database: 'railway',
  user: 'postgres', password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

// Grupos de tipos compatibles (pueden compartir códigos)
const COMPATIBLE_GROUPS = [
  new Set(['OIL', 'LUBE']),
  new Set(['FUEL', 'FUEL_SEP', 'SEPARATOR']),
  new Set(['AIR', 'AIR_DRYER']),
];

function normalizeType(t) {
  if (!t) return 'UNKNOWN';
  const u = t.toUpperCase();
  if (u.includes('AIR') && u.includes('DRY')) return 'AIR_DRYER';
  if (u.includes('AIR') || u.includes('AIRE')) return 'AIR';
  if (u.includes('SEP')) return 'FUEL_SEP';
  if (u.includes('FUEL') || u.includes('COMBUSTIBLE')) return 'FUEL';
  if (u.includes('HYDR') || u.includes('HIDR')) return 'HYDRAULIC';
  if (u.includes('CABIN')) return 'CABIN';
  if (u.includes('OIL') || u.includes('LUBE') || u.includes('ACEITE')) return 'OIL';
  return u.split(/[\s\-_]/)[0];
}

function areCompatible(t1, t2) {
  const n1 = normalizeType(t1), n2 = normalizeType(t2);
  if (n1 === n2) return true;
  return COMPATIBLE_GROUPS.some(g => g.has(n1) && g.has(n2));
}

async function main() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Conectado. Cargando catálogo...\n');

  const { rows } = await client.query(`
    SELECT id, sku, filter_type, competitor_codes
    FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND competitor_codes != '[]'::jsonb
    ORDER BY sku
  `);

  console.log(`${rows.length} filtros con cross-references.\n`);

  // Paso 1: Construir índice de qué tipos usan cada código
  const codeTypeIndex = {}; // "MFR|CODE" → Set of filter_types
  for (const row of rows) {
    const comps = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const ftype = normalizeType(row.filter_type);
    for (const c of comps) {
      if (!c?.code || !c?.manufacturer) continue;
      const key = `${c.manufacturer.toUpperCase()}|${c.code.toUpperCase()}`;
      if (!codeTypeIndex[key]) codeTypeIndex[key] = new Set();
      codeTypeIndex[key].add(ftype);
    }
  }

  // Paso 2: Identificar códigos contaminados (usados en tipos incompatibles)
  const contaminatedCodes = new Set();
  for (const [key, types] of Object.entries(codeTypeIndex)) {
    const typeArr = [...types];
    for (let i = 0; i < typeArr.length; i++) {
      for (let j = i + 1; j < typeArr.length; j++) {
        if (!areCompatible(typeArr[i], typeArr[j])) {
          contaminatedCodes.add(key);
        }
      }
    }
  }
  console.log(`Códigos contaminados identificados: ${contaminatedCodes.size}`);

  // Paso 3: Limpiar cada filtro
  let totalRemoved = 0, rowsUpdated = 0;
  const log = [];

  for (const row of rows) {
    const comps = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const ftype = normalizeType(row.filter_type);

    const cleaned = comps.filter(c => {
      if (!c?.code || !c?.manufacturer) return false;
      const code = c.code.toUpperCase();
      const mfr  = c.manufacturer.toUpperCase();

      // Eliminar longitud inválida
      if (code.length < 3 || code.length > 30) return false;

      // Eliminar si es código contaminado Y este tipo es incompatible con alguno de los otros tipos que lo usan
      const key = `${mfr}|${code}`;
      if (contaminatedCodes.has(key)) {
        const typesForCode = [...(codeTypeIndex[key] || [])];
        // Comprobar si este filtro es de un tipo minoritario para este código
        const compatCount = typesForCode.filter(t => areCompatible(ftype, t)).length;
        const totalCount  = typesForCode.length;
        // Si la mayoría de usos de este código son incompatibles con este tipo, eliminar
        if (compatCount < totalCount / 2) {
          log.push(`REMOVE ${row.sku}(${ftype}) | ${mfr}|${code} [tipos: ${typesForCode.join(',')}]`);
          return false;
        }
      }
      return true;
    });

    const removed = comps.length - cleaned.length;
    if (removed > 0) {
      await client.query(
        `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE id = $2`,
        [JSON.stringify(cleaned), row.id]
      );
      totalRemoved += removed;
      rowsUpdated++;
    }
  }

  fs.writeFileSync('crossref-cleaned.txt', log.join('\n'), 'utf8');

  console.log(`\n═══════════════════════════════`);
  console.log(`LIMPIEZA COMPLETADA`);
  console.log(`Filas actualizadas:    ${rowsUpdated}`);
  console.log(`Códigos eliminados:    ${totalRemoved}`);
  console.log(`Log guardado en:       crossref-cleaned.txt`);
  console.log('═══════════════════════════════');

  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
