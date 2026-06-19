const fs = require("fs");

let total = 0;

let families = {};

const lines = fs.readFileSync(
"C:\\mann\\mann_ld_elimfilters.jsonl",
"utf8"
).trim().split("\n");

for(const line of lines){

  const p = JSON.parse(line);

  total++;

  families[p.family] =
      (families[p.family] || 0) + 1;
}

console.log("TOTAL",total);

console.table(families);
