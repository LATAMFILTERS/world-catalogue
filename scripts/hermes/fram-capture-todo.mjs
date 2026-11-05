#!/usr/bin/env node
// READ-ONLY. Builds the FRAM capture queue for non-European LD SKUs (LD rule: non-European -> FRAM base) from the
// latest ld-base-classification file:
//   FRAM_SAME_DIGITS            candidates = FRAM codes on the SKU with the SKU's last four digits (verify on fram.com)
//   FRAM_OTHER_DIGITS           candidates = FRAM codes on the SKU (review: digits differ)
//   NON_EUROPEAN_NO_FRAM_CODE   no FRAM code: look up up to 4 OEM codes in FRAM's interchange search
// Output: out/fram/todo.json [{sku, cls, candidates[], oems[]}]
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('out', 'ld-base-classification');
const f = fs.readdirSync(dir).filter((x) => /^classification-.*\.json$/.test(x)).sort().pop();
const rows = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).rows;
const want = new Set(['FRAM_SAME_DIGITS', 'FRAM_OTHER_DIGITS', 'NON_EUROPEAN_NO_FRAM_CODE']);
const todo = rows.filter((r) => want.has(r.cls)).map((r) => ({ sku: r.sku, cls: r.cls,
  candidates: r.cls === 'FRAM_SAME_DIGITS' ? r.same_digit_fram : r.cls === 'FRAM_OTHER_DIGITS' ? r.fram_codes : [],
  oems: (r.oem_codes || []).slice(0, 4) })); // OEM fallback for every class (old FRAM codes may be gone from fram.com)
fs.mkdirSync(path.resolve('out', 'fram'), { recursive: true });
fs.writeFileSync(path.resolve('out', 'fram', 'todo.json'), JSON.stringify(todo));
const by = todo.reduce((m, t) => { m[t.cls] = (m[t.cls] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ source: f, todo: todo.length, by, no_oem_no_candidate: todo.filter((t) => !t.candidates.length && !t.oems.length).length }));
