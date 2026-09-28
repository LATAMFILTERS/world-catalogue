'use strict';
// LD-E classifier: node classify.js <batch>  (needs ld_e<batch>_probe.json from mann_probe.js)
const fs = require('fs');
const crypto = require('crypto');
const { framPage } = require('./fram_page');
// Work dir holds ld721.json (export.js), allbases.json (query.js) and page caches.
const S = process.env.FUEL_LD_E_WORK || __dirname;
const BATCH = process.argv[2];
const probe = require(`${S}/ld_e${BATCH}_probe.json`);
const rows = new Map(require(S + '/ld721.json').map((r) => [r.sku, r]));
const allBases = require(S + '/allbases.json');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const num = (v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const close = (a, b, t = 3) => a != null && b != null && Math.abs(a - b) <= t;
const FRAM_CACHE = S + '/fram_pages.json';
const framCache = fs.existsSync(FRAM_CACHE) ? JSON.parse(fs.readFileSync(FRAM_CACHE, 'utf8')) : {};

const { origin } = require('./origin');
function makesOf(row) {
  const va = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
  return [...new Set(va.map((v) => String(v.make || v.brand || v.marca || '').toUpperCase().trim()).filter(Boolean))];
}
function originGroup(row) {
  const groups = new Set(makesOf(row).map(origin));
  if (!groups.size) return 'NO_APPLICATIONS';
  if (groups.size === 1) return [...groups][0];
  return groups.has('UNKNOWN') && groups.size === 2 ? `PARTIAL_${[...groups].find((g) => g !== 'UNKNOWN')}` : 'MIXED';
}
const packBase = (code) => String(code).replace(/\(\d+\)$/, '').trim();
const mainDigits = (code) => (String(code).match(/\d+/) || [''])[0];
// SKU suffix follows either the main MANN number (WK52/1 -> 0052) or all digits (WK939/10X -> 3910, gateway lastFourNumeric).
const suffixOk = (sku, code) => { const s = String(sku).slice(-4); const d = mainDigits(code); const all = String(code).replace(/\D/g, ''); return Boolean((d && s === d.padStart(4, '0').slice(-4)) || (all.length >= 4 && s === all.slice(-4))); };
const collision = (sku, code) => allBases.filter((r) => r.sku !== sku && norm(r.codigo_base) === norm(code)).map((r) => r.sku);

async function fram(code) {
  if (!(code in framCache)) framCache[code] = await framPage(code);
  return framCache[code];
}

(async () => {
  const out = [];
  for (const p of probe) {
    const row = rows.get(p.sku);
    const og = originGroup(row);
    const rec = { sku: p.sku, current_codigo_base: row.codigo_base, origin_group_derived: og, makes: makesOf(row).slice(0, 12), row_geometry_mm: { od: p.row_od_mm, h: p.row_h_mm } };
    // MANN evidence (strict)
    const mannPass = p.probes.filter((x) => x.found && x.fuel && x.geometry !== 'CONFLICT' && x.oe_matches.length > 0 &&
      ((x.geometry === 'MATCH' && (x.oe_matches.length >= 3 || x.oe_matches.length / Math.max(p.oem_count, 1) >= 0.5)) || (x.oe_matches.length >= 3 && x.oe_matches.length / Math.max(p.oem_count, 1) >= 0.8 && ((x.mann_h_mm != null && close(p.row_h_mm, x.mann_h_mm)) || (x.mann_a_mm != null && close(p.row_od_mm, x.mann_a_mm))))));
    const mannBases = [...new Set(mannPass.map((x) => packBase(x.code)))];
    const mannOeCompeting = p.probes.filter((x) => x.found && x.oe_matches.length > 0 && !mannBases.includes(packBase(x.code)));
    rec.mann = { candidates: p.mann_candidates.length, passing: mannBases, competing_oe: mannOeCompeting.map((x) => ({ code: x.code, oe: x.oe_matches.length, geometry: x.geometry })) };
    // FRAM evidence (strict, only fuel-plausible prefixes)
    const framRefs = [...new Map([...(row.competitor_codes || []), ...(row.oem_codes || [])]
      .filter((i) => /^FRAM/i.test(String(i.manufacturer || i.brand || '')))
      .map((i) => [norm(i.code), String(i.code).trim()])).values()].filter((c) => /^(G|P|PS|CS|C|FP|FS)\d/i.test(norm(c)));
    const framProbes = [];
    for (const c of framRefs) {
      const f = await fram(c);
      if (!f.found) { framProbes.push({ code: c, found: false }); continue; }
      const geometry = p.row_od_mm != null && p.row_h_mm != null && f.od_mm != null && f.height_mm != null ? (close(p.row_od_mm, f.od_mm) && close(p.row_h_mm, f.height_mm) ? 'MATCH' : 'CONFLICT') : 'INCOMPLETE';
      const rowMakes = makesOf(row).map((m) => m.split(/[ (]/)[0]);
      const makeOverlap = rowMakes.filter((m) => f.makes.includes(m));
      framProbes.push({ code: c, found: true, url: f.url, sku: f.sku, title: f.title, fuel: f.fuel === true, makes_available: f.makes_available === true, fuel_type: f.fuel_type, od_mm: f.od_mm, height_mm: f.height_mm, geometry, make_overlap: [...new Set(makeOverlap)] });
    }
    const framPass = framProbes.filter((x) => x.found && x.fuel && x.geometry === 'MATCH' && x.make_overlap.length > 0);
    rec.fram = { refs: framRefs.length, probes: framProbes, passing: framPass.map((x) => x.code) };

    let state, reason, approved = null, authority = null, evidence = null;
    if (!p.mann_candidates.length && !framRefs.length) { state = 'BLOCKED_EVIDENCE_REQUIRED'; reason = 'NO_MANN_OR_FRAM_REFERENCE_ON_FILE'; }
    else if (og === 'EUROPEAN' || og === 'PARTIAL_EUROPEAN') {
      if (og !== 'EUROPEAN') { state = 'BLOCKED_APPLICATION_CONFLICT'; reason = 'ORIGIN_GROUP_NOT_FULLY_DETERMINED'; }
      else if (mannBases.length === 1 && mannOeCompeting.length === 0) { approved = mannBases[0]; authority = 'MANN-FILTER'; evidence = mannPass.find((x) => packBase(x.code) === approved); }
      else if (mannBases.length > 1 || (mannBases.length === 1 && mannOeCompeting.length)) { state = 'BLOCKED_RESOLVER_CONFLICT'; reason = 'MULTIPLE_MANN_PRODUCTS_SHARE_ROW_OE_EVIDENCE'; }
      else { state = 'BLOCKED_PRIMARY_AUTHORITY_NOT_CONFIRMED'; reason = 'MANN_OFFICIAL_EVIDENCE_DOES_NOT_CONFIRM_ROW_IDENTITY'; }
    } else if (og === 'NON_EUROPEAN') {
      if (framPass.length === 1) { approved = framPass[0].code; authority = 'FRAM'; evidence = framPass[0]; }
      else if (framPass.length > 1) { state = 'BLOCKED_RESOLVER_CONFLICT'; reason = 'MULTIPLE_FRAM_PRODUCTS_MATCH_ROW'; }
      else { state = 'BLOCKED_PRIMARY_AUTHORITY_NOT_CONFIRMED'; reason = mannBases.length ? 'NON_EUROPEAN_ROW_MANN_ONLY_FRAM_NOT_CONFIRMED' : 'FRAM_OFFICIAL_EVIDENCE_DOES_NOT_CONFIRM_ROW_IDENTITY'; }
    } else { state = 'BLOCKED_APPLICATION_CONFLICT'; reason = `ORIGIN_GROUP_${og}`; }

    if (approved) {
      const coll = collision(p.sku, approved);
      if (coll.length) { state = 'BLOCKED_CANONICAL_COLLISION'; reason = 'APPROVED_CODE_OWNED_BY:' + coll.join(','); approved = null; }
      else if (!suffixOk(p.sku, approved)) { state = 'BLOCKED_RESOLVER_CONFLICT'; reason = 'SKU_SUFFIX_DOES_NOT_MATCH_APPROVED_CODE'; approved = null; }
      else state = 'COMPLETE_VERIFIED';
    }
    rec.state = state; rec.reason = reason || null;
    if (state === 'COMPLETE_VERIFIED') {
      rec.approved = { manufacturer: authority, codigo_base: approved, origin_group: og, source_url: evidence.url,
        evidence: authority === 'MANN-FILTER'
          ? { method: 'MANN_OFFICIAL_PRODUCT_PAGE_OE_AND_GEOMETRY', product_type: evidence.product_type, official_mm: { a: evidence.mann_a_mm, h: evidence.mann_h_mm }, geometry: evidence.geometry, oe_matches: evidence.oe_matches, row_oe_count: p.oem_count }
          : { method: 'FRAM_OFFICIAL_PRODUCT_PAGE_GEOMETRY_AND_APPLICATION', fuel_type: evidence.fuel_type, official_mm: { od: evidence.od_mm, h: evidence.height_mm }, geometry: evidence.geometry, make_overlap: evidence.make_overlap } };
      if (authority === 'MANN-FILTER' && (p.oe_search_candidates || []).map(packBase).includes(approved)) rec.approved.evidence.oe_search_sourced = true;
      rec.approved.evidence_hash = crypto.createHash('sha256').update(JSON.stringify(rec.approved)).digest('hex');
    }
    out.push(rec);
    process.stderr.write('.');
  }
  fs.writeFileSync(FRAM_CACHE, JSON.stringify(framCache));
  const counts = out.reduce((a, r) => ((a[r.state] = (a[r.state] || 0) + 1), a), {});
  fs.writeFileSync(`${S}/ld_e${BATCH}_manifest.json`, JSON.stringify({ batch: `LD-E${BATCH}`, oe_search_candidates_used: probe.some((p) => (p.oe_search_candidates || []).length), generated_at: new Date().toISOString(), counts, records: out }, null, 1));
  console.log('\n' + JSON.stringify(counts));
  for (const r of out) if (r.state === 'COMPLETE_VERIFIED') console.log(r.sku, r.current_codigo_base, '->', r.approved.manufacturer, r.approved.codigo_base, r.origin_group_derived, JSON.stringify(r.approved.evidence).slice(0, 200));
})();
