#!/usr/bin/env node
// Converts the overnight Donaldson capture batches (out/donaldson-recapture/batch-*.json: per code status, source_url,
// description and the product page HTML tables) into productos.json format, so the existing loaders can use it:
//   donaldson-local-reconcile.mjs --file, donaldson-local-dimensions.mjs --file,
//   repair-catalog-completeness-from-donaldson.js --capture.
// Output: out/donaldson-recapture/productos-overnight.json
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('out', 'donaldson-recapture');
const out = [];
for (const f of fs.readdirSync(dir).filter((x) => /^batch-\d+\.json$/.test(x)).sort()) {
  for (const r of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
    const attributes = {}; let xref = []; let eq = [];
    for (const tb of r.tables || []) {
      const head = (tb[0] || []).join('|');
      if (/^Manufacturer Name\|Manufacturer Part/.test(head)) { xref = tb.slice(1).map((x) => x.filter((y) => y !== '')).filter((x) => x.length >= 2); continue; }
      if (/^Equipment\|Year\|Equipment Type/.test(head)) { eq = tb.slice(1).map((x) => x.slice(0, 6)); continue; }
      if (tb.every((x) => x.length === 2 && x[0])) for (const [k, v] of tb) attributes[k] = v;
    }
    const ok = r.status === 'EXTRAIDO' && Object.keys(attributes).length > 0;
    out.push({ requested_code: r.requested_code, status: ok ? 'EXTRAIDO' : r.status === 'EXTRAIDO' ? 'PARCIAL' : r.status, source_url: r.source_url, scraped_at: r.scraped_at,
      official: { part_number: r.requested_code, description: r.description || '', attributes, cross_references_raw: xref, equipment_raw: eq, related_parts: r.related_parts || [], alternatives: [] },
      audit: { capture: 'Claude overnight capture, ELIMSERVER Chrome, ' + f, sku: r.sku } });
  }
}
fs.writeFileSync(path.join(dir, 'productos-overnight.json'), JSON.stringify(out, null, 1));
const by = out.reduce((m, r) => { m[r.status] = (m[r.status] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ records: out.length, by_status: by, with_xref: out.filter((r) => r.official.cross_references_raw.length).length,
  with_equipment: out.filter((r) => r.official.equipment_raw.length).length, file: path.join(dir, 'productos-overnight.json') }));
