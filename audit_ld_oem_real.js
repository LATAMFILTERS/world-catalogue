const fs = require("fs");

const ld = new Set();

for(const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/)){

 if(!line.trim()) continue;

 ld.add(JSON.parse(line).sku);
}

let total=0;
let withOEM=0;

for(const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)){

 if(!line.trim()) continue;

 const p=JSON.parse(line);

 const sku=p.sku.replace("_MANN-FILTER","");

 if(!ld.has(sku))
   continue;

 total++;

 if(p.oe_numbers?.length)
   withOEM++;
}

console.table([{total,withOEM}]);

