const fs = require("fs");

const master = new Set();

for(const file of [
 "C:\\mann\\mann_master.jsonl",
 "C:\\mann\\mann_master_gaps.jsonl"
]){
 for(const line of fs.readFileSync(file,"utf8").split(/\r?\n/)){
  if(!line.trim()) continue;
  master.add(JSON.parse(line).sku);
 }
}

let found = 0;

for(const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 if(master.has(p.sku))
   found++;
}

console.log("MASTER", master.size);
console.log("FOUND_IN_ENRICHED", found);

