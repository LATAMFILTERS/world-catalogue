const fs = require("fs");

let count = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/)) {

  if (!line.trim()) continue;

  const p = JSON.parse(line);

  if (count < 20)
    console.log(p.sku);

  count++;
}

console.log("TOTAL", count);

