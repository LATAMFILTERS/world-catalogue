'use strict';
// LD-OE: official MANN cross-reference search (public catalog GraphQL used by mann-filter.com) per OE number.
// Produces CANDIDATES only; verification still goes through mann_probe.js -> classify.js -> run_130.
// Usage: node mann_oe_candidates.js <label> <manifest1.json> [...]  -> $FUEL_LD_E_WORK/oe_<label>_candidates.json
const fs = require('fs');
const path = require('path');
const S = process.env.FUEL_LD_E_WORK || __dirname;
const ENDPOINT = 'https://www.mann-filter.com/api/graphql/catalog-prod';
const QUERY = 'query($s:String!){search_crossreference_no(search:$s,pageSize:50,currentPage:1){total_count items{ext_brand_name ext_product_name int_product_identifier sales_designation aa_product_family int_is_placeholder}}}';
const [label, ...manifests] = process.argv.slice(2);
const rows = new Map(require(path.join(S, 'ld721.json')).map((r) => [r.sku, r]));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lookup(oe) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: QUERY, variables: { s: oe } }), signal: AbortSignal.timeout(20000) });
      if (r.ok) return (await r.json())?.data?.search_crossreference_no?.items || [];
    } catch (_) { /* retry */ }
    await sleep(2000 * (attempt + 1));
  }
  return null;
}

(async () => {
  const targets = manifests.flatMap((m) => require(path.resolve(m)).records)
    .filter((r) => r.state !== 'COMPLETE_VERIFIED' && r.origin_group_derived === 'EUROPEAN');
  const out = {};
  for (const t of targets) {
    const row = rows.get(t.sku);
    const oes = [...new Map((row.oem_codes || []).map((o) => [norm(o.code), String(o.code).trim()])).entries()].filter(([n]) => n.length >= 6);
    const support = {};
    const errors = [];
    for (const [n, raw] of oes) {
      const items = await lookup(raw);
      await sleep(700); // ponytail: fixed pacing; add adaptive backoff if the endpoint starts rate-limiting
      if (items === null) { errors.push(raw); continue; }
      for (const it of items) {
        if (it.int_is_placeholder || !/fuel/i.test(it.aa_product_family || '')) continue;
        if (norm(it.ext_product_name) !== n) continue; // exact OE match only
        const code = String(it.int_product_identifier || '').replace(/_MANN-FILTER$/i, '');
        (support[code] = support[code] || []).push(n);
      }
    }
    out[t.sku] = { oe_queried: oes.length, oe_errors: errors, candidates: Object.fromEntries(Object.entries(support).map(([c, v]) => [c, [...new Set(v)]])) };
    process.stderr.write('.');
  }
  fs.writeFileSync(path.join(S, `oe_${label}_candidates.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ label, targets: targets.length, with_candidates: Object.values(out).filter((x) => Object.keys(x.candidates).length).length }));
})();
