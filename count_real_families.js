const fs = require("fs");

const families = {};

for (const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)) {

 if (!line.trim()) continue;

 const p = JSON.parse(line);

 const family = p.sku.split(/[\s\/]/)[0].replace(/[^A-Z]/g,'');

 families[family] = (families[family] || 0) + 1;
}

console.table(
 Object.entries(families)
   .sort((a,b)=>b[1]-a[1])
   .slice(0,50)
);

