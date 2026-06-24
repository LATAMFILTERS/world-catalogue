const fs = require("fs");

let total=0;
let withOEM=0;

for(const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)){

 if(!line.trim()) continue;

 total++;

 const p = JSON.parse(line);

 if(p.oe_numbers && p.oe_numbers.length)
   withOEM++;
}

console.table([{total,withOEM}]);

