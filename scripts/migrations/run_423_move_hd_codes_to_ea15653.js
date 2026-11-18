'use strict';

/**
 * Operator order 2026-11-18 ("SI MUEVELOS PORQUE ES HD Y NO LD"): the Mercedes-Benz air-filter numbers 003 094 96 04 / 003 094 95 04 / 004 094 74 04 (with and without the
 * leading A) and the MANN C291032/1 belong to the Heavy Duty EA15653 (Fleetguard AF25653 OEM tab and third-party list), not to the Light Duty EA39010 / EA31032.
 * HD keeps the codes it shares with LD (rule of run_275 / run_367). Only the numbers the operator named are moved; nothing else on the LD rows changes.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const TARGET = 'EA15653';
const URL_FG = 'https://www.fleetguard.com/es/product/af25653/01t5x000008FFflAAG';
const SRC = 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_AF25653_OEM_TAB_OPERATOR_PASTED_20261118';
const SRC_LIST = 'THIRD_PARTY_AF25653_REPLACEMENT_LIST_OPERATOR_PASTED_20261118';
const MOVE_OEM = ['0030949604', 'A0030949604', '0030949504', 'A0030949504', '0040947404', 'A0040947404'];
const MOVE_COMP = ['C2910321'];
const FROM = ['EA39010', 'EA31032'];
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const list = (v) => (Array.isArray(v) ? v : []);

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', removed: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[TARGET, ...FROM]])).rows;
    if (rows.length !== 3) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    const target = rows.find((r) => r.sku === TARGET);
    if (target.duty !== 'HEAVY_DUTY' || !target.catalog_active) throw new Error('TARGET_NOT_ACTIVE_HD');
    const all = new Set([...MOVE_OEM, ...MOVE_COMP].map(norm));

    // 1. LD rows lose the numbers
    const moved = [];
    for (const cur of rows.filter((r) => FROM.includes(r.sku))) {
      const hit = (x) => all.has(norm(x.code));
      const dropOem = list(cur.oem_codes).filter(hit); const dropComp = list(cur.competitor_codes).filter(hit);
      report.removed[cur.sku] = [...dropOem, ...dropComp].map((x) => `${x.manufacturer}:${x.code}`);
      moved.push(...dropOem.map((x) => ({ ...x, col: 'oem' })), ...dropComp.map((x) => ({ ...x, col: 'comp' })));
      if (!dropOem.length && !dropComp.length) continue;
      const patch = { oem_codes: list(cur.oem_codes).filter((x) => !hit(x)), competitor_codes: list(cur.competitor_codes).filter((x) => !hit(x)) };
      assertGovernedCatalogPatch(cur, patch, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      await db.query("DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])", [cur.sku, [...all]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [cur.sku]);
    }

    // 2. EA15653 gains them (Mercedes-Benz as OEM, MANN as aftermarket)
    const oem = list(target.oem_codes).slice(); const comp = list(target.competitor_codes).slice();
    const have = new Set([...oem, ...comp].map((x) => norm(x.code)));
    const added = [];
    for (const x of moved) {
      if (have.has(norm(x.code))) continue;
      have.add(norm(x.code));
      if (x.col === 'oem') oem.push({ code: String(x.code).replace(/\s+/g, ''), manufacturer: 'MERCEDES-BENZ', classification: 'OEM', classification_source: SRC, source_url: URL_FG });
      else comp.push({ code: x.code, manufacturer: x.manufacturer || 'MANN', classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_FG });
      added.push(`${x.manufacturer}:${x.code}`);
    }
    report.added_to_target = added;
    assertGovernedCatalogPatch(target, { oem_codes: oem, competitor_codes: comp }, { validateApplications: false });
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [TARGET, JSON.stringify(oem), JSON.stringify(comp)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TARGET]);

    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) = ANY(SELECT ld_catalog.norm_part(x) FROM unnest($1::text[]) x)", [[...MOVE_OEM, 'C291032/1', '0030949604']])).rows;
    report.integrity = (await db.query('SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE skus::text[] && $1::text[]) exact_conflicts', [[TARGET, ...FROM]])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
