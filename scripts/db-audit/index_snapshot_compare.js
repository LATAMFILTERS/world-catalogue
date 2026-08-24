'use strict';
/**
 * Fase 5 — compares two or more index_snapshot.js outputs and classifies
 * each index. Pure local file comparison, no DB connection.
 *
 * Usage: node scripts/db-audit/index_snapshot_compare.js <baseline.json> <day7.json> [<day14.json>]
 */
const fs = require('fs');
const path = require('path');

const CONSTRAINT_INDEX_SUFFIXES = ['_pkey', '_key']; // heuristic: PK/UNIQUE-backed, required regardless of scans

function load(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function classify(baseline, latest) {
  const key = (r) => `${r.schema}.${r.table}.${r.index}`;
  const baseMap = new Map(baseline.indexes.map((r) => [key(r), r]));
  const results = [];

  for (const idx of latest.indexes) {
    const k = key(idx);
    const before = baseMap.get(k);
    const scanDelta = before ? idx.idx_scan - before.idx_scan : idx.idx_scan;
    const isConstraintBacked = CONSTRAINT_INDEX_SUFFIXES.some((s) => idx.index.endsWith(s));

    let verdict;
    if (isConstraintBacked) verdict = 'REQUIRED_BY_CONSTRAINT';
    else if (scanDelta > 0) verdict = 'USED';
    else if (baseline.stats_reset === null && !before) verdict = 'INSUFFICIENT_EVIDENCE';
    else verdict = 'UNUSED_WITH_SUFFICIENT_WINDOW';

    results.push({ ...idx, key: k, scans_at_baseline: before ? before.idx_scan : null, scans_now: idx.idx_scan, scan_delta: scanDelta, verdict });
  }
  return results;
}

function main() {
  const files = process.argv.slice(2);
  if (files.length < 2) {
    console.error('Usage: node index_snapshot_compare.js <baseline.json> <later.json> [<later2.json>]');
    process.exit(1);
  }
  const baseline = load(files[0]);
  const latest = load(files[files.length - 1]);
  const results = classify(baseline, latest);

  const summary = results.reduce((acc, r) => { acc[r.verdict] = (acc[r.verdict] || 0) + 1; return acc; }, {});
  console.log('Verdict summary:', summary);

  const outDir = path.join(__dirname, 'output');
  fs.writeFileSync(path.join(outDir, 'index_usage_comparison.json'), JSON.stringify({ generated_at: new Date().toISOString(), baseline_label: baseline.label, latest_label: latest.label, summary, results }, null, 2));

  const lines = ['# Fase 5 — comparación de uso de índices', '', `Baseline: ${baseline.label} (${baseline.captured_at})`, `Última: ${latest.label} (${latest.captured_at})`, '', `Resumen: ${JSON.stringify(summary)}`, '', 'REDUNDANT_CANDIDATE nunca se asigna automáticamente aquí -- requiere además el análisis estructural (Fase 7.A de la auditoría anterior: duplicados exactos por columnas/orden/opclass/predicado) antes de proponer un DROP.', '', '| Índice | Scans baseline | Scans ahora | Delta | Veredicto |', '|---|---|---|---|---|'];
  for (const r of results) lines.push(`| ${r.key} | ${r.scans_at_baseline ?? '-'} | ${r.scans_now} | ${r.scan_delta} | ${r.verdict} |`);
  fs.writeFileSync(path.join(outDir, 'index_usage_comparison.md'), lines.join('\n') + '\n');
  console.log('Written index_usage_comparison.json/.md');
}

main();
