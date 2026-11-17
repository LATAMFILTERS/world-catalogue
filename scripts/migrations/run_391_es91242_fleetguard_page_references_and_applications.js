'use strict';

/**
 * ES91242 (HYDROCORE spin-on fuel/water separator, base Fleetguard FS1242B): loads what the operator pasted on 2026-11-17.
 *  1. OEM cross references: Fleetguard official product page FS1242B, tab "Referencia cruzada OEM" (data/es91242_oem_20261117.txt).
 *  2. Equipment applications: same official page, tab "Equipo" (data/es91242_applications_20261117.txt). The page gives equipment, engine and year only;
 *     no equipment type is stated, so the type is the neutral "EQUIPMENT" (it is not guessed).
 *  3. Alternate codes from a third-party "FS1242B replacement fuel filters" list (retailer, not an official sheet; data/es91242_competitors_20261117.txt),
 *     no Donaldson entries (never declared without an exact official sheet), loaded as alternates only.
 * Only codes that no other active SKU holds are written (a code held elsewhere is reported, never moved); a code can be in one column only.
 * Dry-run by default (ROLLBACK); --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'ES91242';
const URL_FG = 'https://www.fleetguard.com/es/product/fs1242b/01t5x000008FG9zAAG';
const SRC_OEM = 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_FS1242B_OEM_TAB_OPERATOR_PASTED_20261117';
const SRC_LIST = 'THIRD_PARTY_FS1242B_REPLACEMENT_LIST_OPERATOR_PASTED_20261117';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const data = (f) => fs.readFileSync(path.join(__dirname, 'data', f), 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));

function readCodes(file) {
  const out = [];
  for (const line of data(file)) {
    const i = line.indexOf(':');
    const brand = line.slice(0, i).trim();
    for (const code of line.slice(i + 1).trim().split(/\s+/)) if (code) out.push({ brand: brand.toUpperCase(), code });
  }
  return out;
}
function readApplications() {
  const out = [];
  for (const line of data('es91242_applications_20261117.txt')) {
    const [eq, engine, year] = line.split('|');
    const equipment = eq.replace(/\s*-\s*/, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
    out.push({ type: 'EQUIPMENT', engine: (engine || '').trim().toUpperCase(), equipment, equipment_options: (year || '').trim() });
  }
  return out;
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || !cur.catalog_active || cur.codigo_base !== 'FS1242B') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));

    // codes held by other active SKUs (never moved)
    const heldRows = (await db.query(`SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active AND c.sku<>$1`, [SKU])).rows;
    const held = new Map(); for (const r of heldRows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const have = new Set([...(cur.oem_codes || []), ...(cur.competitor_codes || [])].map((x) => norm(x.code)));
    const base = norm(cur.codigo_base);
    const skipped = { held_elsewhere: [], same_as_base: [], duplicate: [] };
    const take = (list, mk) => {
      const add = [];
      for (const { brand, code } of list) {
        const k = norm(code);
        if (k === base) { skipped.same_as_base.push(`${brand}:${code}`); continue; }
        if (have.has(k)) { skipped.duplicate.push(`${brand}:${code}`); continue; }
        if (held.has(k)) { skipped.held_elsewhere.push(`${brand}:${code}=${held.get(k).join('/')}`); continue; }
        have.add(k); add.push(mk(brand, code));
      }
      return add;
    };
    const oemAdd = take(readCodes('es91242_oem_20261117.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC_OEM, source_url: URL_FG }));
    const compAdd = take(readCodes('es91242_competitors_20261117.txt'), (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_FG }));
    const patch = { oem_codes: [...(cur.oem_codes || []), ...oemAdd], competitor_codes: [...(cur.competitor_codes || []), ...compAdd] };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    report.codes = { oem_added: oemAdd.length, competitor_added: compAdd.length, skipped_counts: Object.fromEntries(Object.entries(skipped).map(([k, v]) => [k, v.length])), held_elsewhere: skipped.held_elsewhere };

    // applications
    const existing = cur.equipment_applications || [];
    const seen = new Set(existing.map((x) => norm(`${x.equipment}|${x.engine}|${x.equipment_options || ''}`)));
    const add = [];
    for (const e of readApplications()) { const k = norm(`${e.equipment}|${e.engine}|${e.equipment_options}`); if (seen.has(k)) continue; seen.add(k); add.push(e); }
    report.applications = { existing: existing.length, to_add: add.length };
    await applyVerifiedApplications(db, { sku: SKU, equipment_applications: [...existing, ...add],
      evidence: { authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', source_url: URL_FG, evidence_hash: sha({ sku: SKU, n: add.length, URL_FG }),
        metadata: { method: 'official-fleetguard-equipment-list-operator-pasted', added: add.length } } });
    const after = (await db.query('SELECT jsonb_array_length(equipment_applications) a, jsonb_array_length(oem_codes) o, jsonb_array_length(competitor_codes) c FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (after.a !== existing.length + add.length || after.o !== patch.oem_codes.length || after.c !== patch.competitor_codes.length) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.after = after;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
