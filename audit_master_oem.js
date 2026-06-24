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

console.log("MASTER",master.size);

let withOEM = 0;

for(const file of [
 "C:\\mann\\mann_master.jsonl",
 "C:\\mann\\mann_master_gaps.jsonl"
]){

 for(const line of fs.readFileSync(file,"utf8").split(/\r?\n/)){

  if(!line.trim()) continue;

  const p = JSON.parse(line);

  if(p.oe_numbers?.length)
    withOEM++;
 }
}

console.log("WITH_OEM",withOEM);

