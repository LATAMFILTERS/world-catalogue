const fs = require("fs");

let withRefs = 0;
let total = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)) {

 if (!line.trim()) continue;

 const p = JSON.parse(line);

 total++;

 if (Array.isArray(p.references) && p.references.length)
   withRefs++;
}

console.table([{total,withRefs}]);

