const fs = require("fs");

const s = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8").split(/\r?\n/)) {

 if (!line.trim()) continue;

 const p = JSON.parse(line);

 s.add(p.sku);
}

console.log("UNIQUE", s.size);

