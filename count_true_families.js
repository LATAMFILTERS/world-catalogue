const fs = require("fs");

const fam = {};

for (const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)) {

  if (!line.trim()) continue;

  const p = JSON.parse(line);

  const sku = p.sku.replace("_MANN-FILTER","");

  const m = sku.match(/^[A-Z]+/);

  const family = m ? m[0] : "UNKNOWN";

  fam[family] = (fam[family] || 0) + 1;
}

console.table(
  Object.entries(fam)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,60)
);

