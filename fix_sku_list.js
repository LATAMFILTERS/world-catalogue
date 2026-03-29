/**
 * fix_sku_list.js
 * 1. Filtra donaldson_sku_list.json — elimina codigos sucios (cross-refs, guiones, etc.)
 * 2. Elimina archivos JSON que tienen attrs pero crossRefs:0 para re-scrapear
 */

const fs   = require('fs');
const path = require('path');

const SKU_LIST = path.resolve(__dirname, 'donaldson_sku_list.json');
const DATA_DIR = 'E:\\ELIMFILTERS\\world-catalogue\\world-catalogue\\data\\donaldson_full_scrape';

// ── PASO 1: Limpiar lista de SKUs ──────────────────────────────────────────
if (!fs.existsSync(SKU_LIST)) {
    console.error('❌ No se encontro donaldson_sku_list.json en:', SKU_LIST);
    process.exit(1);
}

const all = JSON.parse(fs.readFileSync(SKU_LIST, 'utf8'));

// SKUs Donaldson validos: empiezan con 1-4 letras seguidas de digitos, sin guion en medio
// Ejemplos validos: P552100, EB1474, B76, DBA4071, HF6177
// Ejemplos invalidos: 115305-00005, LF3620, 1R1808, B7600-1
const valid = all.filter(s => {
    if (typeof s !== 'string') return false;
    const u = s.trim().toUpperCase();
    // Debe empezar con letra
    if (!/^[A-Z]/.test(u)) return false;
    // No debe contener guion (115305-00005, etc.)
    if (u.includes('-')) return false;
    // Debe tener al menos 2 caracteres
    if (u.length < 2) return false;
    // Patron: letras al inicio seguidas de digitos (P552100, EB1474, B76)
    if (!/^[A-Z]{1,4}\d{2,}/.test(u)) return false;
    return true;
});

console.log(`\nPASO 1 — Filtrar SKU list`);
console.log(`  Antes : ${all.length}`);
console.log(`  Despues: ${valid.length}`);
console.log(`  Eliminados: ${all.length - valid.length} codigos sucios\n`);

fs.writeFileSync(SKU_LIST, JSON.stringify(valid, null, 2));
console.log(`✅ donaldson_sku_list.json actualizado\n`);

// ── PASO 2: Eliminar archivos sin cross-refs para re-scrapear ──────────────
if (!fs.existsSync(DATA_DIR)) {
    console.log(`⚠️  DATA_DIR no existe (${DATA_DIR}), saltando paso 2`);
    process.exit(0);
}

console.log(`PASO 2 — Eliminar JSON sin cross-refs (para re-scrapear)`);
console.log(`  Directorio: ${DATA_DIR}`);

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
console.log(`  Archivos encontrados: ${files.length}`);

let deleted = 0, kept = 0, errors = 0;

for (const f of files) {
    try {
        const fp = path.join(DATA_DIR, f);
        const d  = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const hasAttrs    = Object.keys(d.attributes || {}).length > 0;
        const hasCrossRef = (d.crossReferences || []).length > 0;

        if (hasAttrs && !hasCrossRef) {
            fs.unlinkSync(fp);
            deleted++;
        } else {
            kept++;
        }
    } catch {
        errors++;
    }
}

console.log(`\n  Eliminados (attrs OK, crossRefs:0): ${deleted}`);
console.log(`  Conservados (tienen crossRefs):     ${kept}`);
console.log(`  Errores de lectura:                 ${errors}`);
console.log(`\n✅ Listo. Ahora corre: node donaldson_scraper_complete.js`);
