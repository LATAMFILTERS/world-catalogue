'use strict';

/**
 * EA14553 (Donaldson P604457, KonePac cone 104 x 266, formerly EA14457) gets its Fleetguard equivalent AF4219 (operator 2026-11-25; Fleetguard page
 * https://www.fleetguard.com/es/product/af4219/01t5x000008FDmDAAW lists the same OEM codes: Thwaites T53814, Carrier Transicold 300047120, Thermo King 1E51967G01 / 3504628 / P030047120, JCB 32925894).
 * Only competitor_codes (AF4219 added as FLEETGUARD) and the evidence URL (Donaldson product page) change. codigo_base stays P604457. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA14553';
const BASE = 'P604457';
const FG = 'AF4219';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P604457/31261';
const URL_FG = 'https://www.fleetguard.com/es/product/af4219/01t5x000008FDmDAAW';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== BASE) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND (upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2 OR competitor_codes::text ilike $3 OR oem_codes::text ilike $3)`, [SKU, FG, `%${FG}%`]);
    if (clash.rowCount) throw new Error('CODE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const had = (cur.competitor_codes || []).some((x) => norm(x.code) === FG);
    const comp = had ? cur.competitor_codes : [...(cur.competitor_codes || []), { code: FG, manufacturer: 'FLEETGUARD' }];
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.fleetguard_equivalent = { code: FG, evidence_url: URL_FG, note: 'Operator 2026-11-25: Fleetguard AF4219 (110 x 266.1 mm) is the Fleetguard equivalent of Donaldson P604457; same OEM cross-references', recorded_at: '2026-11-25T00:00:00.000Z' };
    enrichment.codigo_base_governance = { ...(enrichment.codigo_base_governance || {}), evidence_url: URL_DON, competitor_code_count: comp.length };
    const patch = { competitor_codes: comp, enrichment_data: enrichment, canonical_source_url: URL_DON };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, enrichment_data=$3::jsonb, canonical_source_url=$4 WHERE sku=$1', [SKU, JSON.stringify(comp), JSON.stringify(enrichment), URL_DON]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query('SELECT sku, codigo_base, jsonb_array_length(competitor_codes) comp, canonical_source_url FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [FG])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
