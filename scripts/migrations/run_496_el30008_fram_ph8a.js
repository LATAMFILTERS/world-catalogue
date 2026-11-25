'use strict';

/**
 * EL30008 is FRAM PH8A (operator 2026-11-25; EL80008 was retired and replaced by EL30008, "recupéralos y se los colocas al nuevo código"). Until now EL30008 carried the provisional base "0008", unverified dimensions
 * and 164 applications / 29 codes of other origin (MANN W10008 / WH10008 rows). Rule of the base: the codes and applications of an LD SKU come from the maker of its base (FRAM, non-European vehicles).
 * Source: the FRAM official page https://www.fram.com/fram-extra-guard-oil-filter-spin-on-ph8a captured by scraper on 2026-11-25 (applications 667 pages, interchange 65 pages), read from --data <json>.
 *  1. Base PH8A, FRAM canonical fields, governance CANONICAL_VERIFIED (NON_EUROPEAN), FRAM dimensions (OD 96.44 mm, H 133.35 mm, thread 3/4-16) and the FRAM canonical identity row.
 *  2. vehicle_applications = the FRAM PH8A applications (unique year/make/model/engine) with their two evidence rows (VEHICLE, ENGINE) like EL33506.
 *  3. oem_codes / competitor_codes = the FRAM PH8A interchange. OEM = vehicle/equipment makers, every other brand = competitor (operator rule; the extension list of makers found in this table is in the script);
 *     a code never sits in both lists (the OEM copy wins) and the base itself is not listed as an alternate.
 *  4. What EL30008 had before (applications, codes) is kept in the snapshot and in enrichment_data.pending_review, not deleted.
 * HD <-> LD links are NOT filtered here: codes that an HD product also lists are counted in the report for the operator's ruling on two official sources claiming one code.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>. Optional --data <fram_ph8a.json>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const DATA = arg('--data') || 'C:/ELIMSERVER/state/fram-ph3506/fram_ph8a.json';
const SKU = 'EL30008';
const OLD_BASE = '0008';
const BASE = 'PH8A';
const PAGE = 'https://www.fram.com/fram-extra-guard-oil-filter-spin-on-ph8a';
const AT = '2026-11-25T00:00:00.000Z';
const OEM_MAKERS = new Set(['ADVANCEMIXER', 'ADVANCEMIXERINC', 'AECWHITLOCK', 'AGCHEMEQUIPMENT', 'ALBIN', 'ALFAROMEO', 'ALLISCHALMERS', 'AMGENERAL', 'ASTONMARTIN', 'ATLASCOPCO', 'ATLASWEYHAUSEN', 'AUTOCAR', 'AVANT', 'BERING', 'BMC', 'BOBCAT', 'BOLINDERMUNKTELL', 'BOWSERBRIGGS', 'BRICKLIN', 'BRIGGSSTRATTON', 'BRITISHLEYLAND', 'BROYT', 'BUSINDUSTRIES', 'BWLATHROPMARINE', 'CASE', 'CASECASEIH', 'CASEIH', 'CASEINTERNATIONAL', 'CATERPILLAR', 'CEDARAPIDS', 'CEDARRAPIDS', 'CHARLESMACHINE', 'CHARLESMACHINEWORKS', 'CHEVROLET', 'CHRISCRAFT', 'CHRYSLER', 'CLARK', 'CLARKEQUIPMENT', 'COLTINDUSTRIES', 'CONSOLIDATEDDIESEL', 'CRUSADERMARINE', 'CUMMINS', 'DAEWOO', 'DAEWOOCONSTRUCTIONEQUIPMENT', 'DAIHATSU', 'DEMAG', 'DETROITDIESEL', 'EDSEL', 'ERF', 'EUCLID', 'FAIRBANKSMORSE', 'FIATALLISARCHIVED', 'FINN', 'FINNEQUIPMENT', 'FLXIBLE', 'FLYERINDUSTRIES', 'FORD', 'FOREMOSTINDUSTRIES', 'FREIGHTLINER', 'FURUKAWA', 'FWD', 'GENERALMOTORS', 'GM', 'GMC', 'GRAVELY', 'GRAYMARINE', 'GROVE', 'HAULAMATIC', 'HAWKERSIDDELEY', 'HOBART', 'HOUGH', 'HUBERWARCO', 'HUERLIMANNHUMMEL', 'HURLIMANN', 'HYDROAX', 'HYSTER', 'IHCNAVISTAR', 'INGERSOLLRAND', 'INTERCEPTORMARINE', 'INTERNATIONAL', 'ISUZU', 'JOHNDEERE', 'KOBELCO', 'KOMATSU', 'KUBOTA', 'LAMBORGHINI', 'LANDROVER', 'LANSING', 'LANSINGLINDE', 'LEROI', 'LETOURNEAU', 'LEYLAND', 'LEYLANDDAF', 'LEYLANDDAFLDV', 'LINCOLNAUTOMOTIVE', 'LINDE', 'LUGGER', 'MACK', 'MAN', 'MANITOU', 'MARINEPOWER', 'MASSEYFERGUSON', 'MAZDA', 'MCCORMICK', 'MCI', 'MELROEBOBCAT', 'MERCRUISER', 'MERCURY', 'MERKUR', 'MITSUBISHI', 'MORBARK', 'MOTORCOACH', 'MOTORIVM', 'NABIBUS', 'NEWFLYERINDUSTRIESLTD', 'NEWHOLLANDAGRICULTURE', 'NISSAN', 'NORTHAMERICANBUS', 'NOVABUSCORPORATION', 'OMARKMATERIALHANDLING', 'OMC', 'ONTARIOBUS', 'ORIONBUS', 'ORIONBUSINDUSTRIES', 'OTTAWATRUCK', 'PERKINS', 'PETTIBONE', 'PIAGGIO', 'PLEASURECRAFT', 'PLYMOUTH', 'ROOTES', 'ROVER', 'SAME', 'SISU', 'STEIGER', 'STEWARTSTEVENSON', 'SULLAIR', 'SYSTEMSMATERIALHANDLING', 'TALBOT', 'TOYOTA', 'TROJAN', 'UD', 'UNIONCITYBODY', 'UNITRIG', 'VALMET', 'VERSATILE', 'VM', 'VOLVO', 'VOLVOTRUCKS', 'WARNERSWASEY', 'WARTSILA', 'WAUKESHA', 'WESTERBEKE', 'WHITE', 'WORTHINGTON', 'YALE', 'YALEANDTOWNE', 'YALETOWNE', 'YAMAHA', 'YUTANI']);
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const letters = (v) => String(v || '').toUpperCase().replace(/&AMP;/g, '&').replace(/[^A-Z]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const fram = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  if (!/PH8A/.test(fram.title) || fram.pages_applications !== 667) throw new Error('DATA_FILE_NOT_PH8A');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.duty !== 'LIGHT_DUTY' || !cur.catalog_active || cur.codigo_base !== OLD_BASE) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('BASE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    if ((await db.query('SELECT 1 FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1', [SKU])).rowCount) throw new Error('IDENTITY_ALREADY_PRESENT');
    if ((await db.query('SELECT 1 FROM public.catalog_application_evidence WHERE sku=$1', [SKU])).rowCount) throw new Error('EVIDENCE_ALREADY_PRESENT');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));

    // applications: unique year / make / model / engine
    const seen = new Set();
    const apps = [];
    for (const [year, make, model, engine] of fram.applications) {
      const k = [year, make, model, engine].map(norm).join('|');
      if (seen.has(k)) continue;
      seen.add(k);
      apps.push({ make, year: String(year), model, engine });
    }
    // interchange: FRAM page codes classified by brand; one list per code; the base is not an alternate
    const oem = [];
    const comp = [];
    const isMaker = (m) => OEM_MAKERS.has(letters(m));
    // keep every distinct (code, brand) once in its own list; a code that has an OEM entry is OEM only
    const oemCodes = new Set();
    for (const [brand, part] of fram.interchange) { if (isMaker(brand) && norm(part) && norm(part) !== norm(BASE)) oemCodes.add(norm(part)); }
    const done = new Set();
    for (const [brand, part] of fram.interchange) {
      const k = norm(part);
      if (!k || k === norm(BASE)) continue;
      const mk = isMaker(brand);
      const dk = k + '|' + letters(brand);
      if (done.has(dk)) continue;
      if (!mk && oemCodes.has(k)) continue;
      done.add(dk);
      const entry = { code: String(part).trim(), manufacturer: String(brand).replace(/&amp;/g, '&').trim(), classification: mk ? 'OEM' : 'AFTERMARKET', classification_source: 'OPERATOR_RULE_20261125', source: 'FRAM_OFFICIAL_PAGE_PH8A_20261125', source_url: PAGE };
      (mk ? oem : comp).push(entry);
    }
    const hdHeld = (await db.query(`SELECT count(DISTINCT ld_catalog.norm_part(k.code))::int n FROM public.crossref_resolved_cache k JOIN public.elimfilters_catalog e ON e.sku=k.sku AND e.duty='HEAVY_DUTY' AND e.catalog_active
      WHERE ld_catalog.norm_part(k.code) = ANY($1::text[])`, [[...new Set([...oem, ...comp].map((x) => norm(x.code)))]])).rows[0].n;

    const appsHash = (await db.query('SELECT md5($1::jsonb::text) AS h', [JSON.stringify(apps)])).rows[0].h; // the trigger compares md5 of the stored jsonb text
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.application_governance = { policy_version: '2026-08-19-app-v1', evidence_recorded: true, evidence_authority: 'FRAM_OFFICIAL_PUBLISHED_FITMENT_20261125', evidence_url: PAGE,
      evidence_hash: sha({ sku: SKU, page: PAGE, payload: appsHash }), verified_at: AT, vehicle_verified: true, engine_verified: true, no_engine_code_inference: true,
      vehicle_payload_hash: appsHash, engine_payload_hash: appsHash, vehicle_db_payload_hash: appsHash, engine_db_payload_hash: appsHash };
    enrichment.pending_review = { set_aside_at: AT, migration: 'run_496', previous_codigo_base: OLD_BASE, vehicle_applications: cur.vehicle_applications || [], oem_codes: cur.oem_codes || [], competitor_codes: cur.competitor_codes || [] };
    enrichment.codigo_base_governance = {
      ...(enrichment.codigo_base_governance || {}),
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'NON_EUROPEAN', verified_at: AT,
      evidence_note: 'FRAM official page PH8A (oil filter, spin-on); EL80008 retired and replaced by EL30008; operator-approved 2026-11-25. FRAM no longer lists PH8A applications under older numbers; kept for Latin America.',
      policy_version: '2026-08-29-regional-v3.2', required_authority: 'REGIONAL_CANONICAL_POLICY_SATISFIED', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'FRAM', approved_source_column: 'CANONICAL_POLICY', primary_manufacturer_verified: true,
      alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY', previous_codigo_base: OLD_BASE, oem_code_count: oem.length, competitor_code_count: comp.length,
    };
    const evidence = { source: 'FRAM_OFFICIAL_PAGE_PH8A_20261125', authority: 'FRAM_OFFICIAL_PAGE', market_scope: 'MULTI_REGION' };
    const patch = {
      codigo_base: BASE, oem_codes: oem, competitor_codes: comp, vehicle_applications: apps, enrichment_data: enrichment,
      canonical_source_brand: 'FRAM', canonical_source_code: BASE, canonical_source_status: 'VERIFIED', canonical_verified_at: AT, canonical_evidence: evidence,
      outer_diameter_mm: 96.44, height_mm: 133.35, thread_size: '3/4-16',
    };
    report.apps = apps.length;
    report.codes = { oem: oem.length, competitor: comp.length, held_by_active_hd: hdHeld };
    report.before = { apps: (cur.vehicle_applications || []).length, oem: (cur.oem_codes || []).length, comp: (cur.competitor_codes || []).length };

    // evidence rows (VEHICLE and ENGINE) first: the gateway wants them for the applications
    const payloadHash = appsHash;
    for (const kind of ['VEHICLE', 'ENGINE']) {
      await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
        VALUES ($1,$2,$3,'FRAM_OFFICIAL_PUBLISHED_FITMENT_20261125',$4,$5,true,now(),$6::jsonb)`,
      [SKU, kind, payloadHash, PAGE, sha({ sku: SKU, kind, page: PAGE, payload: payloadHash }),
        JSON.stringify({ rows: apps.length, engine: null, parent_kind: 'VEHICLE', exact_fram_code: BASE, evidence_hash_note: 'sha256 of the rows extracted from the FRAM page (667 pages), not of the raw HTML', no_engine_code_inference: true, physical_testing_not_claimed: true, manufacturer_published_fitments: true })]);
    }
    report.gateway = assertGovernedCatalogPatch(cur, patch).valid;
    const cols = Object.keys(patch);
    const JSONB = ['oem_codes', 'competitor_codes', 'vehicle_applications', 'enrichment_data', 'canonical_evidence'];
    const sets = cols.map((c, i) => `${c}=$${i + 2}${JSONB.includes(c) ? '::jsonb' : ''}`).join(', ');
    const vals = cols.map((c) => (JSONB.includes(c) ? JSON.stringify(patch[c]) : patch[c]));
    await db.query(`UPDATE public.elimfilters_catalog SET ${sets} WHERE sku=$1`, [SKU, ...vals]);
    report.identity_row = (await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
      VALUES ($1,'NON_EUROPEAN','FRAM',$2,'oil','ACTIVE','FRAM_OFFICIAL_PAGE_PH8A_20261125_OPERATOR_20261125')`, [SKU, BASE])).rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.resolver_ph8a = (await db.query('SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)', [BASE])).rows;
    report.after = (await db.query('SELECT sku, codigo_base, canonical_source_brand br, outer_diameter_mm od, height_mm h, thread_size ts, jsonb_array_length(vehicle_applications) apps, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
