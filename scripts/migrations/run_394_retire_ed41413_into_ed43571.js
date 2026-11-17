'use strict';

/**
 * Retire ED41413 (Donaldson P951413, brake air dryer spin-on) into ED43571 (Donaldson P953571): they are the same filter.
 * Operator statement 2026-11-17: Donaldson merged the two products, so ED41413 is the same filter as ED43571 (not an operator preference).
 * The Donaldson official site confirms the P953571 side for BALDWIN BA5374 and MANN TB1374/15X (run_392 / run_393, P953571 "Reemplaza pieza P781466")
 * and lists the same dimensions for both (165 x 140 mm, M39 x 1.5); it publishes no statement naming P951413, so the merge itself rests on the operator statement.
 * One transaction:
 *  1. ED43571 receives the references of ED41413 that it lacks and that no other active SKU holds (a code held elsewhere is reported, never moved).
 *  2. ED43571 receives the equipment applications of ED41413 that it lacks; the previous verified evidence of ED41413 is kept as evidence rows of ED43571.
 *  3. ED41413 becomes inactive with resolution_status.superseded_by = ED43571 and is registered as a SUPERSEDED reference, so the former SKU still finds the product.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = 'ED41413';
const TO = 'ED43571';
const TO_BASE = 'P953571';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const appKey = (x) => norm(`${x.equipment}|${x.engine}|${x.equipment_options || ''}`);

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[FROM, TO]])).rows;
    const from = rows.find((r) => r.sku === FROM); const to = rows.find((r) => r.sku === TO);
    if (!from || !from.catalog_active || from.codigo_base !== 'P951413' || !to || !to.catalog_active || to.codigo_base !== TO_BASE || to.duty !== 'HEAVY_DUTY') throw new Error('ROWS_CHANGED');
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> $1::jsonb`, [JSON.stringify([{ sku: FROM }])])).rows;
    if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    // 1. references
    const heldRows = (await db.query(`SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active AND c.sku<>$1 AND c.sku<>$2`, [FROM, TO])).rows;
    const held = new Set(heldRows.map((r) => r.code));
    const have = new Set([...(to.oem_codes || []), ...(to.competitor_codes || [])].map((x) => norm(x.code)));
    const carried = { oem_codes: [], competitor_codes: [] }; const skippedHeld = [];
    for (const col of ['oem_codes', 'competitor_codes']) {
      for (const x of from[col] || []) {
        const k = norm(x.code);
        if (have.has(k) || k === norm(TO_BASE)) continue;
        if (held.has(k)) { skippedHeld.push(`${x.manufacturer}:${x.code}`); continue; }
        have.add(k); carried[col].push(x);
      }
    }
    const patch = { oem_codes: [...(to.oem_codes || []), ...carried.oem_codes], competitor_codes: [...(to.competitor_codes || []), ...carried.competitor_codes] };
    report.references = { oem_carried: carried.oem_codes.length, competitor_carried: carried.competitor_codes.length, held_elsewhere_not_moved: skippedHeld.length };
    if (carried.oem_codes.length || carried.competitor_codes.length) {
      report.gateway = assertGovernedCatalogPatch(to, patch, { validateApplications: false }).valid;
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [TO, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    }

    // 2. applications
    const toApps = to.equipment_applications || [];
    const seen = new Set(toApps.map(appKey));
    const add = [];
    for (const a of from.equipment_applications || []) { const k = appKey(a); if (seen.has(k)) continue; seen.add(k); add.push(a); }
    report.applications = { before: toApps.length, to_add: add.length };
    const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [FROM])).rows[0];
    const authority = ev ? ev.evidence_authority : 'DONALDSON';
    const src = ev ? ev.source_url : 'https://shop.donaldson.com/store/en-us/search?Ntt=P951413';
    const evHash = ev ? ev.evidence_hash : sha({ sku: FROM, src });
    if (add.length) {
      const list = [...toApps, ...add];
      await applyVerifiedApplications(db, { sku: TO, equipment_applications: list,
        evidence: { authority, source_url: src, evidence_hash: evHash, metadata: { method: 'carried-from-ed41413-same-filter-operator-statement-2026-11-17', carried: add.length } } });
      const h = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) await insertEvidence(db, { sku: TO, kind, payloadHash: h, evidenceAuthority: authority, sourceUrl: src, evidenceHash: evHash, metadata: { method: 'carried-from-ed41413-same-filter-operator-statement-2026-11-17' } });
    }

    // 3. retire
    const u = await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb) WHERE sku=$1`,
    [FROM, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'SAME_FILTER_DONALDSON_P951413_MERGED_INTO_P953571', superseded_by: TO, donaldson_base: TO_BASE, decided_by: 'OPERATOR_STATEMENT_SAME_FILTER', updated_at: '2026-11-17', migration: 'run_394' })]);
    if (u.rowCount !== 1) throw new Error('RETIRE_UPDATE_COUNT');
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [FROM])).rowCount;
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_394_RETIRED_INTO_ED43571') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]);

    report.after = (await db.query('SELECT sku,catalog_active,jsonb_array_length(equipment_applications) apps,jsonb_array_length(oem_codes) oem,jsonb_array_length(competitor_codes) comp FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku', [[FROM, TO]])).rows;
    if (report.after.find((r) => r.sku === TO).apps !== toApps.length + add.length) throw new Error('POST_WRITE_VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
