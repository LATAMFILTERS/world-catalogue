const fs = require("fs");

const file = "C:\\mann\\mann_catalog_ld.jsonl";

const counts = {};

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const type = p.filter_type || "UNKNOWN";

  counts[type] = (counts[type] || 0) + 1;
}

console.log(counts);
