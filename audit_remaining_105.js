const fs = require("fs");

const counts = {};

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if (p.filter_type)
    continue;

  const sku = (p.sku || "").toUpperCase();

  if (/^(HU|W|WP|H|CU|CUK|WK|PU|PUK|C|CF|CP)/.test(sku))
    continue;

  const prefix = sku.replace(/[0-9].*$/,"");

  counts[prefix] = (counts[prefix] || 0) + 1;
}

Object.entries(counts)
.sort((a,b)=>b[1]-a[1])
.forEach(([k,v])=>console.log(v.toString().padStart(6),k));
