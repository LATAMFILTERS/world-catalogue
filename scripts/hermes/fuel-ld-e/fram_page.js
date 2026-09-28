'use strict';
// FRAM official product resolver. Identity and specs come from the fram.com catalog GraphQL (exact SKU);
// vehicle makes come from the product page when it is reachable (fram.com rate-limits HTML: makes=null then, fail-closed).
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const QUERY = 'query($s:String!){products(filter:{sku:{eq:$s}}){items{sku name url_key custom_attributesV2{items{code ... on AttributeValue{value}}}}}}';
const inchToMm = (v) => { const m = String(v || '').match(/([0-9.]+)\s*\(in\.\)/); return m ? +(Number(m[1]) * 25.4).toFixed(1) : null; };

async function framPage(code) {
  let item;
  try {
    const r = await fetch('https://www.fram.com/graphql', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { s: String(code).toUpperCase() } }), signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { found: false, lookup_error: `HTTP_${r.status}` };
    item = ((await r.json())?.data?.products?.items || []).find((i) => norm(i.sku) === norm(code));
  } catch (e) { return { found: false, lookup_error: e.message }; }
  if (!item) return { found: false };
  const attr = Object.fromEntries((item.custom_attributesV2?.items || []).map((a) => [a.code, a.value]));
  const url = `https://www.fram.com/${item.url_key}`;
  let makes = null;
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const t = r.ok ? text(await r.text()) : '';
    const i = t.indexOf('This Item Fits the Following Vehicles:');
    if (i >= 0) makes = [...new Set([...t.slice(i + 39, i + 40000).matchAll(/(?:19|20)[0-9][0-9] ([A-Z][A-Za-z-]+)/g)].map((m) => m[1].toUpperCase()))].filter((m) => m !== 'PREMIUM');
  } catch (_) { /* makes stay null */ }
  return { found: true, url, title: item.name, sku: item.sku, fuel: /fuel|diesel/i.test(item.name || ''), fuel_type: attr.fuel_type || null,
    height_mm: inchToMm(attr.height), od_mm: inchToMm(attr.outside_diameter), makes: makes || [], makes_available: makes !== null };
}
module.exports = { framPage };
if (require.main === module) (async () => { for (const c of process.argv.slice(2)) console.log(c, JSON.stringify(await framPage(c))); })();
