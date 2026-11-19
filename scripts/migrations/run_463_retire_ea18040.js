'use strict';

/**
 * EA18040 (base A38040) retired in favour of EA15978 (operator order 2026-11-18: "elimina el EA18040 y donde aparezca coloca el EA15978, que es el correcto").
 * Kit EK10753 = EA15977 + EA15978, and only EA15977/EA15978/EK10753 list JAC HFC4253K3R1; EA18040 does not.
 * Least destructive retirement (run_340 mechanism): catalog_active=false, resolution_status INACTIVE_RETIRED superseded_by EA15978, cache rows removed,
 * SUPERSEDED reference EA18040 -> EA15978. The row and its history are NOT deleted. EA18040's OEM codes move to EA15978 when no other active SKU holds them and the write gateway allows it (blocked moves are reported, never bypassed).
 * Applications of EA18040 are NOT moved. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const OLD = 'EA18040';
const NEW = 'EA15978';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [[OLD, NEW]])).rows;
    const o = rows.find((r) => r.sku === OLD); const n = rows.find((r) => r.sku === NEW);
    if (!o || !o.catalog_active || o.codigo_base !== 'A38040') throw new Error('SOURCE_CHANGED');
    if (!n || !n.catalog_active || n.codigo_base !== 'CF1810') throw new Error('EA15978_NOT_READY');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));

    const heldElsewhere = new Map();
    const held = (await db.query(`SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active AND c.sku<>$1 AND c.sku<>$2`, [OLD, NEW])).rows;
    for (const r of held) { if (!heldElsewhere.has(r.code)) heldElsewhere.set(r.code, []); heldElsewhere.get(r.code).push(r.sku); }
    const have = new Set([...(n.oem_codes || []), ...(n.competitor_codes || [])].map((x) => norm(x.code)));
    const moved = []; const skipped = [];
    for (const x of o.oem_codes || []) {
      const k = norm(x.code);
      if (have.has(k)) { skipped.push(`${x.manufacturer}:${x.code}=already on ${NEW}`); continue; }
      if (heldElsewhere.has(k)) { skipped.push(`${x.manufacturer}:${x.code}=${heldElsewhere.get(k).join('/')}`); continue; }
      have.add(k); moved.push(x);
    }
    report.codes = { moved: moved.map((x) => `${x.manufacturer}:${x.code}`), not_moved: skipped };
    if (moved.length) {
      const patch = { oem_codes: [...(n.oem_codes || []), ...moved] };
      try {
        await db.query('SAVEPOINT m');
        report.gateway = assertGovernedCatalogPatch(n, patch, { validateApplications: false }).valid;
        await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb WHERE sku=$1', [NEW, JSON.stringify(patch.oem_codes)]);
        await db.query('RELEASE SAVEPOINT m');
      } catch (e) {
        await db.query('ROLLBACK TO SAVEPOINT m');
        report.codes.move_BLOCKED = String(e.message).slice(0, 200);
        report.codes.moved = [];
      }
    }

    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}',
        '{"state":"INACTIVE_RETIRED","reason":"OPERATOR_RETIRED_EA18040_EA15978_IS_THE_KIT_PARTNER_OF_EA15977_EK10753","superseded_by":"EA15978","decided_by":"OPERATOR","updated_at":"2026-11-18","migration":"run_463"}'::jsonb)
      WHERE sku=$1`, [OLD]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [OLD]);
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
      VALUES ('SUPERSEDED','ELIMFILTERS','EA18040','EA15978','RUN_463_RETIRED_INTO_EA15978') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`);
    for (const s of [NEW, 'EA15977', 'EK10753']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('EA18040'),ld_catalog.norm_part('WG9725190103'),ld_catalog.norm_part('28120Y3070'),ld_catalog.norm_part('A38040'))")).rows;
    report.active = (await db.query('SELECT sku,catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku', [[OLD, NEW]])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
