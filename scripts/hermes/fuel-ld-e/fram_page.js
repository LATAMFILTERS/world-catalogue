'use strict';
// FRAM official product page resolver (slug patterns observed on fram.com).
const KINDS = ['fuel-filter-in-line', 'diesel-filter-in-line', 'fuel-filter-spin-on', 'diesel-filter-spin-on', 'fuel-filter-cartridge', 'diesel-filter-cartridge', 'fuel-water-separator-spin-on', 'fuel-water-separator-cartridge', 'diesel-fuel-water-separator-spin-on', 'fuel-filter', 'diesel-filter'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
async function framPage(code) {
  const c = String(code).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const url of [`https://www.fram.com/fuel-filter-${c}`, ...KINDS.map((k) => `https://www.fram.com/fram-${k}-${c}`)]) {
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (!r.ok) continue;
      const t = text(await r.text());
      const title = (t.match(/FRAM [A-Z0-9-]+ [^|]*? \| FRAM/) || [])[0] || null;
      const sku = (t.match(/SKU ([A-Z0-9-]+) More Information/i) || [])[1];
      if (norm(sku) !== norm(code)) continue;
      const inch = (label) => { const m = t.match(new RegExp(label + ' ([0-9.]+) [(]in[.][)]', 'i')); return m ? +(Number(m[1]) * 25.4).toFixed(1) : null; };
      const i = t.indexOf('This Item Fits the Following Vehicles:');
      const apps = i >= 0 ? t.slice(i + 39, i + 40000) : '';
      const makes = [...new Set([...apps.matchAll(/(?:19|20)[0-9][0-9] ([A-Z][A-Za-z-]+)/g)].map((m) => m[1].toUpperCase()))].filter((m) => m !== "PREMIUM");
      return { found: true, url: r.url, title, sku, fuel_type: (t.match(/Fuel Type (\w+)/) || [])[1] || null,
        height_mm: inch('Height'), od_mm: inch('Outside Diameter'), thread: (t.match(/Thread Size ([^ ]+(?: [^ ]+)?) /) || [])[1] || null,
        makes, spec_text: t.slice(t.indexOf('More Information'), t.indexOf('Description', t.indexOf('More Information'))).slice(0, 600) };
    } catch (_) { /* next */ }
  }
  return { found: false };
}
module.exports = { framPage };
if (require.main === module) (async () => { for (const c of process.argv.slice(2)) console.log(c, JSON.stringify(await framPage(c))); })();
