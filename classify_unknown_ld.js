const fs = require("fs");

const counts = {};

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if (p.filter_type)
    continue;

  const sku = (p.sku || "").toUpperCase();

  let t = "UNCLASSIFIED";

  if (/^(HU|HU|W|WP)/.test(sku))
    t = "Oil Filter";

  else if (/^(CUK|CU)/.test(sku))
    t = "Cabin Filter";

  else if (/^(WK|PU|PUK)/.test(sku))
    t = "Fuel Filter";

  else if (/^(C|CF|CP)/.test(sku))
    t = "Air Filter";

  counts[t] = (counts[t] || 0) + 1;
}

console.log(counts);
