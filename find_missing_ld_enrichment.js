const fs = require("fs");

const ld = new Set();
const enriched = new Set();

for(const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/)){
 if(!line.trim()) continue;
 ld.add(JSON.parse(line).sku);
}

for(const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)){
 if(!line.trim()) continue;
 enriched.add(JSON.parse(line).sku.replace("_MANN-FILTER",""));
}

const missing = [];

for(const sku of ld){

 if(!enriched.has(sku))
   missing.push(sku);
}

console.log("MISSING", missing.length);

console.table(missing.slice(0,100));

