const { Client } = require('pg');
const fs = require('fs');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

function normalizeCode(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    const parts = item.split('|').map(s => s.trim());
    if (parts.length >= 2) return { manufacturer: parts[0].toUpperCase(), code: parts[1].toUpperCase() };
    return null;
  }
  const mfr = (item.manufacturer || item.brand || '').toUpperCase().trim();
  const code = (item.code || item.partNumber || '').toUpperCase().trim();
  if (mfr && code) return { manufacturer: mfr, code };
  return null;
}

async function main() {
  const client = new Client(dbConfig);
  await client.connect();

  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes, competitor_codes
    FROM elimfilters_catalog
    ORDER BY filter_type, sku
  `);

  const issues = [];
  const stats = {
    total: rows.length,
    withOem: 0,
    withCompetitor: 0,
    emptyOem: 0,
    emptyCompetitor: 0,
    badFormatOem: 0,
    badFormatCompetitor: 0,
    duplicateCodes: 0,
  };

  const report = [];

  for (const row of rows) {
    const oemRaw = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const compRaw = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];

    const oem = oemRaw.map(normalizeCode).filter(Boolean);
    const comp = compRaw.map(normalizeCode).filter(Boolean);
    const badOem = oemRaw.length - oem.length;
    const badComp = compRaw.length - comp.length;

    if (oem.length > 0) stats.withOem++; else stats.emptyOem++;
    if (comp.length > 0) stats.withCompetitor++; else stats.emptyCompetitor++;
    if (badOem > 0) stats.badFormatOem++;
    if (badComp > 0) stats.badFormatCompetitor++;

    // Detectar duplicados en competitor_codes
    const compKeys = comp.map(c => `${c.manufacturer}|${c.code}`);
    const uniqueKeys = new Set(compKeys);
    if (uniqueKeys.size < compKeys.length) {
      stats.duplicateCodes++;
      issues.push(`DUPLICADO ${row.sku}: ${compKeys.length - uniqueKeys.size} entradas duplicadas en competitor_codes`);
    }

    // Detectar códigos sospechosos (muy cortos < 2 chars, o con caracteres extraños)
    for (const c of [...oem, ...comp]) {
      if (c.code.length < 2) {
        issues.push(`CÓDIGO CORTO ${row.sku}: "${c.manufacturer}" | "${c.code}"`);
      }
      if (/[<>{}]/.test(c.code)) {
        issues.push(`CÓDIGO EXTRAÑO ${row.sku}: "${c.manufacturer}" | "${c.code}"`);
      }
    }

    // Detectar entradas en formato incorrecto (no normalizables)
    if (badOem > 0 || badComp > 0) {
      const rawBad = [
        ...oemRaw.filter(i => !normalizeCode(i)).map(i => 'OEM: ' + JSON.stringify(i)),
        ...compRaw.filter(i => !normalizeCode(i)).map(i => 'COMP: ' + JSON.stringify(i))
      ];
      issues.push(`FORMATO INVÁLIDO ${row.sku}: ${rawBad.join(' | ')}`);
    }

    report.push({
      sku: row.sku,
      type: row.filter_type,
      oem_count: oem.length,
      comp_count: comp.length,
      bad_oem: badOem,
      bad_comp: badComp,
      sample_oem: oem.slice(0, 2).map(c => `${c.manufacturer}|${c.code}`).join(', '),
      sample_comp: comp.slice(0, 2).map(c => `${c.manufacturer}|${c.code}`).join(', '),
    });
  }

  // Escribir reporte CSV
  const csv = [
    'SKU,Tipo,OEM#,Comp#,BadOEM,BadComp,MuestraOEM,MuestraComp',
    ...report.map(r =>
      `"${r.sku}","${r.type}",${r.oem_count},${r.comp_count},${r.bad_oem},${r.bad_comp},"${r.sample_oem}","${r.sample_comp}"`
    )
  ].join('\n');
  fs.writeFileSync('audit-report.csv', csv, 'utf8');

  // Escribir issues
  fs.writeFileSync('audit-issues.txt', issues.join('\n'), 'utf8');

  console.log('\n=== RESUMEN DEL CATÁLOGO ===');
  console.log(`Total filtros:          ${stats.total}`);
  console.log(`Con OEM codes:          ${stats.withOem} (${pct(stats.withOem, stats.total)}%)`);
  console.log(`Sin OEM codes:          ${stats.emptyOem} (${pct(stats.emptyOem, stats.total)}%)`);
  console.log(`Con competitor codes:   ${stats.withCompetitor} (${pct(stats.withCompetitor, stats.total)}%)`);
  console.log(`Sin competitor codes:   ${stats.emptyCompetitor} (${pct(stats.emptyCompetitor, stats.total)}%)`);
  console.log(`OEM formato inválido:   ${stats.badFormatOem} filtros`);
  console.log(`Comp formato inválido:  ${stats.badFormatCompetitor} filtros`);
  console.log(`Competitor duplicados:  ${stats.duplicateCodes} filtros`);
  console.log(`\nProblemas encontrados: ${issues.length}`);
  console.log('\nArchivos generados:');
  console.log('  audit-report.csv  — detalle completo por SKU');
  console.log('  audit-issues.txt  — lista de problemas');

  await client.end();
}

function pct(n, total) { return total ? ((n / total) * 100).toFixed(1) : 0; }

main().catch(e => { console.error(e.message); process.exit(1); });
