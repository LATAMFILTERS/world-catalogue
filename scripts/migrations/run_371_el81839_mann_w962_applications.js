'use strict';

/**
 * EL81839 (Donaldson P061839): load the MANN W 962 "Veiculos / Aplicacoes" list (official MANN page, pasted by the operator 2026-11-16)
 * as equipment applications, by operator instruction. MANN lists W 962 at 210 mm and P061839 is 200 mm, so this is an operator decision,
 * not a dimensional match. The W 962 principal EL83771 is not touched. Existing applications (VW 9.150 OD, run_370) are kept.
 * Source list: scripts/migrations/data/mann_w962_applications_20261116.txt. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL81839';
const MANN_URL = 'https://www.mann-filter.com/br-pt/catalogo/resultados-da-pesquisa/produto.html/w962_mann-filter.html';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function cleanMake(m) {
  if (/^VW \(VOLKSWAGEN\)/.test(m)) return 'VOLKSWAGEN';
  return m.replace(/\s*\([^)]*\)/g, '').trim();
}
function readEntries() {
  const out = []; let sec = null;
  for (const line of fs.readFileSync(path.join(__dirname, 'data', 'mann_w962_applications_20261116.txt'), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (line.startsWith('@')) { const [make, series, type] = line.slice(1).split('|'); sec = { make: cleanMake(make), series, type }; continue; }
    const [model, engine, kw, years, ft] = line.split('|');
    const opts = [sec.series, kw ? `${kw} kW` : '', years || '', ft === 'H' ? 'HYDRAULIC FILTER APPLICATION' : ''].filter(Boolean).join('; ');
    out.push({ type: sec.type, engine: (engine || '').trim(), equipment: `${sec.make} ${model}`.trim(), equipment_options: opts });
  }
  return out;
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT sku, equipment_applications FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const existing = cur.equipment_applications || [];
    const seen = new Set(existing.map((x) => norm(`${x.equipment}|${x.engine}|${x.equipment_options || ''}`)));
    const entries = readEntries(); const add = []; let dup = 0; let noEngine = 0;
    for (const e of entries) {
      const k = norm(`${e.equipment}|${e.engine}|${e.equipment_options}`);
      if (seen.has(k)) { dup++; continue; }
      seen.add(k); if (!e.engine) noEngine++; add.push(e);
    }
    report.entries = { in_file: entries.length, to_add: add.length, duplicates_skipped: dup, without_engine: noEngine, existing: existing.length };
    report.application = await applyVerifiedApplications(db, { sku: SKU, equipment_applications: [...existing, ...add],
      evidence: { authority: 'MANN_FILTER_OFFICIAL_PRODUCT_PAGE', source_url: MANN_URL, evidence_hash: sha({ sku: SKU, n: add.length, MANN_URL }),
        metadata: { method: 'operator-instruction-from-mann-w962-page', reference_code: 'W 962', added: add.length, fitment: 'applied to P061839 by operator decision; MANN lists W 962 at 210 mm, P061839 is 200 mm' } } });
    report.after = (await db.query('SELECT jsonb_array_length(equipment_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0].n;
    if (report.after !== existing.length + add.length) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
