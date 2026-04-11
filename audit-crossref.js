/**
 * AUDIT-CROSSREF.JS — Auditoría completa de cross-references
 *
 * Verificaciones:
 *  [A] Códigos duplicados entre distintos SKUs (mismo código en 2 filtros distintos)
 *  [B] Contaminación de tipo (código de OIL en AIR, etc.)
 *  [C] Patrones inválidos por fabricante conocido
 *  [D] Códigos muy cortos (<3 chars) o muy largos (>30 chars)
 *  [E] Fabricantes desconocidos / sospechosos
 *  [F] SKUs sin ningún cross-reference (gap de cobertura)
 */

const { Client } = require('pg');
const fs = require('fs');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net', port: 18263, database: 'railway',
  user: 'postgres', password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

// Patrones de formato válido por fabricante
const MFR_PATTERNS = {
  'FLEETGUARD':  /^(LF|AF|FF|HF|FS|WF|ST|SB|CC)\d{4,6}$/i,
  'BALDWIN':     /^(B|BF|PA|PF|PT|RS|LF|HD|BT|P[A-Z])\d{3,6}$/i,
  'WIX':         /^\d{4,6}[A-Z]?$/i,
  'MANN':        /^[A-Z]{1,3}\s?\d{3,5}[\/\-]?\d{0,3}[A-Z]?$/i,
  'FRAM':        /^(PH|XG|CA|CF|PS|CS|HP|TG|CH|P[A-Z]|G[A-Z])\d{3,6}[A-Z]?$/i,
  'DONALDSON':   /^(P|R|X|LF|FF|DF|HH|DBA|DBL)\d{4,7}$/i,
  'PUROLATOR':   /^(L|PL|ML|PER|F|A|C)\d{4,7}$/i,
  'RACOR':       /^(\d{3,4}(R|FH|MA|P[A-Z]?)|R\d{4,6})$/i,
  'PARKER':      /^(G\d|925|937|938|935)\d{3,6}$/i,
  'MAHLE':       /^(OC|OX|KC|KX|LX|LA|HX|W)\s?\d{3,5}[\/\-]?\d{0,3}[A-Z]?$/i,
  'CATERPILLAR': /^\d{7,10}$/i,
  'JOHN DEERE':  /^[A-Z]{2}\d{6,8}$/i,
};

// Tipos que NO deben compartir códigos entre sí
const INCOMPATIBLE_TYPES = [
  ['AIR', 'OIL'], ['AIR', 'FUEL'], ['AIR', 'HYDRAULIC'],
  ['FUEL', 'HYDRAULIC'], ['OIL', 'HYDRAULIC'],
  ['CABIN', 'OIL'], ['CABIN', 'FUEL'], ['CABIN', 'HYDRAULIC'],
];

function normalizeType(t) {
  if (!t) return 'UNKNOWN';
  const u = t.toUpperCase();
  if (u.includes('AIR') || u.includes('AIRE')) return 'AIR';
  if (u.includes('FUEL') || u.includes('COMBUSTIBLE')) return 'FUEL';
  if (u.includes('SEP')) return 'FUEL_SEP';
  if (u.includes('HYDR') || u.includes('HIDR')) return 'HYDRAULIC';
  if (u.includes('CABIN')) return 'CABIN';
  if (u.includes('OIL') || u.includes('LUBE') || u.includes('ACEITE')) return 'OIL';
  return u.split(/[\s\-_]/)[0];
}

function areIncompatible(t1, t2) {
  const n1 = normalizeType(t1), n2 = normalizeType(t2);
  return INCOMPATIBLE_TYPES.some(([a, b]) =>
    (n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))
  );
}

async function main() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Conectado. Cargando catálogo...\n');

  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes, competitor_codes
    FROM elimfilters_catalog
    ORDER BY sku
  `);
  await client.end();

  console.log(`${rows.length} filtros cargados.\n`);

  // Índice: competitor_code → [{sku, filter_type}]
  const compIndex = {};
  for (const row of rows) {
    const comps = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    for (const c of comps) {
      if (!c?.manufacturer || !c?.code) continue;
      const key = `${c.manufacturer.toUpperCase()}|${c.code.toUpperCase()}`;
      if (!compIndex[key]) compIndex[key] = [];
      compIndex[key].push({ sku: row.sku, filter_type: row.filter_type });
    }
  }

  const issues = [];
  const stats = {
    total_skus: rows.length,
    skus_with_comp: 0,
    skus_without_comp: 0,
    total_comp_codes: 0,
    duplicates: 0,
    type_contamination: 0,
    invalid_format: 0,
    invalid_length: 0,
    unknown_mfr: 0,
  };

  const mfrCoverage = {};
  const typeCoverage = {};

  for (const row of rows) {
    const comps = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const ftype = normalizeType(row.filter_type);

    if (comps.length === 0) { stats.skus_without_comp++; continue; }
    stats.skus_with_comp++;

    typeCoverage[ftype] = (typeCoverage[ftype] || { with: 0, without: 0 });
    typeCoverage[ftype].with++;

    for (const c of comps) {
      if (!c?.manufacturer || !c?.code) continue;
      const mfr = c.manufacturer.toUpperCase();
      const code = c.code.toUpperCase();
      stats.total_comp_codes++;

      mfrCoverage[mfr] = (mfrCoverage[mfr] || 0) + 1;

      // [D] Longitud
      if (code.length < 3 || code.length > 30) {
        stats.invalid_length++;
        issues.push(`[LONGITUD] ${row.sku} | ${mfr} | "${code}" (${code.length} chars)`);
      }

      // [C] Formato por fabricante
      const pattern = MFR_PATTERNS[mfr];
      if (pattern && !pattern.test(code)) {
        stats.invalid_format++;
        issues.push(`[FORMATO] ${row.sku} | ${mfr} | "${code}" (no cumple patrón)`);
      }

      // [E] Fabricante desconocido
      if (!MFR_PATTERNS[mfr] && mfr.length > 1) {
        stats.unknown_mfr++;
        // No loguear individualmente — solo contar
      }

      // [A] Duplicados entre SKUs distintos
      const key = `${mfr}|${code}`;
      const dupeList = compIndex[key] || [];
      if (dupeList.length > 1) {
        const others = dupeList.filter(d => d.sku !== row.sku);
        if (others.length > 0) {
          stats.duplicates++;
          // [B] Contaminación de tipo
          for (const other of others) {
            if (areIncompatible(row.filter_type, other.filter_type)) {
              stats.type_contamination++;
              issues.push(`[TIPO] ${row.sku}(${normalizeType(row.filter_type)}) vs ${other.sku}(${normalizeType(other.filter_type)}) | ${mfr}|${code}`);
            }
          }
        }
      }
    }
  }

  // Cobertura por tipo
  for (const row of rows) {
    const ftype = normalizeType(row.filter_type);
    typeCoverage[ftype] = typeCoverage[ftype] || { with: 0, without: 0 };
    const comps = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    if (comps.length === 0) typeCoverage[ftype].without++;
  }

  // Top fabricantes con más códigos
  const topMfr = Object.entries(mfrCoverage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Output
  console.log('═'.repeat(55));
  console.log('RESUMEN AUDITORÍA CROSS-REFERENCES');
  console.log('═'.repeat(55));
  console.log(`Total SKUs:                    ${stats.total_skus}`);
  console.log(`Con cross-references:          ${stats.skus_with_comp}`);
  console.log(`Sin cross-references:          ${stats.skus_without_comp}`);
  console.log(`Total códigos cross-ref:       ${stats.total_comp_codes}`);
  console.log(`Duplicados entre SKUs:         ${stats.duplicates}`);
  console.log(`Contaminación de tipo:         ${stats.type_contamination}`);
  console.log(`Formato inválido:              ${stats.invalid_format}`);
  console.log(`Longitud inválida:             ${stats.invalid_length}`);
  console.log(`Fabricantes desconocidos:      ${Object.keys(mfrCoverage).filter(m => !MFR_PATTERNS[m]).length} distintos`);

  console.log('\n── COBERTURA POR TIPO ──');
  for (const [type, counts] of Object.entries(typeCoverage).sort()) {
    const total = counts.with + counts.without;
    const pct = total ? ((counts.with / total) * 100).toFixed(1) : 0;
    console.log(`  ${type.padEnd(15)} ${String(counts.with).padStart(5)} / ${String(total).padStart(5)} (${pct}%)`);
  }

  console.log('\n── TOP 15 FABRICANTES EN CROSS-REF ──');
  topMfr.forEach(([m, n]) => console.log(`  ${m.padEnd(25)} ${n}`));

  // Guardar issues
  const issueLines = [
    `AUDITORÍA CROSS-REFERENCES — ${new Date().toISOString()}`,
    `Total problemas: ${issues.length}`,
    '',
    ...issues
  ];
  fs.writeFileSync('crossref-issues.txt', issueLines.join('\n'), 'utf8');
  console.log(`\n${issues.length} problemas guardados en crossref-issues.txt`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
