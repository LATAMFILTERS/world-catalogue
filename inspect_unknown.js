const fs = require("fs");

const bad = [];

for (const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)) {

  if (!line.trim()) continue;

  const p = JSON.parse(line);

  const sku = p.sku.replace("_MANN-FILTER","");

  const m = sku.match(/^[A-Z]+/);

  if (!m) {
    bad.push(sku);
    if (bad.length >= 100) break;
  }
}

console.table(bad);

