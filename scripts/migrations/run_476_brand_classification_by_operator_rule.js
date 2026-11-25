'use strict';

/**
 * Brand classification by operator rule (2026-11-25): OEM = maker of the equipment (HD) or vehicle (LD); filter / parts brands = competitor (cross reference).
 * For every code that sits in BOTH oem_codes and competitor_codes of a SKU, each entry whose brand has a decided class and sits in the wrong list is moved to the right one
 * (removed from the wrong list; added to the right list if no entry of that brand+code is there). Entries with no brand name, or whose brand is the generic word OEM / OE, are never touched.
 * Only competitor_codes / oem_codes change. SKUs the write gateway rejects are skipped and listed. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 * Optional: --only-skus <json array file> limits the SKUs; --report-skus <json array file> reports remaining conflicts for them.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// Equipment (HD) and vehicle (LD) makers = OEM; every other brand is a competitor (operator rule). Brands are matched by letters only.
const OEM = new Set(['ADVANCEMIXER', 'ADVANCEMIXERINC', 'AECWHITLOCK', 'AGCHEMEQUIPMENT', 'ALBIN', 'AMGENERAL', 'ATLASCOPCO', 'ATLASWEYHAUSEN', 'AUTOCAR', 'AVANT', 'BERING', 'BMC', 'BOBCAT', 'BOWSERBRIGGS', 'BRIGGSSTRATTON', 'BROYT', 'BUSINDUSTRIES', 'CASE', 'CASECASEIH', 'CASEIH', 'CASEINTERNATIONAL', 'CEDARAPIDS', 'CEDARRAPIDS', 'CHARLESMACHINE', 'CHARLESMACHINEWORKS', 'CHEVROLET', 'CHRYSLER', 'CLARK', 'CLARKEQUIPMENT', 'CONSOLIDATEDDIESEL', 'CUMMINS', 'DAEWOO', 'DAEWOOCONSTRUCTIONEQUIPMENT', 'DAIHATSU', 'DEMAG', 'DETROITDIESEL', 'ERF', 'EUCLID', 'FINN', 'FINNEQUIPMENT', 'FLXIBLE', 'FLYERINDUSTRIES', 'FORD', 'FOREMOSTINDUSTRIES', 'FREIGHTLINER', 'FURUKAWA', 'FWD', 'GENERALMOTORS', 'GM', 'GMC', 'GRAYMARINE', 'GROVE', 'HAULAMATIC', 'HAWKERSIDDELEY', 'HOUGH', 'HUERLIMANNHUMMEL', 'HURLIMANN', 'HYDROAX', 'IHCNAVISTAR', 'ISUZU', 'JOHNDEERE', 'KOBELCO', 'KOMATSU', 'LAMBORGHINI', 'LANSING', 'LANSINGLINDE', 'LEYLAND', 'LEYLANDDAF', 'LEYLANDDAFLDV', 'LINDE', 'LUGGER', 'MACK', 'MAN', 'MASSEYFERGUSON', 'MAZDA', 'MCCORMICK', 'MCI', 'MERCRUISER', 'MORBARK', 'MOTORCOACH', 'MOTORIVM', 'NABIBUS', 'NEWFLYERINDUSTRIESLTD', 'NISSAN', 'NORTHAMERICANBUS', 'NOVABUSCORPORATION', 'OMARKMATERIALHANDLING', 'ONTARIOBUS', 'ORIONBUS', 'ORIONBUSINDUSTRIES', 'OTTAWATRUCK', 'PETTIBONE', 'PIAGGIO', 'ROVER', 'SAME', 'SISU', 'STEIGER', 'STEWARTSTEVENSON', 'SULLAIR', 'SYSTEMSMATERIALHANDLING', 'TALBOT', 'TOYOTA', 'TROJAN', 'UD', 'UNIONCITYBODY', 'UNITRIG', 'VALMET', 'VM', 'VOLVO', 'VOLVOTRUCKS', 'WARNERSWASEY', 'WARTSILA', 'WHITE', 'YALE', 'YALETOWNE', 'YUTANI']);
const brandKey = (x) => String(x.manufacturer || '').toUpperCase().replace(/[^A-Z]/g, '');
// "OEM" and "OE" are not brands (generic word): the operator asked to leave those entries untouched.
const SKIP = new Set(['OEM', 'OE']);
const want = (x) => (!brandKey(x) || SKIP.has(brandKey(x)) ? null : OEM.has(brandKey(x)) ? 'oem' : 'comp');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus_changed: 0, entries_moved: 0, gateway_skipped: [] };
  try {
    await db.query('BEGIN');
    const only = arg('--only-skus') ? new Set(JSON.parse(fs.readFileSync(arg('--only-skus'), 'utf8'))) : null;
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE oem_codes IS NOT NULL AND competitor_codes IS NOT NULL ORDER BY sku FOR UPDATE')).rows.filter((r) => !only || only.has(r.sku));
    const touched = [];
    const hash = "SELECT md5((to_jsonb(c)-'competitor_codes'-'oem_codes')::text) h FROM public.elimfilters_catalog c WHERE sku=$1";
    for (const cur of rows) {
      const O = cur.oem_codes || [], C = cur.competitor_codes || [];
      const inC = new Set(C.map((x) => norm(x.code))), inO = new Set(O.map((x) => norm(x.code)));
      const both = new Set([...inO].filter((k) => inC.has(k)));
      if (!both.size) continue;
      let oem = [...O], comp = [...C], moved = 0;
      for (const x of O) if (both.has(norm(x.code)) && want(x) === 'comp') {
        oem = oem.filter((y) => y !== x); moved++;
        if (!comp.some((y) => norm(y.code) === norm(x.code) && brandKey(y) === brandKey(x))) comp.push({ ...x, classification: 'AFTERMARKET', classification_source: 'OPERATOR_RULE_20261125' });
      }
      for (const x of C) if (both.has(norm(x.code)) && want(x) === 'oem') {
        comp = comp.filter((y) => y !== x); moved++;
        if (!oem.some((y) => norm(y.code) === norm(x.code) && brandKey(y) === brandKey(x))) oem.push({ ...x, classification: 'OEM', classification_source: 'OPERATOR_RULE_20261125' });
      }
      if (!moved) continue;
      try { assertGovernedCatalogPatch(cur, { competitor_codes: comp, oem_codes: oem }, { validateApplications: false }); } catch (e) { report.gateway_skipped.push(cur.sku); continue; }
      touched.push(cur);
      const h0 = (await db.query(hash, [cur.sku])).rows[0].h;
      const u = await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, oem_codes=$3::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(comp), JSON.stringify(oem)]);
      if (u.rowCount !== 1) throw new Error('UPDATE_COUNT ' + cur.sku);
      if ((await db.query(hash, [cur.sku])).rows[0].h !== h0) throw new Error('PROTECTED_FIELD_CHANGED ' + cur.sku);
      report.skus_changed++; report.entries_moved += moved;
    }
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: touched.map((r) => ({ sku: r.sku, oem_codes: r.oem_codes, competitor_codes: r.competitor_codes })), row_sha256: sha(touched.map((r) => [r.sku, r.oem_codes, r.competitor_codes])) }, null, 2));
    const rep = arg('--report-skus');
    if (rep) {
      const list = JSON.parse(fs.readFileSync(rep, 'utf8'));
      const left = (await db.query('SELECT sku, count(*)::int n FROM public.catalog_reference_classification_conflicts_v WHERE sku = ANY($1) GROUP BY sku ORDER BY n DESC', [list])).rows;
      report.listed_skus_conflict_free_after = list.length - left.length;
      report.listed_skus_with_conflicts_after = left.length;
      report.listed_remaining = left.map((r) => r.sku + ':' + r.n).join(' ');
    }
    report.conflict_view_total_after = Number((await db.query('SELECT count(*) n FROM public.catalog_reference_classification_conflicts_v')).rows[0].n);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
