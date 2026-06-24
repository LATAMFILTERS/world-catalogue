const fs = require("fs");

const s = new Set();

for(const file of [
 "C:\\mann\\mann_master.jsonl",
 "C:\\mann\\mann_master_gaps.jsonl"
]){

 for(const line of fs.readFileSync(file,"utf8").split(/\r?\n/)){

  if(!line.trim()) continue;

  const p = JSON.parse(line);

  s.add(p.sku);
 }
}

console.log("UNIQUE",s.size);

