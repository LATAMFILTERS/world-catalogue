'use strict';

/**
 * EL80766 (Donaldson P550766, lube cartridge; replaces the discontinued P550354 - Donaldson official site 2026-11-18 returns P550766 for P550354): adds the cross-reference numbers of the
 * Donaldson official page (operator pasted 2026-11-18) and of the third-party replacement list (operator pasted 2026-11-18). Numbers already on the row or held by another SKU are
 * reported, never moved. DONALDSON P550354 stays on EL80756 for now: that row's base governance is unverified, so the gateway blocks editing it.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL80766';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P550766/20526';
const SRC = 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P550766_CROSS_REFERENCE_OPERATOR_PASTED_20261118';
const SRC_LIST = 'THIRD_PARTY_P550766_REPLACEMENT_LIST_OPERATOR_PASTED_20261118';
const OEM = { AHLMANN: ['211340'], 'BOSCH-REXROTH': ['1457429647'], 'CASE/CASE IH': ['A830X67317A', 'A730X6731L1A', 'A730X6731H3A', 'A730X6731L3A'],
  CLAAS: ['133638', '6750492156', '1229988', '24151104', '122998800', '20122998800', '36750492156', '1336380', '1339120'],
  DEMAG: ['13113674', '64991200'], LIEBHERR: ['570958308', '7211208'], STEINBOCK: ['045229'],
  'MERCEDES-BENZ': ['0011844125', '0011844425', '0011845455', '11845455', '286114', '3141800109', '3641800009', '3641800109', '933908'] };
const OFFICIAL_AFTERMARKET = { CROSLAND: ['1027'] };
const LIST = { BALDWIN: ['P7017'], CARQUEST: ['85732'], CLEAN: ['ML492'], 'COOPERS-FIAAM': ['FA4511A'], DT: ['461539'], FIBA: ['F620'], 'FIL FILTER': ['MLE1351'], FILTRON: ['OM516'],
  'FIRST-AUTOMOTIVE': ['E50825'], HENGST: ['E134HD06'], 'HIFI-FILTER': ['SO7000'], KNECHT: ['OX150D'], MAHLE: ['OX150D'], MANN: ['HU932/4X', 'HU9324X'], MECAFILTER: ['ELH4701'],
  MISFAT: ['L538'], MULLER: ['FOP825'], NAPA: ['1732'], SOFIMA: ['S5099PE'], STARLINE: ['SFOF1014'], UFI: ['25.099.00', '2509900'], 'UNICO-FILTER': ['EL81374X'], WIX: ['51732', 'WL7036'] };
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
    if (!cur || cur.codigo_base !== 'P550766') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const heldRows = (await db.query("SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active")).rows;
    const held = new Map(); for (const r of heldRows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const oem = (cur.oem_codes || []).slice(); const comp = (cur.competitor_codes || []).slice(); const added = []; const skipped = [];
    const have = new Set([norm('P550766'), ...oem.concat(comp).map((x) => norm(x.code))]);
    const take = (map, target, mk) => { for (const [brand, codes] of Object.entries(map)) for (const code of codes) {
      const k = norm(code);
      if (have.has(k)) continue;
      if (held.has(k)) { skipped.push(`${brand}:${code}=${held.get(k).join('/')}`); continue; }
      have.add(k); target.push(mk(brand, code)); added.push(`${brand}:${code}`);
    } };
    take(OEM, oem, (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC, source_url: URL_DON }));
    take(OFFICIAL_AFTERMARKET, comp, (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_DON }));
    take(LIST, comp, (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_DON }));
    report.added = added; report.held_elsewhere_not_loaded = skipped;
    if (added.length) {
      assertGovernedCatalogPatch(cur, { oem_codes: oem, competitor_codes: comp }, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem), JSON.stringify(comp)]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('P550766'), ld_catalog.norm_part('P550354'), ld_catalog.norm_part('LF3605'), ld_catalog.norm_part('HU9324X'), ld_catalog.norm_part('3641800009'))", [SKU])).rows;
    report.integrity = (await db.query('SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts, (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
