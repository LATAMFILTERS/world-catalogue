const fs = require("fs");

const gaps = new Set();

for(const line of fs.readFileSync("C:\\mann\\mann_master_gaps.jsonl","utf8").split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 gaps.add(p.sku.replace("_MANN-FILTER",""));
}

let found = 0;

for(const sku of [
 "C10012",
 "C100504",
 "C1006",
 "C1057",
 "C1110",
 "C11102",
 "C1112",
 "C12114",
 "C13010",
 "C14012"
]){

 if(gaps.has(sku)){
   console.log("FOUND",sku);
   found++;
 } else {
   console.log("MISS",sku);
 }
}

console.log("FOUND_TOTAL",found);

