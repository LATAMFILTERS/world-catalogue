'use strict';

/**
 * EA14353 is Donaldson P134353 (operator 2026-11-25: "este es el correcto, P134353 verificado").
 * Donaldson page https://shop.donaldson.com/store/es-us/product/P134353/15438 : primary round air filter, OD 275.7 mm, ID 165.1 mm, length 381.1 mm; its safety (secondary) element is P134354 = EA14354.
 * The catalogue carried the SAME product twice: EA12287 (base P134353, Donaldson VERIFIED, right dimensions, 5 applications, no photo) and EA14353 (base AF4353 unverified, dimensions of another filter 234 x 411,
 * 26 applications, photo). The natural SKU of P134353 is EA1 + 4353 = EA14353, so EA14353 is kept and corrected:
 *   - base, canonical fields, governance and physical dimensions come from the verified EA12287 row;
 *   - competitor / OEM codes and equipment applications of both rows are merged (no duplicates);
 *   - the photo stays (it shows the primary round with the gasket washer P105740).
 * EA12287 is then retired whole (catalog_active=false, INACTIVE_RETIRED, correct_product EA14353) and registered as a SUPERSEDED former SKU of EA14353 (run_436 / run_467 mechanism).
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const KEEP = 'EA14353';
const OLD = 'EA12287';
const BASE = 'P134353';
const AT = '2026-11-25T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const brandKey = (x) => String(x.manufacturer || '').toUpperCase().replace(/[^A-Z]/g, '');
const mergeCodes = (a, b) => {
  const seen = new Set();
  const out = [];
  for (const x of [...(a || []), ...(b || [])]) {
    const k = norm(x.code) + '|' + brandKey(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};
const SPEC = ['outer_diameter_mm', 'inner_diameter_mm', 'height_mm', 'sub_type', 'installation_type', 'filter_type'];
const CANON = ['canonical_source_brand', 'canonical_source_code', 'canonical_source_url', 'canonical_source_status', 'canonical_verified_at', 'canonical_evidence'];
const JSONB = ['competitor_codes', 'oem_codes', 'equipment_applications', 'enrichment_data', 'canonical_evidence'];

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[KEEP, OLD]])).rows;
    const keep = rows.find((r) => r.sku === KEEP);
    const old = rows.find((r) => r.sku === OLD);
    if (!keep || !old || !keep.catalog_active || !old.catalog_active) throw new Error('SOURCE_CHANGED');
    if (keep.codigo_base !== 'AF4353' || old.codigo_base !== BASE || old.canonical_source_status !== 'VERIFIED') throw new Error('IDENTITY_CHANGED');
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND (enrichment_data->'kit'->'components' @> $1::jsonb OR enrichment_data->'kit'->'components' @> $2::jsonb)`, [JSON.stringify([{ sku: KEEP }]), JSON.stringify([{ sku: OLD }])])).rows;
    if (kits.length) throw new Error('SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    // EA14353's own lists were already classified (run_476 / run_477); EA12287's entries are added only when their code is in neither list yet, so no code ever sits in both columns
    // (the database refuses any increase of cross-column duplicates) and the code base itself is never listed as an alternate.
    const notBase = (x) => norm(x.code) !== BASE;
    const have = new Set([...(keep.oem_codes || []), ...(keep.competitor_codes || [])].map((x) => norm(x.code)));
    const addOem = [];
    const addComp = [];
    for (const x of (old.oem_codes || []).filter(notBase)) { const k = norm(x.code); if (have.has(k)) continue; have.add(k); addOem.push(x); }
    for (const x of (old.competitor_codes || []).filter(notBase)) { const k = norm(x.code); if (have.has(k)) continue; have.add(k); addComp.push(x); }
    const comp = mergeCodes(keep.competitor_codes, addComp).filter(notBase);
    const oem = mergeCodes(keep.oem_codes, addOem).filter(notBase);
    report.codes_added = { oem: addOem.length, competitor: addComp.length };
    const appKey = (a) => [a.equipment, a.engine, a.type].map((v) => String(v || '').toUpperCase().trim()).join('|');
    const seenA = new Set();
    const apps = [];
    for (const a of [...(keep.equipment_applications || []), ...(old.equipment_applications || [])]) {
      const k = appKey(a);
      if (seenA.has(k)) continue;
      seenA.add(k);
      apps.push(a);
    }
    const enrichment = { ...(keep.enrichment_data || {}) };
    enrichment.codigo_base_governance = {
      ...(old.enrichment_data?.codigo_base_governance || {}),
      current_codigo_base: BASE,
      approved_codigo_base: BASE,
      previous_codigo_base: 'AF4353',
      merged_from_sku: OLD,
      evidence_url: 'https://shop.donaldson.com/store/es-us/product/P134353/15438',
      verified_at: AT,
      competitor_code_count: comp.length,
      oem_code_count: oem.length,
    };
    if (old.enrichment_data?.dimension_evidence) enrichment.dimension_evidence = old.enrichment_data.dimension_evidence;
    delete enrichment.resolution_status;
    const patch = { codigo_base: BASE, competitor_codes: comp, oem_codes: oem, equipment_applications: apps, enrichment_data: enrichment };
    for (const k of [...SPEC, ...CANON]) patch[k] = old[k];
    report.gateway = assertGovernedCatalogPatch(keep, patch, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase({ ...keep, ...patch });
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    const cols = Object.keys(patch);
    const sets = cols.map((c, i) => `${c}=$${i + 2}${JSONB.includes(c) ? '::jsonb' : ''}`).join(', ');
    const vals = cols.map((c) => (JSONB.includes(c) && patch[c] !== null ? JSON.stringify(patch[c]) : patch[c]));
    await db.query(`UPDATE public.elimfilters_catalog SET ${sets} WHERE sku=$1`, [KEEP, ...vals]);

    // EA12287 retired whole + registered as a former SKU of EA14353
    // the resolver needs exactly ONE row per canonical base: the retired duplicate keeps its code base text but leaves the CANONICAL_VERIFIED state
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(jsonb_set(jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb), '{codigo_base_governance,state}', '"RETIRED_DUPLICATE"'::jsonb), '{codigo_base_governance,governance_state}', '"RETIRED_DUPLICATE"'::jsonb) WHERE sku=$1`,
      [OLD, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'DUPLICATE_OF_EA14353_SAME_DONALDSON_P134353', correct_product: KEEP, decided_by: 'OPERATOR', updated_at: '2026-11-25', migration: 'run_485' })]);
    report.old_cache_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [OLD])).rowCount;
    report.old_exact_removed = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>$2', [OLD, 'SUPERSEDED'])).rowCount;
    report.superseded_registered = (await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_485_EA12287_TO_EA14353') ON CONFLICT DO NOTHING`, [OLD, KEEP])).rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [KEEP]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query('SELECT sku, codigo_base, canonical_source_brand br, canonical_source_status st, outer_diameter_mm od, inner_diameter_mm idm, height_mm h, sub_type, jsonb_array_length(competitor_codes) comp, jsonb_array_length(oem_codes) oem, jsonb_array_length(equipment_applications) eq, image_url, catalog_active FROM public.elimfilters_catalog WHERE sku=$1', [KEEP])).rows[0];
    report.resolver = (await db.query('SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) = ANY($1::text[])', [[BASE, OLD, 'AF4353']])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
